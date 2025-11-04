import {
  Body,
  Controller,
  // Delete,
  // Get,
  // Param,
  // Patch,
  Post,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
// import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    return user;
  }

  //   @Get()
  //   findAll() {
  //     return this.userService.findAll();
  //   }

  //   @Get(':id')
  //   findOne(@Param('id') id: string) {
  //     return this.userService.findOne(+id);
  //   }

  //   @Patch(':id')
  //   update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //     return this.userService.update(+id, updateUserDto);
  //   }

  //   @Delete(':id')
  //   remove(@Param('id') id: string) {
  //     return this.userService.remove(+id);
  //   }
}
