import { Injectable } from '@nestjs/common';
// import { UpdateFileSystemDto } from '../dto/update-file-system.dto';
import { CreateFileDto } from '../dto/create-file-system.dto';
import { DataSource, DeepPartial, EntityManager } from 'typeorm';
import type { Express } from 'express';
import { FileSystem } from '../entities/file-system.entity';
import { MulterConfigService } from './multer.config.service';

@Injectable()
export class FileSystemService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly multerService: MulterConfigService,
  ) {}

  async createFilesFromMulter(
    files: Express.Multer.File[],
    userId?: string,
    manager?: EntityManager,
  ): Promise<FileSystem[]> {
    const fileDtos: CreateFileDto[] = files.map((file) => ({
      originalName: file.originalname,
      fileName: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      userId: userId || undefined,
    }));

    const queryRunner = manager
      ? undefined
      : this.dataSource.createQueryRunner();
    const em = manager ?? queryRunner?.manager;

    if (!manager) {
      await queryRunner?.connect();
      await queryRunner?.startTransaction();
    }

    try {
      // ✅ Cast DTO to DeepPartial<FileSystem>
      const newFiles: FileSystem[] = fileDtos.map((dto) =>
        em!.create(FileSystem, dto as DeepPartial<FileSystem>),
      );

      const savedFiles = await Promise.all(newFiles.map((f) => em!.save(f)));
      if (!manager) {
        await queryRunner?.commitTransaction();
      }
      return savedFiles;
    } catch (error) {
      if (!manager) {
        await queryRunner?.rollbackTransaction();
      }
      const filePaths = files.map((file) => file.path);
      await this.multerService.rmvFiles(filePaths);
      throw error;
    } finally {
      if (!manager) {
        await queryRunner?.release();
      }
    }
  }

  async createFileFromMulter(
    file: Express.Multer.File,
    userId?: string,
    manager?: EntityManager,
  ): Promise<FileSystem> {
    const fileDto: CreateFileDto = {
      originalName: file.originalname,
      fileName: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      userId: userId || undefined,
    };

    const queryRunner = manager
      ? undefined
      : this.dataSource.createQueryRunner();
    const em = manager ?? queryRunner?.manager;

    if (!manager) {
      await queryRunner?.connect();
      await queryRunner?.startTransaction();
    }

    try {
      // ✅ Cast DTO to DeepPartial<FileSystem>
      const newFile: FileSystem = em!.create(
        FileSystem,
        fileDto as DeepPartial<FileSystem>,
      );

      const savedFiles = await em!.save(newFile);

      if (!manager) {
        await queryRunner?.commitTransaction();
      }

      return savedFiles;
    } catch (error) {
      if (!manager) {
        await queryRunner?.rollbackTransaction();
      }
      if (file.path) {
        await this.multerService.rmvFile(file.path);
      }
      throw error;
    } finally {
      if (!manager) {
        await queryRunner?.release();
      }
    }
  }
}
