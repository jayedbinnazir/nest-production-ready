import { Module } from '@nestjs/common';
import { SalesRepService } from './sales-rep.service';
import { SalesRepController } from './sales-rep.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesRep } from './entities/sales-rep.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([SalesRep]), AuthModule],
  controllers: [SalesRepController],
  providers: [SalesRepService],
  exports: [SalesRepService],
})
export class SalesRepModule {}

