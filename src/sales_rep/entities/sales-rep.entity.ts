import {
  Column,
  Entity,
  Index,
  OneToMany,
  Unique,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { SalesRepRetailer } from './sales-rep-retailer.entity';
import * as bcrypt from 'bcrypt';

@Entity('sales_reps')
@Unique('UQ_SALES_REP_USERNAME', ['username'])
@Index('IDX_SALES_REP_USERNAME', ['username'])
@Index('IDX_SALES_REP_PHONE', ['phone'])
export class SalesRep extends BaseEntity {
  @Column({ type: 'varchar', length: 60 })
  username: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', name: 'last_login_at', nullable: true })
  lastLoginAt: Date | null;

  @OneToMany(() => SalesRepRetailer, (assignment) => assignment.salesRep, {
    cascade: ['remove'],
  })
  assignments: SalesRepRetailer[];

  @BeforeInsert()
  @BeforeUpdate()
  async normalizeUsername(): Promise<void> {
    if (this.username) {
      this.username = this.username.trim().toLowerCase();
    }

    if (this.password_hash && !this.password_hash.startsWith('$2')) {
      const saltRounds = Number(process.env.AUTH_SALT_ROUNDS ?? 10);
      this.password_hash = await bcrypt.hash(this.password_hash, saltRounds);
    }
  }

  async comparePassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password_hash);
  }
}

