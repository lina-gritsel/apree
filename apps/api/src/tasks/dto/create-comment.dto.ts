import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  NotContains,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { AttachmentDto } from './attachment.dto';
import { Transform, Type } from 'class-transformer';

export class CreateCommentDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @NotContains('\0')
  @IsNotEmpty()
  @MaxLength(5000)
  body!: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}
