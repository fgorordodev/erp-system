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
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import {
  type AuthenticatedUser,
  CurrentUser,
  Permissions,
} from '../../security';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  UserResponseDto,
  UserRoleResponseDto,
} from './dto';
import { UsersService } from './users.service';

import { PERMISSIONS } from '../../security';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions(PERMISSIONS.USER_CREATE.name)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user account with a hashed password.',
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
  @Permissions(PERMISSIONS.USER_READ.name)
  @ApiOperation({
    summary: 'Get users',
    description: 'Returns all users that have not been deleted.',
  })
  @ApiOkResponse({
    description: 'List of users.',
    type: UserResponseDto,
    isArray: true,
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Returns the currently authenticated user.',
  })
  @ApiOkResponse({
    description: 'Current authenticated user.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Authenticated user was not found.',
  })
  findMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findOne(user.userId);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.USER_READ.name)
  @ApiOperation({
    summary: 'Get user by id',
    description: 'Returns a non-deleted user by identifier.',
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
  @Permissions(PERMISSIONS.USER_UPDATE.name)
  @ApiOperation({
    summary: 'Update user',
    description:
      'Updates user profile information. Password changes use a separate flow.',
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
  @ApiConflictResponse({
    description: 'Email is already registered.',
  })
  @ApiNotFoundResponse({
    description: 'User was not found.',
  })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/status')
  @Permissions(PERMISSIONS.USER_UPDATE.name)
  @ApiOperation({
    summary: 'Enable or disable user account',
    description: 'Activates or deactivates a non-deleted user account.',
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

  @Delete(':id')
  @Permissions(PERMISSIONS.USER_DELETE.name)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Performs a soft delete and disables the account.',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
    example: 'cm123abc456',
  })
  @ApiOkResponse({
    description: 'User successfully deleted.',
    type: UserRoleResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User was not found.',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
