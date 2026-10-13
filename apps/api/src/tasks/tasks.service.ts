import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.task.findMany({ orderBy: [{ createdAt: 'desc' }, { id: 'asc' }] });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Задача не найдена');
    return task;
  }

  create(data: CreateTaskDto) {
    return this.prisma.task.create({ data });
  }

  async update(id: string, data: UpdateTaskDto) {
    try {
      return await this.prisma.task.update({ where: { id }, data });
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
