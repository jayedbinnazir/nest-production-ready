import { PartialType } from '@nestjs/mapped-types';
import { CreateSalesRepDto } from './create-sales-rep.dto';

export class UpdateSalesRepDto extends PartialType(CreateSalesRepDto) {}

