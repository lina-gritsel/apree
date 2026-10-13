import { CreateCommentDto } from './dto/create-comment.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Header,
  StreamableFile,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  findAll() {
    return this.tasks.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasks.findOne(id);
  }

  @Get(':taskId/attachments/:attachmentId')
  @Header('X-Content-Type-Options', 'nosniff')
  async download(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
  ) {
    const attachment = await this.tasks.download(taskId, attachmentId);
    const encodedName = encodeURIComponent(attachment.name).replace(
      /['()*]/g,
      (character) => '%' + character.charCodeAt(0).toString(16),
    );
    return new StreamableFile(Buffer.from(attachment.data), {
      type: 'application/octet-stream',
      disposition: `attachment; filename="download"; filename*=UTF-8''${encodedName}`,
      length: attachment.size,
    });
  }

  @Get(':id/activity')
  activity(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasks.activity(id);
  }

  @Post(':id/comments')
  comment(@Param('id', ParseUUIDPipe) id: string, @Body() body: CreateCommentDto) {
    return this.tasks.comment(id, body.body);
  }

  @Post()
  create(@Body() body: CreateTaskDto) {
    return this.tasks.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateTaskDto) {
    return this.tasks.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasks.remove(id);
  }
}
