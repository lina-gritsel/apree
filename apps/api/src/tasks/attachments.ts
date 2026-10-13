import { BadRequestException } from '@nestjs/common';

import type { AttachmentInput } from './attachment-input';

export const MAX_FILE_SIZE = 2 * 1024 * 1024;

interface UploadedAttachment {
  name: string;
  contentType: string;
  data: Uint8Array<ArrayBuffer>;
  size: number;
}

export interface ParsedAttachments {
  retained: string[];
  uploads: UploadedAttachment[];
}

export function parseAttachments(
  inputs: readonly AttachmentInput[],
  allowExisting: boolean,
): ParsedAttachments {
  const retained: string[] = [];
  const uploads: UploadedAttachment[] = [];
  for (const input of inputs) {
    if (input.id === undefined) uploads.push(decodeUpload(input));
    else retained.push(validateExistingAttachment(input, allowExisting, retained));
  }
  return { retained, uploads };
}

function validateExistingAttachment(
  input: AttachmentInput,
  allowExisting: boolean,
  retained: readonly string[],
): string {
  const hasUpload =
    input.name !== undefined || input.contentType !== undefined || input.dataBase64 !== undefined;
  if (!allowExisting || input.id === undefined || hasUpload || retained.includes(input.id)) {
    throw new BadRequestException('Некорректная ссылка на вложение');
  }
  return input.id;
}

function decodeUpload({ name, contentType, dataBase64 }: AttachmentInput): UploadedAttachment {
  if (
    !name?.trim() ||
    hasUnsafeFilename(name) ||
    !contentType ||
    /[\r\n]/.test(contentType) ||
    typeof dataBase64 !== 'string'
  ) {
    throw new BadRequestException('Укажите имя, тип и содержимое файла');
  }
  const data = decodeBase64(dataBase64);
  return { name: name.trim(), contentType, data: new Uint8Array(data), size: data.length };
}

function hasUnsafeFilename(name: string): boolean {
  // Filenames must not contain control characters or path separators.
  // eslint-disable-next-line no-control-regex
  return /[\x00-\x1f\x7f/\\]/.test(name);
}

function decodeBase64(encoded: string): Buffer {
  const data = Buffer.from(encoded, 'base64');
  if (data.toString('base64') !== encoded)
    throw new BadRequestException('Некорректный base64 файла');
  if (data.length > MAX_FILE_SIZE)
    throw new BadRequestException('Максимальный размер файла — 2 МБ');
  return data;
}

export function validateRetainedAttachments(
  retained: readonly string[],
  owned: readonly { id: string }[],
): void {
  const ownedIds = new Set(owned.map((file) => file.id));
  if (retained.some((id) => !ownedIds.has(id))) {
    throw new BadRequestException('Вложение не принадлежит этой задаче');
  }
}
