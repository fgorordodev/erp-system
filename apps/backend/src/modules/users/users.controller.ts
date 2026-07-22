import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { UsersService } from './users.service';

import { CreateUserDto } from './dto/create-user.dto';

import { UpdateUserDto } from './dto/update-user.dto';

import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user account with encrypted password.',
  })
  @ApiCreatedResponse({
    description: 'User successfully created.',
    type: UserResponseDto,
  })
  @ApiConflictResponse({
    description: 'Email is already registered.',
  })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Returns all active users.',
  })
  @ApiOkResponse({
    description: 'List of users.',
    type: UserResponseDto,
    isArray: true,
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id',
    description: 'Returns a single user by identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
    example: 'cm123abc456',
  })
  @ApiOkResponse({
    description: 'User found.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User was not found.',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates user information.',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
    example: 'cm123abc456',
  })
  @ApiOkResponse({
    description: 'User successfully updated.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User was not found.',
  })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Performs a soft delete. User data remains in database.',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
    example: 'cm123abc456',
  })
  @ApiOkResponse({
    description: 'User successfully deleted.',
  })
  @ApiNotFoundResponse({
    description: 'User was not found.',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Enable or disable user account',
    description:
      'Allows administrators to activate or deactivate a user account.',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
    example: 'cm123abc456',
  })
  @ApiOkResponse({
    description: 'User status updated successfully.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User was not found.',
  })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.usersService.updateStatus(id, dto.isActive);
  }
}
