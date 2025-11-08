import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { FileSystem } from 'src/file-system/entities/file-system.entity';
import { RoleModule } from 'src/role/role.module';
import { FileSystemModule } from 'src/file-system/file-system.module';
import { authUtilService } from 'src/utils/authUtils';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RoleModule, FileSystemModule],
  controllers: [AuthController],
  providers: [AuthService, authUtilService],
})
export class AuthModule {}
