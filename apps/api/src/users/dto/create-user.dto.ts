import { IsNotEmpty, IsString, MaxLength, NotContains } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @NotContains('\0')
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;
}
