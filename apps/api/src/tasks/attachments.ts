import { BadRequestException } from '@nestjs/common';
import { AttachmentDto } from './dto/task-extras.dto';

export const attachmentMetadata = { id: true, name: true, contentType: true, size: true } as const;
export const activityInclude = {
  attachments: { select: attachmentMetadata, orderBy: { createdAt: 'asc' as const } },
};
export const taskInclude = {
  assignee: true,
  attachments: {
    where: { taskActivityId: null },
    select: attachmentMetadata,
    orderBy: { createdAt: 'asc' as const },
  },
};
export const MAX_FILE_SIZE = 2 * 1024 * 1024;

export function parseAttachments(inputs: AttachmentDto[], allowExisting: boolean) {
  const retained: string[] = [];
  const uploads: {
    name: string;
    contentType: string;
    data: Uint8Array<ArrayBuffer>;
    size: number;
  }[] = [];
  for (const input of inputs) {
    if (input.id !== undefined) {
      if (
        !allowExisting ||
        input.name !== undefined ||
        input.contentType !== undefined ||
        input.dataBase64 !== undefined ||
        retained.includes(input.id)
      ) {
        throw new BadRequestException('Некорректная ссылка на вложение');
      }
      retained.push(input.id);
      continue;
    }
    const { name, contentType, dataBase64 } = input;
    if (
      !name?.trim() ||
      // Filenames must not contain control characters or path separators.
      // eslint-disable-next-line no-control-regex
      /[\x00-\x1f\x7f/\\]/.test(name) ||
      !contentType ||
      /[\r\n]/.test(contentType) ||
      typeof dataBase64 !== 'string'
    ) {
      throw new BadRequestException('Укажите имя, тип и содержимое файла');
    }
    const data = Buffer.from(dataBase64, 'base64');
    if (data.toString('base64') !== dataBase64)
      throw new BadRequestException('Некорректный base64 файла');
    if (data.length > MAX_FILE_SIZE)
      throw new BadRequestException('Максимальный размер файла — 2 МБ');
    uploads.push({ name: name.trim(), contentType, data: new Uint8Array(data), size: data.length });
  }
  return { retained, uploads };
}
