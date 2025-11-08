import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Territory } from './entities/territory.entity';
import { CreateTerritoryDto } from './dto/create-territory.dto';
import { UpdateTerritoryDto } from './dto/update-territory.dto';
import { Area } from 'src/area/entities/area.entity';

@Injectable()
export class TerritoryService {
  constructor(
    @InjectRepository(Territory)
    private readonly territoryRepository: Repository<Territory>,
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
  ) {}

  async create(dto: CreateTerritoryDto): Promise<Territory> {
    await this.ensureAreaExists(dto.area_id);
    const name = dto.name.trim();

    const existing = await this.territoryRepository.findOne({
      where: { name, area_id: dto.area_id },
    });

    if (existing) {
      throw new ConflictException('Territory already exists for this area');
    }

    const territory = this.territoryRepository.create({
      name,
      area_id: dto.area_id,
    });

    return this.territoryRepository.save(territory);
  }

  async findAll(areaId?: string): Promise<Territory[]> {
    const qb = this.territoryRepository.createQueryBuilder('territory');

    if (areaId) {
      qb.where('territory.area_id = :areaId', { areaId });
    }

    qb.orderBy('territory.name', 'ASC');

    return qb.getMany();
  }

  async findOne(id: string): Promise<Territory> {
    const territory = await this.territoryRepository.findOne({
      where: { id },
    });
    if (!territory) {
      throw new NotFoundException('Territory not found');
    }
    return territory;
  }

  async update(id: string, dto: UpdateTerritoryDto): Promise<Territory> {
    const territory = await this.findOne(id);

    if (dto.area_id) {
      await this.ensureAreaExists(dto.area_id);
      territory.area_id = dto.area_id;
    }

    if (dto.name) {
      const name = dto.name.trim();
      const existing = await this.territoryRepository.findOne({
        where: { name, area_id: territory.area_id },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Territory already exists for this area');
      }

      territory.name = name;
    }

    return this.territoryRepository.save(territory);
  }

  async remove(id: string): Promise<void> {
    const territory = await this.findOne(id);
    await this.territoryRepository.remove(territory);
  }

  private async ensureAreaExists(areaId: string): Promise<void> {
    const area = await this.areaRepository.findOne({ where: { id: areaId } });
    if (!area) {
      throw new NotFoundException('Area not found');
    }
  }
}

