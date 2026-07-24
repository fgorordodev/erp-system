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
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import {
  ApiCreatedEnvelope,
  ApiErrorResponseDto,
  ApiInternalError,
  ApiOkEnvelope,
  ApiProtectedErrors,
  ApiValidationError,
} from '@backend/common';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  UserResponseDto,
} from '@backend/modules/users/dto';
import { CurrentUser, Permissions } from '@backend/security/decorator';
import type { AuthenticatedUser } from '@backend/security/jwt/interfaces';
import { PERMISSIONS } from '@backend/security/rbac';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@ApiProtectedErrors()
@ApiInternalError()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions(PERMISSIONS.USER_CREATE.name)
  @ApiOperation({
    summary: 'Create a user',
    description:
      'Creates a user account, hashes its password and assigns the default EMPLOYEE role.',
  })
  @ApiCreatedEnvelope({
    description: 'User successfully created.',
    type: UserResponseDto,
  })
  @ApiConflictResponse({
    description: 'The email address is already registered.',
    type: ApiErrorResponseDto,
  })
  @ApiValidationError()
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  @Get()
  @Permissions(PERMISSIONS.USER_READ.name)
  @ApiOperation({
    summary: 'List users',
    description:
      'Returns all non-deleted users. Pagination and filtering are not implemented yet.',
  })
  @ApiOkEnvelope({
    description: 'List of active and inactive non-deleted users.',
    type: UserResponseDto,
    isArray: true,
  })
  findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get the current user',
    description: 'Returns the user associated with the current access token.',
  })
  @ApiOkEnvelope({
    description: 'Current authenticated user.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The authenticated user no longer exists.',
    type: ApiErrorResponseDto,
  })
  findMe(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return this.usersService.findOne(user.userId);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.USER_READ.name)
  @ApiOperation({
    summary: 'Get a user by identifier',
    description: 'Returns a non-deleted user by its CUID identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'User CUID.',
    example: 'cm123abc456',
  })
  @ApiOkEnvelope({
    description: 'User found.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The user was not found.',
    type: ApiErrorResponseDto,
  })
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.USER_UPDATE.name)
  @ApiOperation({
    summary: 'Update a user',
    description:
      'Updates profile fields. Password and role changes use separate future workflows.',
  })
  @ApiParam({
    name: 'id',
    description: 'User CUID.',
    example: 'cm123abc456',
  })
  @ApiOkEnvelope({
    description: 'User successfully updated.',
    type: UserResponseDto,
  })
  @ApiConflictResponse({
    description: 'The new email address is already registered.',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The user was not found.',
    type: ApiErrorResponseDto,
  })
  @ApiValidationError()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/status')
  @Permissions(PERMISSIONS.USER_UPDATE.name)
  @ApiOperation({
    summary: 'Enable or disable a user',
    description: 'Changes the active status of a non-deleted user account.',
  })
  @ApiParam({
    name: 'id',
    description: 'User CUID.',
    example: 'cm123abc456',
  })
  @ApiOkEnvelope({
    description: 'User status updated successfully.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The user was not found.',
    type: ApiErrorResponseDto,
  })
  @ApiValidationError()
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateStatus(id, dto.isActive);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.USER_DELETE.name)
  @ApiOperation({
    summary: 'Soft-delete a user',
    description:
      'Marks the user as deleted and disables the account without removing its database record.',
  })
  @ApiParam({
    name: 'id',
    description: 'User CUID.',
    example: 'cm123abc456',
  })
  @ApiOkEnvelope({
    description: 'User successfully soft-deleted.',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The user was not found.',
    type: ApiErrorResponseDto,
  })
  remove(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.remove(id);
  }
}
