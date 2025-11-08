import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from './entities/area.entity';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { Region } from 'src/region/entities/region.entity';

@Injectable()
export class AreaService {
  constructor(
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
  ) {}

  async create(dto: CreateAreaDto): Promise<Area> {
    await this.ensureRegionExists(dto.region_id);

    const name = dto.name.trim();
    const existing = await this.areaRepository.findOne({
      where: { name, region_id: dto.region_id },
    });

    if (existing) {
      throw new ConflictException('Area already exists for this region');
    }

    const area = this.areaRepository.create({
      name,
      region_id: dto.region_id,
    });

    return this.areaRepository.save(area);
  }

  async findAllByRegion(regionId?: string): Promise<Area[]> {
    const qb = this.areaRepository.createQueryBuilder('area');

    if (regionId) {
      qb.where('area.region_id = :regionId', { regionId });
    }

    qb.orderBy('area.name', 'ASC');

    return qb.getMany();
  }

  async findOne(id: string): Promise<Area> {
    const area = await this.areaRepository.findOne({ where: { id } });
    if (!area) {
      throw new NotFoundException('Area not found');
    }

    return area;
  }

  async update(id: string, dto: UpdateAreaDto): Promise<Area> {
    const area = await this.findOne(id);

    if (dto.region_id) {
      await this.ensureRegionExists(dto.region_id);
      area.region_id = dto.region_id;
    }

    if (dto.name) {
      const name = dto.name.trim();
      const existing = await this.areaRepository.findOne({
        where: { name, region_id: area.region_id },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Area already exists for this region');
      }

      area.name = name;
    }

    return this.areaRepository.save(area);
  }

  async remove(id: string): Promise<void> {
    const area = await this.findOne(id);
    await this.areaRepository.remove(area);
  }

  private async ensureRegionExists(regionId: string): Promise<void> {
    const region = await this.regionRepository.findOne({
      where: { id: regionId },
    });
    if (!region) {
      throw new NotFoundException('Region not found');
    }
  }
}

