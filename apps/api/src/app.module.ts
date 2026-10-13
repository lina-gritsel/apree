import { HealthController } from './health.controller';
import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';

@Module({ imports: [TasksModule, UsersModule], controllers: [HealthController] })
export class AppModule {}
