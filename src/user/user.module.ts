import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { FileSystem } from 'src/file-system/entities/file-system.entity';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from 'src/file-system/services/multer.config.service';
import { ConfigModule } from '@nestjs/config';
import { RoleModule } from 'src/role/role.module';
import { FileSystemModule } from 'src/file-system/file-system.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FileSystem, Role]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useClass: MulterConfigService,
    }),
    RoleModule,
    FileSystemModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
