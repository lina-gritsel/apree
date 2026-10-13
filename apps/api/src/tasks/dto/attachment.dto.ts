import { IsNotEmpty, IsString, IsUUID, MaxLength, NotContains, ValidateIf } from 'class-validator';
import type { AttachmentInput } from '../attachment-input';

export class AttachmentDto implements AttachmentInput {
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsUUID()
  id?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @NotContains('\0')
  @IsNotEmpty()
  @MaxLength(180)
  name?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @NotContains('\0')
  @IsNotEmpty()
  @MaxLength(100)
  contentType?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @NotContains('\0')
  @MaxLength(2796204)
  dataBase64?: string;
}
