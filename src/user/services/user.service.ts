import {
  Injectable,
  ConflictException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { User } from '../entities/user.entity';
import { AppUser } from 'src/app_user/entities/app_user.entity';
import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { FileSystemService } from 'src/file-system/services/file-system.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { RoleEnum } from 'src/enums/role.enum';
import { CreateRoleDto } from 'src/role/dto/create-role.dto';
@Injectable()
export class UserService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly roleService: RoleService,
    private readonly fileService: FileSystemService,
  ) {}

  /**
   * Create a new user and automatically link with the default "user" role.
   */
  async createUser(
    data: CreateUserDto,
    file?: Express.Multer.File,
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
      // 1️⃣ Ensure email is unique (optimized raw query)
      const existing = await em!
        .createQueryBuilder(User, 'user')
        .select(['user.id AS id', 'user.email AS email'])
        .where('user.email = :email', { email: data.email })
        .getRawOne<{ id: string; email: string }>();

      if (existing) {
        throw new ConflictException(
          `User with email '${data.email}' already exists`,
        );
      }

      let role = await this.roleService.findByName(RoleEnum.USER);

      if (!role) {
        role = await this.roleService.createRole(
          {
            name: 'user',
            description: 'default role',
          } as CreateRoleDto,
          em,
        );
      }

      // 3️⃣ Create user record
      const newUser = em!.create(User, {
        ...data,
        appUsers: [],
      });
      const savedUser = await em!.save(newUser);

      if (!savedUser) {
        throw new HttpException('user saving failed', 400);
      }

      await this.fileService.createFileFromMulter(file!, savedUser.id, em);

      // 4️⃣ Create AppUser record linking the user with the default role
      const appUser = em!.create(AppUser, {
        user_id: savedUser.id,
        role_id: role.id,
      });
      await em!.save(appUser);

      await this.fileService.updateFilePath(
        file?.path as string,
        savedUser.id,
        em,
      );
      if (!manager) {
        await queryRunner?.commitTransaction();
      }
      return savedUser;
    } catch (err) {
      console.log(err);
      if (!manager) await queryRunner?.rollbackTransaction();
      throw err;
    } finally {
      if (!manager) await queryRunner?.release();
    }
  }

  /**
   * Find all users with their related roles and profile pictures.
   */
  async findAllUsers(query: string) {
    const repo = this.dataSource.getRepository(User);
    const metadata = repo.metadata;

    const stringColumns = metadata.columns
      .filter((col) => col.type === 'varchar' || col.type === 'text')
      .map((col) => col.propertyPath);

    try {
      const qb = repo
        .createQueryBuilder('user')
        .leftJoin('user.appUsers', 'appUser')
        .leftJoin('appUser.role', 'role')
        .leftJoin('user.profile_pictures', 'profile_pictures')
        .select([
          'user.id',
          'user.name',
          'user.email',
          'user.phone',
          'role.name',
          'profile_pictures.path',
        ]);

      if (query) {
        const searchParam = `%${query}%`;
        const conditions = stringColumns.map(
          (col) => `user.${col} ILIKE :query`,
        );
        conditions.push('role.name::text ILIKE :query'); // include role

        qb.andWhere(`(${conditions.join(' OR ')})`, { query: searchParam });
      }

      const users = await qb.getRawMany();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return users;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Find a single user by ID.
   */
  async findUserById(id: string): Promise<User> {
    const user = await this.dataSource.getRepository(User).findOne({
      where: { id },
      relations: ['appUsers', 'appUsers.role', 'profile_pictures'],
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  /**
   * Update basic user information.
   */
  async updateUser(
    id: string,
    data: Partial<User>,
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
      const user = await em!.findOne(User, { where: { id } });
      if (!user) throw new NotFoundException(`User with ID ${id} not found`);

      Object.assign(user, data);
      const updated = await em!.save(user);

      if (!manager) await queryRunner?.commitTransaction();
      return updated;
    } catch (err) {
      if (!manager) await queryRunner?.rollbackTransaction();
      throw err;
    } finally {
      if (!manager) await queryRunner?.release();
    }
  }

  /**
   * Assign a new role to an existing user.
   */
  async assignRoleToUser(
    userId: string,
    roleName: string,
    manager?: EntityManager,
  ): Promise<void> {
    if (!Object.values(RoleEnum).includes(roleName as RoleEnum)) {
      throw new NotFoundException('The role u want to assign does not exists');
    }

    const queryRunner = manager
      ? undefined
      : this.dataSource.createQueryRunner();
    const em = manager ?? queryRunner?.manager;

    if (!manager) {
      await queryRunner?.connect();
      await queryRunner?.startTransaction();
    }

    try {
      const user = await em!.findOne(User, { where: { id: userId } });
      if (!user)
        throw new NotFoundException(`User with ID ${userId} not found`);

      let role = await em!.findOne(Role, {
        where: { name: roleName as RoleEnum },
      });
      if (!role) {
        role = await this.roleService.createRole(
          {
            name: roleName as RoleEnum,
            description: `${roleName} Role`,
          },
          em,
        );
      }

      const existingAppUser = await em!.findOne(AppUser, {
        where: { user_id: userId, role_id: role.id },
      });
      if (existingAppUser) {
        throw new ConflictException(
          `User already has the '${roleName}' role assigned`,
        );
      }

      const appUser = em!.create(AppUser, {
        user_id: userId,
        role_id: role.id,
      });
      await em!.save(appUser);

      if (!manager) await queryRunner?.commitTransaction();
    } catch (err) {
      if (!manager) await queryRunner?.rollbackTransaction();
      throw err;
    } finally {
      if (!manager) await queryRunner?.release();
    }
  }

  /**
   * Delete user and all their related data.
   */
  async deleteUser(id: string, manager?: EntityManager): Promise<void> {
    const queryRunner = manager
      ? undefined
      : this.dataSource.createQueryRunner();
    const em = manager ?? queryRunner?.manager;

    if (!manager) {
      await queryRunner?.connect();
      await queryRunner?.startTransaction();
    }

    try {
      const user = await em!.findOne(User, { where: { id } });
      if (!user) throw new NotFoundException(`User with ID ${id} not found`);

      await em!.remove(user);

      if (!manager) await queryRunner?.commitTransaction();
    } catch (err) {
      if (!manager) await queryRunner?.rollbackTransaction();
      throw err;
    } finally {
      if (!manager) await queryRunner?.release();
    }
  }
}
