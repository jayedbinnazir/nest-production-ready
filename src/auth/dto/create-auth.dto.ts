import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAuthDto {
  @IsString()
  @IsIn(['admin', 'sales_rep'])
  type: 'admin' | 'sales_rep';

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  identifier: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  password: string;
}
