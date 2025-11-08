import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RetailerService } from './retailer.service';
import type { ListRetailerDto } from './dto/list-retailer.dto';
import type { CreateRetailerAdminDto } from './dto/create-retailer-admin.dto';
import type { AdminUpdateRetailerDto } from './dto/admin-update-retailer.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

@ApiBearerAuth('jwt-auth')
@ApiTags('Admin Retailers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller({
  path: 'v1/admin/retailers',
  version: '1',
})
export class RetailerAdminController {
  constructor(private readonly retailerService: RetailerService) {}

  @Get()
  list(@Query() query: ListRetailerDto) {
    return this.retailerService.adminListAllRetailers(query);
  }

  @Get(':id')
  detail(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.retailerService.adminGetDetail(id);
  }

  @Post()
  create(@Body() dto: CreateRetailerAdminDto) {
    return this.retailerService.adminCreate(dto);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AdminUpdateRetailerDto,
  ) {
    return this.retailerService.adminUpdate(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.retailerService.adminDelete(id);
  }

  @Post('import')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async import(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }
    return this.retailerService.importRetailersFromCsv(file.buffer);
  }
}

