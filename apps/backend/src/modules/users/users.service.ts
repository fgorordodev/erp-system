import { Injectable } from '@nestjs/common';

import { ErrorCode } from '@erp/api-contracts';
import { ROLES } from '@erp/rbac';
import type { Prisma } from '@erp/database';

import { PasswordHasherService } from '@backend/crypto';

import { UserMapper } from './mappers/user.mapper';
import type { UserAuthProjection } from './persistence/user.projection';
import { UsersRepository } from './persistence/user.repository';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BusinessException, normalizeEmail } from '@backend/common';
import { CreateUserInput } from './persistence/inputs/create-user.input';
import { UpdateUserInput } from './persistence/inputs/update-user.input';

type UserDatabaseClient = Pick<Prisma.TransactionClient, 'user'>;

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const normalizedEmail = normalizeEmail(dto.email);

    await this.ensureEmailAvailable(normalizedEmail);

    const defaultRoleId = await this.usersRepository.findRoleIdByName(
      ROLES.EMPLOYEE,
    );

    if (!defaultRoleId) {
      throw new BusinessException(
        ErrorCode.INTERNAL_ERROR,
        `Default role ${ROLES.EMPLOYEE} was not found`,
        500,
      );
    }

    const input: CreateUserInput = {
      email: dto.email,
      passwordHash: await this.passwordHasher.hash(dto.password),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      roleId: defaultRoleId,
    };

    const user = await this.usersRepository.create(input);

    return UserMapper.toResponse(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findAll();

    return users.map((user) => UserMapper.toResponse(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new BusinessException(
        ErrorCode.USER_NOT_FOUND,
        'User not found',
        404,
      );
    }

    return UserMapper.toResponse(user);
  }

  findByEmail(email: string): Promise<UserAuthProjection | null> {
    return this.usersRepository.findAuthByEmail(email);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    await this.ensureUserExists(id);

    const normalizedEmail =
      dto.email !== undefined ? normalizeEmail(dto.email) : undefined;

    if (normalizedEmail !== undefined) {
      await this.ensureEmailAvailable(normalizedEmail, id);
    }

    const input: UpdateUserInput = {
      ...(normalizedEmail !== undefined && {
        email: normalizedEmail,
      }),
      ...(dto.firstName !== undefined && {
        firstName: dto.firstName.trim(),
      }),
      ...(dto.lastName !== undefined && {
        lastName: dto.lastName.trim(),
      }),
    };

    const user = await this.usersRepository.update(id, input);

    return UserMapper.toResponse(user);
  }

  async remove(id: string): Promise<UserResponseDto> {
    await this.ensureUserExists(id);

    const user = await this.usersRepository.softDelete(id);

    return UserMapper.toResponse(user);
  }

  async updateStatus(id: string, isActive: boolean): Promise<UserResponseDto> {
    await this.ensureUserExists(id);

    const user = await this.usersRepository.updateStatus(id, isActive);

    return UserMapper.toResponse(user);
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findById(id);

    return user ? UserMapper.toResponse(user) : null;
  }

  updatePassword(
    userId: string,
    passwordHash: string,
    database?: UserDatabaseClient,
  ): Promise<void> {
    return this.usersRepository.updatePassword(userId, passwordHash, database);
  }

  incrementFailedLoginAttempts(
    userId: string,
    failedAt: Date,
    database?: UserDatabaseClient,
  ): Promise<{ failedLoginAttempts: number }> {
    if (database) {
      return this.usersRepository.incrementFailedLoginAttempts(
        userId,
        failedAt,
        database,
      );
    }

    return this.usersRepository.incrementFailedLoginAttempts(userId, failedAt);
  }

  setLockedUntil(
    userId: string,
    lockedUntil: Date,
    database?: UserDatabaseClient,
  ): Promise<void> {
    if (database) {
      return this.usersRepository.setLockedUntil(userId, lockedUntil, database);
    }

    return this.usersRepository.setLockedUntil(userId, lockedUntil);
  }

  resetLoginFailures(
    userId: string,
    database?: UserDatabaseClient,
  ): Promise<void> {
    if (database) {
      return this.usersRepository.resetLoginFailures(userId, database);
    }

    return this.usersRepository.resetLoginFailures(userId);
  }

  private async ensureUserExists(id: string): Promise<void> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new BusinessException(
        ErrorCode.USER_NOT_FOUND,
        'User not found',
        404,
      );
    }
  }

  private async ensureEmailAvailable(
    email: string,
    excludedUserId?: string,
  ): Promise<void> {
    const exists = await this.usersRepository.existsByEmail(
      email,
      excludedUserId,
    );

    if (exists) {
      throw new BusinessException(
        ErrorCode.USER_EMAIL_EXISTS,
        'Email is already registered',
        409,
      );
    }
  }
}
