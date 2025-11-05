import { BaseEntity } from 'src/common/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('files')
export class FileSystem extends BaseEntity {
  @Column({ type: 'varchar' })
  originalName: string; // original file name

  @Column({ type: 'varchar' })
  fileName: string; // stored filename

  @Column({ type: 'varchar' })
  path: string; // file path on disk

  @Column({ type: 'varchar' })
  mimetype: string;

  @Column('bigint')
  size: number;

  @Column({ nullable: true })
  userId?: string; // optional uploader ID
}
