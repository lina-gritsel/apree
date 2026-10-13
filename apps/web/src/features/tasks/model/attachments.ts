import type { Attachment, AttachmentInput } from './types';
export type DraftAttachment =
  | (Attachment & { dataBase64?: never })
  | { name: string; contentType: string; dataBase64: string; size: number; id?: never };
export const attachmentPayload = (files: DraftAttachment[]): AttachmentInput[] =>
  files.map((file) =>
    file.id !== undefined
      ? { id: file.id }
      : { name: file.name, contentType: file.contentType, dataBase64: file.dataBase64 },
  );
export function readAttachment(file: File): Promise<DraftAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать файл «' + file.name + '».'));
    reader.onload = () =>
      resolve({
        name: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size,
        dataBase64: String(reader.result).split(',')[1],
      });
    reader.readAsDataURL(file);
  });
}
