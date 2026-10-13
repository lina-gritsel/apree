import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

const colors = ['#7c6ee6', '#39866f', '#ba665c', '#b28336', '#497fb3', '#a65c91'];

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.workspaceUser.findMany({ orderBy: [{ name: 'asc' }, { id: 'asc' }] });
  }

  create(name: string) {
    const color = colors[createHash('sha256').update(name).digest()[0] % colors.length];
    return this.prisma.workspaceUser.create({ data: { name, color } });
  }
}
