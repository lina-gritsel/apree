import { parseAttachments, taskInclude } from './attachments';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

  create({ attachments = [], ...data }: CreateTaskDto) {
    const { uploads } = parseAttachments(attachments, false);
    return this.prisma.task.create({
      data: { ...data, attachments: { create: uploads } },
      include: taskInclude,
    });
  }

  async download(taskId: string, id: string) {
    const attachment = await this.prisma.attachment.findFirst({ where: { id, taskId } });
    if (!attachment) throw new NotFoundException('Вложение не найдено');
    return attachment;
  }

  async update(id: string, data: UpdateTaskDto) {
    try {
      const { attachments, ...fields } = data;
      if (attachments === undefined) {
        return await this.prisma.task.update({ where: { id }, data: fields, include: taskInclude });
      }
      const { retained, uploads } = parseAttachments(attachments, true);
      return await this.prisma.$transaction(async (tx) => {
        const owned = await tx.attachment.count({ where: { taskId: id, id: { in: retained } } });
        if (owned !== retained.length)
          throw new BadRequestException('Вложение не принадлежит этой задаче');
        return tx.task.update({
          where: { id },
          data: {
            ...fields,
            attachments: { deleteMany: { id: { notIn: retained } }, create: uploads },
          },
          include: taskInclude,
        });
      });
    } catch (error) {
      this.rethrowNotFound(error);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.task.delete({ where: { id } });
    } catch (error) {
      this.rethrowNotFound(error);
    }
  }

  private rethrowNotFound(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundException('Задача не найдена');
    }
    throw error;
  }
}
