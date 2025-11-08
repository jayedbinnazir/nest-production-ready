import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { UpdateAuthDto } from '../dto/update-auth.dto';
import { DataSource, EntityManager } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { RoleService } from 'src/role/role.service';
import { FileSystemService } from 'src/file-system/services/file-system.service';
import { RoleEnum } from 'src/enums/role.enum';
import { AppUser } from 'src/app_user/entities/app_user.entity';
import { authUtilService } from 'src/utils/authUtils';
import { JwtPayload } from 'src/utils/types/authTypes';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly roleService: RoleService,
    private readonly fileService: FileSystemService,
    private readonly authUtilService: authUtilService,
  ) {}
  async registerUser(
    data: CreateAuthDto,
    file?: Express.Multer.File,
    manager?: EntityManager,
  ): Promise<{ user: User; token: string }> {
    const queryRunner = manager
      ? undefined
      : this.dataSource.createQueryRunner();
    const em = manager ?? queryRunner?.manager;

    if (!manager) {
      await queryRunner?.connect();
      await queryRunner?.startTransaction();
    }

    try {
      // 1️⃣ Check if email exists
      const existing = await em!
        .createQueryBuilder(User, 'user')
        .select(['user.id as id'])
        .where('user.email = :email', { email: data.email })
        .getRawOne<{ id: string }>();

      if (existing) {
        throw new ConflictException(`Email already exists`);
      }

      // 2️⃣ Hash password
      const hashed = await this.authUtilService.hashPassword(data.password!);

      // 3️⃣ Ensure default role exists
      let role = await this.roleService.findByName(RoleEnum.USER);

      if (!role) {
        role = await this.roleService.createRole(
          {
            name: RoleEnum.USER,
            description: 'Default user role',
          },
          em,
        );
      }

      // 4️⃣ Create User
      const user = em!.create(User, {
        ...data,
        password: hashed,
      });

      const savedUser = await em!.save(user);

      // 5️⃣ Save user file record
      if (file) {
        await this.fileService.createFileFromMulter(file, savedUser.id, em);
      }

      // 6️⃣ Link user with default role
      const appUser = em!.create(AppUser, {
        user_id: savedUser.id,
        role_id: role.id,
      });
      await em!.save(appUser);

      // 7️⃣ Fetch all roles
      const roles = await em!
        .createQueryBuilder(AppUser, 'appUser')
        .leftJoin('appUser.role', 'role')
        .select(['role.name AS role_name'])
        .where('appUser.user_id = :id', { id: savedUser.id })
        .getRawMany();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      const roleNames = roles.map((r) => r.role_name);

      // 8️⃣ Create JWT payload
      const payload: JwtPayload = {
        sub: savedUser.id,
        role: roleNames,
        iat: Date.now(),
      };

      // 9️⃣ Generate token
      const token = await this.authUtilService.generateToken(payload);

      // 🔟 Update file path (after user exists)
      if (file) {
        await this.fileService.updateFilePath(file.path, savedUser.id, em);
      }

      if (!manager) await queryRunner?.commitTransaction();

      return { user: savedUser, token };
    } catch (err) {
      console.log(err);
      if (!manager) await queryRunner?.rollbackTransaction();
      throw err;
    } finally {
      if (!manager) await queryRunner?.release();
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
