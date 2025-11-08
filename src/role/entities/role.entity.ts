import { AppUser } from 'src/app_user/entities/app_user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { RoleEnum } from 'src/enums/role.enum';
import { Column, Entity, Index, Unique, OneToMany } from 'typeorm';

@Index(['name']) // Optional but helpful if you're querying roles by name
@Unique(['name']) // Enforce uniqueness (e.g., ADMIN, USER)
@Entity('role')
export class Role extends BaseEntity {
  @Column({
    type: 'enum',
    enum: RoleEnum,
    nullable: true,
  })
  name: RoleEnum;

  @Column({ type: 'varchar', length: 100, nullable: false })
  description: string;

  @OneToMany(() => AppUser, (appUser) => appUser.role, {
    cascade: ['insert', 'recover'],
    // Usually false, unless you want Role to control AppUser lifecycle
  })
  appUsers: AppUser[];
}
