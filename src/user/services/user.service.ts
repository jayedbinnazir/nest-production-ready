import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
// import { UpdateUserDto } from '../dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
// import { FileUpload } from 'src/files/entities/file.entity';
// import { MulterConfigService } from '../../files/services/multer.config.service';
// import { Role } from 'src/role/entities/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    // private readonly multerConfigService: MulterConfigService,
  ) {}

  async createUser(
    data: CreateUserDto,
    manager?: EntityManager,
  ): Promise<User> {
    const queryRunner = manager
      ? undefined
      : this.dataSource.createQueryRunner();
    const em = manager ?? queryRunner?.manager;

    if (!manager) {
      await queryRunner?.connect();
      await queryRunner?.startTransaction();
    }

    try {
      const user = await em?.findOne(User, {
        where: {
          email: data.email,
        },
      });

      if (user) {
        throw new HttpException(
          'User with this email already exists',
          HttpStatus.CONFLICT,
        );
      }

      const newUser = em?.create(User, {
        ...data,
      });

      const savedUser = await em?.save(newUser);

      if (!manager) {
        await queryRunner?.commitTransaction();
      }

      return savedUser as User;
    } catch (error) {
      if (!manager) {
        await queryRunner?.rollbackTransaction();
      }
      throw error; // Let global exception handler handle it
    } finally {
      if (!manager) {
        await queryRunner?.release();
      }
    }
  }

  // findAll() {
  //   return `This action returns all user`;
  // }

  // async genericfindOne(
  //   filter: Partial<Record<keyof User, string>>,
  //   deleted?: boolean,
  //   manager?: EntityManager,
  // ) {
  //   const repo = manager ? manager.getRepository(User) : this.userRepository;
  //   try {
  //     const query = repo
  //       .createQueryBuilder('user')
  //       .leftJoin('user.profile_pictures', 'profile_picture')
  //       .leftJoin('user.appUsers', 'appUsers')
  //       .leftJoin('appUsers.role', 'role')
  //       .select([
  //         'user.id',
  //         'user.name',
  //         'user.email',
  //         'user.phone',
  //         'profile_picture.id',
  //         'profile_picture.local_url',
  //         'profile_picture.public_url',
  //         'profile_picture.isActive',
  //         'appUsers.id',
  //         'role.id',
  //         'role.name',
  //         'role.description',
  //       ]);

  //     Object.entries(filter).forEach(([key, value], index) => {
  //       if (index === 0) {
  //         query.where(`user.${key} = :${key}`, { [key]: value });
  //       } else {
  //         query.andWhere(`user.${key} = :${key}`, { [key]: value });
  //       }
  //     });

  //     // Handle deleted_at flag
  //     if (deleted === false) {
  //       query.andWhere('user.deleted_at IS NULL');
  //     } else if (deleted === true) {
  //       query.andWhere('user.deleted_at IS NOT NULL');
  //     }
  //     // If deleted_at is undefined, ignore soft-delete filter

  //     const user = await query.cache(30000).getOne();

  //     if (!user) {
  //       throw new Error('User not found');
  //     }

  //     const { appUsers, ...withOutAppUser } = user;

  //     const roles = await Promise.all(
  //       appUsers.map(async (appUser) => await appUser.role),
  //     );

  //     return {
  //       ...withOutAppUser,
  //       roles: roles,
  //     };
  //   } catch (error) {
  //     console.error('Error finding user:', error);
  //     throw new Error(`Error finding user: ${error.message}`);
  //   }
  // }

  // async findByEmail(email: string, deleted: boolean = false) {
  //   try {
  //     return await this.genericfindOne({ email }, deleted);
  //   } catch (error) {
  //     throw new Error(`Error finding user by email: ${error.message}`);
  //   }
  // }

  // async update(
  //   id: string,
  //   updateUserDto: UpdateUserDto,
  //   deleted: boolean = false,
  //   manager?: EntityManager,
  // ) {
  //   const queryRunner = manager
  //     ? undefined
  //     : this.dataSource.createQueryRunner();
  //   const em = manager ?? queryRunner!.manager;

  //   if (!manager) {
  //     await queryRunner!.connect();
  //     await queryRunner!.startTransaction();
  //   }

  //   try {
  //     const user = await em.findOne(User, {
  //       where: { id },
  //       relations: ['profile_pictures'],
  //       withDeleted: deleted,
  //     });

  //     if (!user) {
  //       throw new Error('User not found');
  //     }

  //     if (updateUserDto.profile_picture) {
  //       const file = user.profile_pictures?.find(
  //         (file) => file.isActive === true,
  //       );
  //       if (file) {
  //         file.isActive = false; // Deactivate the old profile picture
  //       }

  //       const newFile = em?.create(FileUpload, {
  //         ...updateUserDto.profile_picture,
  //         isActive: true,
  //         local_url: updateUserDto.profile_picture.path,
  //         public_url: null,
  //         user: { id: user.id },
  //       });

  //       user?.profile_pictures?.push(newFile); // Add the new file to the user's profile pictures
  //     }

  //     // Remove the old profile picture if it exists
  //     const { profile_picture, ...rest } = updateUserDto;
  //     const updatedUser = em.merge(User, user, {
  //       ...rest,
  //     });

  //     const result = await em.save(updatedUser);

  //     if (!manager) await queryRunner!.commitTransaction();
  //     return result;
  //   } catch (error) {
  //     if (!manager) await queryRunner!.rollbackTransaction();
  //     throw new Error(`Error updating user: ${error.message}`);
  //   } finally {
  //     if (!manager) await queryRunner!.release();
  //   }
  // }

  // async softRemove(id: string, manager?: EntityManager) {
  //   const queryRunner = manager
  //     ? undefined
  //     : this.dataSource.createQueryRunner();
  //   const em = manager ?? queryRunner!.manager;

  //   if (!manager) {
  //     await queryRunner!.connect();
  //     await queryRunner!.startTransaction();
  //   }

  //   try {
  //     const user = await em.findOne(User, {
  //       where: { id },
  //       relations: ['appUsers', 'profile_pictures'],
  //     });

  //     if (!user) {
  //       throw new Error('User not found');
  //     }
  //     await em.softRemove(user);
  //     if (!manager) await queryRunner!.commitTransaction();
  //     return { message: 'User soft deleted successfully', userId: id };
  //   } catch (error) {
  //     if (!manager) await queryRunner!.rollbackTransaction();
  //     throw new Error(`Error soft deleting user: ${error.message}`);
  //   } finally {
  //     if (!manager) await queryRunner!.release();
  //   }
  // }

  // async recover(id: string, manager?: EntityManager) {
  //   const queryRunner = manager
  //     ? undefined
  //     : this.dataSource.createQueryRunner();
  //   const em = manager ?? queryRunner!.manager;
  //   if (!manager) {
  //     await queryRunner!.connect();
  //     await queryRunner!.startTransaction();
  //   }
  //   try {
  //     const user = await em.findOne(User, {
  //       where: { id },
  //       withDeleted: true,
  //       relations: ['profile_pictures', 'appUsers'],
  //     });
  //     if (!user) {
  //       throw new Error('User not found');
  //     }
  //     await em.recover(user);
  //     if (!manager) await queryRunner!.commitTransaction();
  //     return { message: 'User recovered successfully', userId: id };
  //   } catch (error) {
  //     if (!manager) await queryRunner!.rollbackTransaction();
  //     throw new Error(`Error recovering user: ${error.message}`);
  //   } finally {
  //     if (!manager) await queryRunner!.release();
  //   }
  // }

  // async deletUser(id: string, manager?: EntityManager) {
  //   const queryRunner = manager
  //     ? undefined
  //     : this.dataSource.createQueryRunner();
  //   const em = manager ?? queryRunner!.manager;
  //   if (!manager) {
  //     await queryRunner!.connect();
  //     await queryRunner!.startTransaction();
  //   }
  //   try {
  //     const user = await em.findOne(User, {
  //       where: { id },
  //       relations: ['profile_pictures', 'appUsers', 'appUsers.role'],
  //     });
  //     if (!user) {
  //       throw new Error('User not found');
  //     }
  //     await em.remove(user);
  //     if (!manager) await queryRunner!.commitTransaction();
  //     return { message: 'User deleted successfully', userId: id };
  //   } catch (error) {
  //     if (!manager) await queryRunner!.rollbackTransaction();
  //     throw new Error(`Error deleting user: ${error.message}`);
  //   } finally {
  //     if (!manager) await queryRunner!.release();
  //   }
  // }
}
