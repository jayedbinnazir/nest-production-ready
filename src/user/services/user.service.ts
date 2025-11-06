import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { User } from '../entities/user.entity';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class UserService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly roleService: RoleService,
  ) {}

  async createUser(
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
      // 1️⃣ Ensure email unique
      const existing = await em!.findOne(User, {
        where: { email: data.email },
      });
      if (existing)
        throw new ConflictException(
          `User with email '${data.email}' already exists`,
        );

      // 2️⃣ Assign default role = "user"
      const defaultRole = await this.roleService.findAllRoles();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const userRole =
        defaultRole.find((r) => r.name.toLowerCase() === 'user') ??
        (await this.roleService.createRole('user', 'Default user role', em));

      // 3️⃣ Create new user
      const newUser = em!.create(User, {
        ...data,
        appUsers: [], // in case you link later
      });

      const saved = await em!.save(newUser);

      if (!manager) await queryRunner?.commitTransaction();
      return saved;
    } catch (err) {
      if (!manager) await queryRunner?.rollbackTransaction();
      throw err;
    } finally {
      if (!manager) await queryRunner?.release();
    }
  }

  async findAllUsers(): Promise<User[]> {
    return this.dataSource.getRepository(User).find({
      relations: ['appUsers', 'profile_pictures'],
    });
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.dataSource.getRepository(User).findOne({
      where: { id },
      relations: ['appUsers', 'profile_pictures'],
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

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
