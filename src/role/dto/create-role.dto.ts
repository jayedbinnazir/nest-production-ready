import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { RoleEnum } from 'src/enums/role.enum';

export class CreateRoleDto {
  @IsEnum(RoleEnum, {
    message: `Role name must be one of: ${Object.values(RoleEnum).join(', ')}`,
  })
  name: RoleEnum;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  description: string;
}
