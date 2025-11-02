import { Entity, Column, Unique, Index } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('users')
@Index(['email']) // Index for email lookups
@Unique(['email']) // Ensure email uniqueness
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 30, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Exclude() // Exclude password from responses
  password?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address?: string | null;

  //Google OAuth specific fields

  @Column({ type: 'varchar', length: 50, nullable: true })
  google_picture?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  provider: string | null; // 'local', 'google', etc.

  @Column({ type: 'varchar', length: 50, nullable: true })
  providerId: string | null; // Google ID, etc.

  @Column({ type: 'boolean', default: false, nullable: true })
  emailVerified?: boolean | null;
}
