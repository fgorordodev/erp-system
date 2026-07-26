import { Injectable } from '@nestjs/common';

import { PrismaService } from '@backend/database';
import type { Prisma } from '@erp/database';

import type {
  UserAuthProjection,
  UserFailedLoginAttemptsProjection,
  UserResponseProjection,
} from './user.projection';
import { USER_AUTH_SELECT, USER_RESPONSE_SELECT } from './user.select';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';

type UserDatabaseClient = Pick<Prisma.TransactionClient, 'user'>;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findRoleIdByName(roleName: string): Promise<string | null> {
    const role = await this.prisma.role.findUnique({
      where: {
        name: roleName,
      },
      select: {
        id: true,
      },
    });

    return role?.id ?? null;
  }

  create(input: CreateUserInput): Promise<UserResponseProjection> {
    return this.prisma.user.create({
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
  }

  findAll(): Promise<UserResponseProjection[]> {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: USER_RESPONSE_SELECT,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findById(id: string): Promise<UserResponseProjection | null> {
    return this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: USER_RESPONSE_SELECT,
    });
  }

  findAuthByEmail(email: string): Promise<UserAuthProjection | null> {
    return this.prisma.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        deletedAt: null,
      },
      select: USER_AUTH_SELECT,
    });
  }

  async existsByEmail(
    email: string,
    excludedUserId?: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        ...(excludedUserId
          ? {
              id: {
                not: excludedUserId,
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });

    return user !== null;
  }

  update(id: string, input: UpdateUserInput): Promise<UserResponseProjection> {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: input,
      select: USER_RESPONSE_SELECT,
    });
  }

  softDelete(id: string): Promise<UserResponseProjection> {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
      select: USER_RESPONSE_SELECT,
    });
  }

  updateStatus(id: string, isActive: boolean): Promise<UserResponseProjection> {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        isActive,
      },
      select: USER_RESPONSE_SELECT,
    });
  }

  async updatePassword(
    userId: string,
    passwordHash: string,
    database: UserDatabaseClient = this.prisma,
  ): Promise<void> {
    await database.user.update({
      where: {
        id: userId,
      },
      data: {
        password: passwordHash,
      },
    });
  }

  incrementFailedLoginAttempts(
    userId: string,
    failedAt: Date,
    database: UserDatabaseClient = this.prisma,
  ): Promise<UserFailedLoginAttemptsProjection> {
    return database.user.update({
      where: {
        id: userId,
      },
      data: {
        failedLoginAttempts: {
          increment: 1,
        },
        lastFailedLoginAt: failedAt,
      },
      select: {
        failedLoginAttempts: true,
      },
    });
  }

  async setLockedUntil(
    userId: string,
    lockedUntil: Date,
    database: UserDatabaseClient = this.prisma,
  ): Promise<void> {
    await database.user.update({
      where: {
        id: userId,
      },
      data: {
        lockedUntil,
      },
    });
  }

  async resetLoginFailures(
    userId: string,
    database: UserDatabaseClient = this.prisma,
  ): Promise<void> {
    await database.user.update({
      where: {
        id: userId,
      },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastFailedLoginAt: null,
      },
    });
  }
}
