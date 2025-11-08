import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Distributor } from './entities/distributor.entity';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';

@Injectable()
export class DistributorService {
  constructor(
    @InjectRepository(Distributor)
    private readonly distributorRepository: Repository<Distributor>,
  ) {}

  async create(dto: CreateDistributorDto): Promise<Distributor> {
    const name = dto.name.trim();
    const existing = await this.distributorRepository.findOne({
      where: { name },
    });

    if (existing) {
      throw new ConflictException('Distributor already exists');
    }

    const distributor = this.distributorRepository.create({ name });
    return this.distributorRepository.save(distributor);
  }

  async findAll(): Promise<Distributor[]> {
    return this.distributorRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Distributor> {
    const distributor = await this.distributorRepository.findOne({
      where: { id },
    });
    if (!distributor) {
      throw new NotFoundException('Distributor not found');
    }
    return distributor;
  }

  async update(id: string, dto: UpdateDistributorDto): Promise<Distributor> {
    const distributor = await this.findOne(id);

    if (dto.name) {
      const name = dto.name.trim();
      const existing = await this.distributorRepository.findOne({
        where: { name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Distributor already exists');
      }

      distributor.name = name;
    }

    return this.distributorRepository.save(distributor);
  }

  async remove(id: string): Promise<void> {
    const distributor = await this.findOne(id);
    await this.distributorRepository.remove(distributor);
  }
}

