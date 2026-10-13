import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  NotContains,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { AttachmentDto } from './attachment.dto';
import { Transform, Type } from 'class-transformer';

export class TaskExtrasDto {
  @ValidateIf((_object, value: unknown) => value !== undefined && value !== null)
  @IsUUID()
  assigneeId?: string | null;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.map((label: unknown) => (typeof label === 'string' ? label.trim() : label))
      : value,
  )
  @IsArray()
  @ArrayMaxSize(5)
  @ArrayUnique()
  @IsString({ each: true })
  @NotContains('\0', { each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(30, { each: true })
  labels?: string[];

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}
