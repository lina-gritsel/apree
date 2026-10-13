import { IsEnum, IsNotEmpty, IsString, MaxLength, NotContains, ValidateIf } from 'class-validator';
import { TaskExtrasDto } from './task-extras.dto';
import { Transform } from 'class-transformer';
import { Priority, Status } from '@prisma/client';

export class CreateTaskDto extends TaskExtrasDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @NotContains('\0')
  @IsNotEmpty()
  @MaxLength(160)
  title!: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @NotContains('\0')
  @MaxLength(5000)
  description?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(Priority)
  priority?: Priority;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(Status)
  status?: Status;
}
