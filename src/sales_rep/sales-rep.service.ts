import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesRep } from './entities/sales-rep.entity';
import { CreateSalesRepDto } from './dto/create-sales-rep.dto';
import { UpdateSalesRepDto } from './dto/update-sales-rep.dto';

@Injectable()
export class SalesRepService {
  constructor(
    @InjectRepository(SalesRep)
    private readonly salesRepRepository: Repository<SalesRep>,
  ) {}

  async create(dto: CreateSalesRepDto): Promise<SalesRep> {
    const username = dto.username.trim().toLowerCase();

    const existing = await this.salesRepRepository.findOne({
      where: { username },
    });

    if (existing) {
      throw new ConflictException('Sales representative username already used');
    }

    const salesRep = this.salesRepRepository.create({
      username,
      name: dto.name.trim(),
      phone: dto.phone ?? null,
      isActive: dto.isActive ?? true,
      password_hash: dto.password,
    });

    return this.salesRepRepository.save(salesRep);
  }

  async findAll(): Promise<SalesRep[]> {
    return this.salesRepRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SalesRep> {
    const salesRep = await this.salesRepRepository.findOne({
      where: { id },
    });
    if (!salesRep) {
      throw new NotFoundException('Sales representative not found');
    }
    return salesRep;
  }

  async update(id: string, dto: UpdateSalesRepDto): Promise<SalesRep> {
    const salesRep = await this.findOne(id);

    if (dto.username) {
      const username = dto.username.trim().toLowerCase();
      if (username !== salesRep.username) {
        const existing = await this.salesRepRepository.findOne({
          where: { username },
        });
        if (existing && existing.id !== id) {
          throw new ConflictException(
            'Sales representative username already used',
          );
        }
        salesRep.username = username;
      }
    }

    if (dto.name) {
      salesRep.name = dto.name.trim();
    }

    if (dto.phone !== undefined) {
      salesRep.phone = dto.phone;
    }

    if (dto.isActive !== undefined) {
      salesRep.isActive = dto.isActive;
    }

    if (dto.password) {
      salesRep.password_hash = dto.password;
    }

    return this.salesRepRepository.save(salesRep);
  }

  async remove(id: string): Promise<void> {
    const salesRep = await this.findOne(id);
    await this.salesRepRepository.remove(salesRep);
  }
}

