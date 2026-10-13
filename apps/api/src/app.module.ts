import { Controller, Get, Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';

@Controller('health')
class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}

@Module({ imports: [TasksModule], controllers: [HealthController] })
export class AppModule {}
