import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from './entities/region.entity';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

@Injectable()
export class RegionService {
  constructor(
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
  ) {}

  async create(data: CreateRegionDto): Promise<Region> {
    const normalizedName = data.name.trim();

    const existing = await this.regionRepository.findOne({
      where: { name: normalizedName },
    });

    if (existing) {
      throw new ConflictException('Region name already exists');
    }

    const region = this.regionRepository.create({
      name: normalizedName,
    });

    return this.regionRepository.save(region);
  }

  async findAll(): Promise<Region[]> {
    return this.regionRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Region> {
    const region = await this.regionRepository.findOne({ where: { id } });
    if (!region) {
      throw new NotFoundException('Region not found');
    }

    return region;
  }

  async update(id: string, dto: UpdateRegionDto): Promise<Region> {
    const region = await this.findOne(id);

    if (dto.name) {
      const normalizedName = dto.name.trim();
      const existing = await this.regionRepository.findOne({
        where: { name: normalizedName },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Region name already exists');
      }
      region.name = normalizedName;
    }

    return this.regionRepository.save(region);
  }

  async remove(id: string): Promise<void> {
    const region = await this.findOne(id);
    await this.regionRepository.remove(region);
  }
}

