import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleEnum } from 'src/enums/role.enum';

@Injectable()
export class RoleService {
  constructor(private readonly dataSource: DataSource) {}

  async createRole(
    createRoleDto: CreateRoleDto,
    manager?: EntityManager,
  ): Promise<Role> {
    const { name, description } = createRoleDto;

    const queryRunner = manager
      ? undefined
      : this.dataSource.createQueryRunner();
    const em = manager ?? queryRunner?.manager;

    if (!manager) {
      await queryRunner?.connect();
      await queryRunner?.startTransaction();
    }

    try {
      // ✅ Ensure the name is a valid enum (extra safety)
      if (!Object.values(RoleEnum).includes(name)) {
        throw new ConflictException(
          `Invalid role name '${name}'. Must be one of: ${Object.values(RoleEnum).join(', ')}`,
        );
      }

      const existing = await em!.findOne(Role, { where: { name } });
      if (existing) {
        throw new ConflictException(`Role '${name}' already exists`);
      }

      const role = em!.create(Role, { name, description });
      const saved = await em!.save(role);

      if (!manager) await queryRunner?.commitTransaction();
      return saved;
    } catch (err) {
      if (!manager) await queryRunner?.rollbackTransaction();
      throw err;
    } finally {
      if (!manager) await queryRunner?.release();
    }
  }

  async findAllRoles(manager?: EntityManager): Promise<Role[]> {
    const em = manager ?? this.dataSource.manager;
    return em.find(Role);
  }

  async findByName(name: RoleEnum): Promise<Role | null> {
    return await this.dataSource
      .getRepository(Role)
      .findOne({ where: { name } });
  }

  async findRoleById(id: string): Promise<Role> {
    const role = await this.dataSource
      .getRepository(Role)
      .findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
    return role;
  }

  async updateRole(
    id: string,
    data: Partial<Pick<Role, 'name' | 'description'>>,
    manager?: EntityManager,
  ): Promise<Role> {
    const queryRunner = manager
      ? undefined
      : this.dataSource.createQueryRunner();
    const em = manager ?? queryRunner?.manager;

    if (!manager) {
      await queryRunner?.connect();
      await queryRunner?.startTransaction();
    }

    try {
      const role = await em!.findOne(Role, { where: { id } });
      if (!role) throw new NotFoundException(`Role with ID ${id} not found`);

      Object.assign(role, data);
      const updated = await em!.save(role);

      if (!manager) await queryRunner?.commitTransaction();
      return updated;
    } catch (err) {
      if (!manager) await queryRunner?.rollbackTransaction();
      throw err;
    } finally {
      if (!manager) await queryRunner?.release();
    }
  }

  async deleteRole(id: string, manager?: EntityManager): Promise<void> {
    const queryRunner = manager
      ? undefined
      : this.dataSource.createQueryRunner();
    const em = manager ?? queryRunner?.manager;

    if (!manager) {
      await queryRunner?.connect();
      await queryRunner?.startTransaction();
    }

    try {
      const role = await em!.findOne(Role, { where: { id } });
      if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
      await em!.remove(role);
      if (!manager) await queryRunner?.commitTransaction();
    } catch (err) {
      if (!manager) await queryRunner?.rollbackTransaction();
      throw err;
    } finally {
      if (!manager) await queryRunner?.release();
    }
  }
}
