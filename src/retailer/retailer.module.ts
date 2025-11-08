import { Module } from '@nestjs/common';
import { RetailerService } from './retailer.service';
import { RetailerController } from './retailer.controller';
import { RetailerAdminController } from './retailer-admin.controller';
import { RetailerAssignmentController } from './retailer-assignment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Retailer } from './entities/retailer.entity';
import { SalesRepRetailer } from 'src/sales_rep/entities/sales-rep-retailer.entity';
import { SalesRep } from 'src/sales_rep/entities/sales-rep.entity';
import { Region } from 'src/region/entities/region.entity';
import { Area } from 'src/area/entities/area.entity';
import { Distributor } from 'src/distributor/entities/distributor.entity';
import { Territory } from 'src/territory/entities/territory.entity';
import { CachingModule } from 'src/caching/caching.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Retailer,
      SalesRep,
      SalesRepRetailer,
      Region,
      Area,
      Distributor,
      Territory,
    ]),
    CachingModule,
    AuthModule,
  ],
  controllers: [
    RetailerController,
    RetailerAdminController,
    RetailerAssignmentController,
  ],
  providers: [RetailerService],
  exports: [RetailerService],
})
export class RetailerModule {}

