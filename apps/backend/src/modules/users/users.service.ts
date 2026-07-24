import { Injectable } from '@nestjs/common';

import { BusinessException, ErrorCode } from '@backend/common';
import { PrismaService } from '@backend/database';
import { HashService, ROLES } from '@backend/security';
import { UserMapper } from '@backend/modules/users/mappers';
import {
  USER_AUTH_SELECT,
  USER_RESPONSE_SELECT,
  type CreateUserInput,
  type UpdateUserInput,
  type UserAuthProjection,
} from '@backend/modules/users/persistence';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    await this.ensureEmailAvailable(dto.email);

    const defaultRole = await this.prisma.role.findUnique({
      where: { name: ROLES.EMPLOYEE },
      select: { id: true },
    });

    if (!defaultRole) {
      throw new BusinessException(
        ErrorCode.INTERNAL_ERROR,
        `Default role ${ROLES.EMPLOYEE} was not found`,
        500,
      );
    }

    const input: CreateUserInput = {
      email: dto.email,
      passwordHash: await this.hashService.hash(dto.password),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      roleId: defaultRole.id,
    };

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        password: input.passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        roles: {
          create: {
            roleId: input.roleId,
          },
        },
      },
      select: USER_RESPONSE_SELECT,
    });

    return UserMapper.toResponse(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      select: USER_RESPONSE_SELECT,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => UserMapper.toResponse(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: USER_RESPONSE_SELECT,
    });

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
    return this.prisma.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        deletedAt: null,
      },
      select: USER_AUTH_SELECT,
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    await this.findOne(id);

    if (dto.email) {
      await this.ensureEmailAvailable(dto.email, id);
    }

    const input: UpdateUserInput = {
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.firstName !== undefined && { firstName: dto.firstName.trim() }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName.trim() }),
    };

    const user = await this.prisma.user.update({
      where: { id },
      data: input,
      select: USER_RESPONSE_SELECT,
    });

    return UserMapper.toResponse(user);
  }

  async remove(id: string): Promise<UserResponseDto> {
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
      select: USER_RESPONSE_SELECT,
    });

    return UserMapper.toResponse(user);
  }

  async updateStatus(id: string, isActive: boolean): Promise<UserResponseDto> {
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: USER_RESPONSE_SELECT,
    });

    return UserMapper.toResponse(user);
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: USER_RESPONSE_SELECT,
    });

    return user ? UserMapper.toResponse(user) : null;
  }

  private async ensureEmailAvailable(
    email: string,
    excludedUserId?: string,
  ): Promise<void> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email,
        ...(excludedUserId && { id: { not: excludedUserId } }),
      },
      select: { id: true },
    });

    if (existingUser) {
      throw new BusinessException(
        ErrorCode.USER_EMAIL_EXISTS,
        'Email is already registered',
        409,
      );
    }
  }
}
