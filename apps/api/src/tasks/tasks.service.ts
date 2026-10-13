import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CreateCommentDto } from './dto/create-comment.dto';
import { describeChanges } from './task-activity';
import {
  parseAttachments,
  validateRetainedAttachments,
  type ParsedAttachments,
} from './attachments';
import { activityInclude, taskInclude } from './task-selection';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.task.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      include: taskInclude,
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id }, include: taskInclude });
    if (!task) throw new NotFoundException('Задача не найдена');
    return task;
  }

  async create({ attachments = [], ...data }: CreateTaskDto) {
    await this.validateAssignee(data.assigneeId, this.prisma);
    const { uploads } = parseAttachments(attachments, false);
    try {
      return await this.prisma.task.create({
        data: {
          ...data,
          attachments: { create: uploads },
          activity: { create: { kind: 'created', message: 'Задача создана' } },
        },
        include: taskInclude,
      });
    } catch (error) {
      this.rethrowPersistenceError(error);
    }
  }

  async download(taskId: string, id: string) {
    const attachment = await this.prisma.attachment.findFirst({ where: { id, taskId } });
    if (!attachment) throw new NotFoundException('Вложение не найдено');
    return attachment;
  }

  async update(id: string, data: UpdateTaskDto) {
    try {
      const { attachments, ...fields } = data;
      const parsed = attachments === undefined ? undefined : parseAttachments(attachments, true);
      return await this.prisma.$transaction(async (tx) => {
        const before = await this.lockTask(tx, id);
        validateRetainedAttachments(parsed?.retained ?? [], before.attachments);
        await this.validateAssignee(fields.assigneeId, tx);
        const updated = await tx.task.update({
          where: { id },
          data: { ...fields, attachments: attachmentReplacement(parsed) },
          include: taskInclude,
        });
        const message = describeChanges(before, updated);
        if (message)
          await tx.taskActivity.create({ data: { taskId: id, kind: 'updated', message } });
        return updated;
      });
    } catch (error) {
      this.rethrowPersistenceError(error);
    }
  }

  async activity(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id }, select: { id: true } });
    if (!task) throw new NotFoundException('Задача не найдена');
    return this.prisma.taskActivity.findMany({
      where: { taskId: id },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      include: activityInclude,
    });
  }

  async comment(id: string, { body: message, attachments = [] }: CreateCommentDto) {
    const { uploads } = parseAttachments(attachments, false);
    try {
      return await this.prisma.taskActivity.create({
        data: {
          task: { connect: { id } },
          kind: 'comment',
          message,
          attachments: { create: uploads.map((file) => ({ ...file, taskId: id })) },
        },
        include: activityInclude,
      });
    } catch (error) {
      this.rethrowPersistenceError(error);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.task.delete({ where: { id } });
    } catch (error) {
      this.rethrowPersistenceError(error);
    }
  }

  private async lockTask(tx: Prisma.TransactionClient, id: string) {
    // Serialize edits so activity is generated from the actual previous state.
    await tx.$queryRaw(Prisma.sql`SELECT "id" FROM "Task" WHERE "id" = ${id}::uuid FOR UPDATE`);
    const task = await tx.task.findUnique({ where: { id }, include: taskInclude });
    if (!task) throw new NotFoundException('Задача не найдена');
    return task;
  }

  private async validateAssignee(
    id: string | null | undefined,
    db: Pick<Prisma.TransactionClient, 'workspaceUser'>,
  ) {
    if (id && !(await db.workspaceUser.findUnique({ where: { id }, select: { id: true } }))) {
      throw new BadRequestException('Исполнитель не найден');
    }
  }

  private rethrowPersistenceError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') throw new NotFoundException('Задача не найдена');
      if (error.code === 'P2003') {
        const field = String(error.meta?.field_name ?? '');
        if (field.includes('assigneeId')) throw new BadRequestException('Исполнитель не найден');
        if (field.includes('taskId')) throw new NotFoundException('Задача не найдена');
      }
    }
    throw error;
  }
}

function attachmentReplacement(
  parsed: ParsedAttachments | undefined,
): Prisma.AttachmentUncheckedUpdateManyWithoutTaskNestedInput | undefined {
  if (!parsed) return undefined;
  return {
    deleteMany: { taskActivityId: null, id: { notIn: parsed.retained } },
    create: parsed.uploads,
  };
}
