import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../src/database/typeorm.datasource';
import { Repository } from 'typeorm';
import { Role } from '../src/role/entities/role.entity';
import { User } from '../src/user/entities/user.entity';
import { AppUser } from '../src/app_user/entities/app_user.entity';
import { SalesRep } from '../src/sales_rep/entities/sales-rep.entity';
import { Region } from '../src/region/entities/region.entity';
import { Area } from '../src/area/entities/area.entity';
import { Distributor } from '../src/distributor/entities/distributor.entity';
import { Territory } from '../src/territory/entities/territory.entity';
import { Retailer } from '../src/retailer/entities/retailer.entity';
import { SalesRepRetailer } from '../src/sales_rep/entities/sales-rep-retailer.entity';

async function seed() {
  await AppDataSource.initialize();
  const roleRepository = AppDataSource.getRepository(Role);
  const userRepository = AppDataSource.getRepository(User);
  const appUserRepository = AppDataSource.getRepository(AppUser);
  const salesRepRepository = AppDataSource.getRepository(SalesRep);
  const regionRepository = AppDataSource.getRepository(Region);
  const areaRepository = AppDataSource.getRepository(Area);
  const distributorRepository = AppDataSource.getRepository(Distributor);
  const territoryRepository = AppDataSource.getRepository(Territory);
  const retailerRepository = AppDataSource.getRepository(Retailer);
  const assignmentRepository = AppDataSource.getRepository(SalesRepRetailer);

  const adminRole = await ensureRole(roleRepository, 'admin', 'Administrator role');
  await ensureRole(roleRepository, 'sales_rep', 'Sales representative role');

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';
  const adminName = process.env.SEED_ADMIN_NAME ?? 'System Admin';

  let adminUser = await userRepository.findOne({ where: { email: adminEmail } });
  if (!adminUser) {
    const saltRounds = Number(process.env.AUTH_SALT_ROUNDS ?? 10);
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    adminUser = userRepository.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      emailVerified: true,
    });
    adminUser = await userRepository.save(adminUser);
    console.log(`Admin user created with email: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists with email: ${adminEmail}`);
  }

  const adminLinkExists = await appUserRepository.findOne({
    where: { user_id: adminUser.id, role_id: adminRole.id },
  });

  if (!adminLinkExists) {
    const adminLink = appUserRepository.create({
      user_id: adminUser.id,
      role_id: adminRole.id,
    });
    await appUserRepository.save(adminLink);
    console.log('Admin role linked to admin user');
  }

  const salesRepUsername = process.env.SEED_SALES_REP_USERNAME ?? 'sr001';
  const salesRepPassword = process.env.SEED_SALES_REP_PASSWORD ?? 'SrUser123!';
  let salesRep = await salesRepRepository.findOne({
    where: { username: salesRepUsername },
  });

  if (!salesRep) {
    salesRep = salesRepRepository.create({
      username: salesRepUsername,
      name: 'Sample Sales Rep',
      phone: '01700000000',
      password_hash: salesRepPassword,
      isActive: true,
    });
    salesRep = await salesRepRepository.save(salesRep);
    console.log(`Sales representative created with username: ${salesRepUsername}`);
  } else {
    console.log(`Sales representative already exists: ${salesRepUsername}`);
  }

  const regionDhaka = await upsertRegion(regionRepository, 'dhaka');
  const areaGulshan = await upsertArea(areaRepository, 'gulshan', regionDhaka.id);
  const distributorAlpha = await upsertDistributor(
    distributorRepository,
    'alpha distribution',
  );
  const territoryNorth = await upsertTerritory(
    territoryRepository,
    'north gulshan',
    areaGulshan.id,
  );

  const retailersToSeed = [
    {
      uid: 'RT-1001',
      name: 'Gulshan Mart',
      phone: '01710000001',
      points: 200,
      routes: 'Route-A',
    },
    {
      uid: 'RT-1002',
      name: 'Bashundhara Store',
      phone: '01710000002',
      points: 150,
      routes: 'Route-B',
    },
    {
      uid: 'RT-1003',
      name: 'Banani Super Shop',
      phone: '01710000003',
      points: 180,
      routes: 'Route-C',
    },
  ];

  for (const retailerData of retailersToSeed) {
    let retailer = await retailerRepository.findOne({
      where: { uid: retailerData.uid },
    });
    if (!retailer) {
      retailer = retailerRepository.create({
        ...retailerData,
        region_id: regionDhaka.id,
        area_id: areaGulshan.id,
        distributor_id: distributorAlpha.id,
        territory_id: territoryNorth.id,
        notes: 'Seeded data',
      });
      retailer = await retailerRepository.save(retailer);
      console.log(`Retailer created: ${retailer.uid}`);
    }

    const assignmentExists = await assignmentRepository.findOne({
      where: {
        sales_rep_id: salesRep.id,
        retailer_id: retailer.id,
      },
    });

    if (!assignmentExists) {
      const assignment = assignmentRepository.create({
        sales_rep_id: salesRep.id,
        retailer_id: retailer.id,
        assignedBy: adminUser.id,
      });
      await assignmentRepository.save(assignment);
      console.log(`Retailer ${retailer.uid} assigned to ${salesRep.username}`);
    }
  }

  console.log('Seeding completed successfully');
  await AppDataSource.destroy();
}

async function ensureRole(
  roleRepository: Repository<Role>,
  name: string,
  description: string,
) {
  let role = await roleRepository.findOne({ where: { name } });
  if (!role) {
    role = roleRepository.create({ name, description });
    role = await roleRepository.save(role);
    console.log(`Role created: ${name}`);
  }
  return role;
}

async function upsertRegion(
  repository: Repository<Region>,
  name: string,
) {
  let region = await repository.findOne({ where: { name } });
  if (!region) {
    region = repository.create({ name });
    region = await repository.save(region);
    console.log(`Region created: ${name}`);
  }
  return region;
}

async function upsertArea(
  repository: Repository<Area>,
  name: string,
  regionId: string,
) {
  let area = await repository.findOne({ where: { name, region_id: regionId } });
  if (!area) {
    area = repository.create({ name, region_id: regionId });
    area = await repository.save(area);
    console.log(`Area created: ${name}`);
  }
  return area;
}

async function upsertDistributor(
  repository: Repository<Distributor>,
  name: string,
) {
  let distributor = await repository.findOne({ where: { name } });
  if (!distributor) {
    distributor = repository.create({ name });
    distributor = await repository.save(distributor);
    console.log(`Distributor created: ${name}`);
  }
  return distributor;
}

async function upsertTerritory(
  repository: Repository<Territory>,
  name: string,
  areaId: string,
) {
  let territory = await repository.findOne({ where: { name, area_id: areaId } });
  if (!territory) {
    territory = repository.create({ name, area_id: areaId });
    territory = await repository.save(territory);
    console.log(`Territory created: ${name}`);
  }
  return territory;
}

seed()
  .catch((error) => {
    console.error('Seeding failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

