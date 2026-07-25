import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@erp/database';

import { BusinessException, ErrorCode } from '@backend/common';
import { PrismaService } from '@backend/database';
import { UserMapper } from '@backend/modules/users/mappers';
import {
  USER_AUTH_SELECT,
  USER_RESPONSE_SELECT,
  type CreateUserInput,
  type UpdateUserInput,
  type UserAuthProjection,
} from '@backend/modules/users/persistence';
import { HashService, ROLES } from '@backend/security';

import type { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const email = this.normalizeEmail(dto.email);

    await this.ensureEmailAvailable(email);

    const defaultRole = await this.prisma.role.findUnique({
      where: {
        name: ROLES.EMPLOYEE,
      },
      select: {
        id: true,
      },
    });

    if (!defaultRole) {
      throw new BusinessException(
        ErrorCode.INTERNAL_ERROR,
        `Default role ${ROLES.EMPLOYEE} was not found`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const input: CreateUserInput = {
      email,
      passwordHash: await this.hashService.hash(dto.password),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      roleId: defaultRole.id,
    };

    try {
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
    } catch (error: unknown) {
      this.handleUniqueConstraintError(error);

      throw error;
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: USER_RESPONSE_SELECT,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => UserMapper.toResponse(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: USER_RESPONSE_SELECT,
    });

    if (!user) {
      throw this.userNotFoundException();
    }

    return UserMapper.toResponse(user);
  }

  findByEmail(email: string): Promise<UserAuthProjection | null> {
    return this.prisma.user.findFirst({
      where: {
        email: this.normalizeEmail(email),
        deletedAt: null,
      },
      select: USER_AUTH_SELECT,
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const email =
      dto.email !== undefined ? this.normalizeEmail(dto.email) : undefined;

    if (email !== undefined) {
      await this.ensureEmailAvailable(email, id);
    }

    const input: UpdateUserInput = {
      ...(email !== undefined && {
        email,
      }),
      ...(dto.firstName !== undefined && {
        firstName: dto.firstName.trim(),
      }),
      ...(dto.lastName !== undefined && {
        lastName: dto.lastName.trim(),
      }),
    };

    try {
      const user = await this.prisma.$transaction(async (transaction) => {
        await this.ensureUserExists(transaction, id);

        return transaction.user.update({
          where: {
            id,
          },
          data: input,
          select: USER_RESPONSE_SELECT,
        });
      });

      return UserMapper.toResponse(user);
    } catch (error: unknown) {
      this.handleUniqueConstraintError(error);

      throw error;
    }
  }

  async remove(id: string): Promise<UserResponseDto> {
    const now = new Date();

    const user = await this.prisma.$transaction(async (transaction) => {
      await this.ensureUserExists(transaction, id);

      const updatedUser = await transaction.user.update({
        where: {
          id,
        },
        data: {
          deletedAt: now,
          isActive: false,
        },
        select: USER_RESPONSE_SELECT,
      });

      await this.revokeAllUserSessions(transaction, id, now);

      return updatedUser;
    });

    return UserMapper.toResponse(user);
  }

  async updateStatus(id: string, isActive: boolean): Promise<UserResponseDto> {
    const now = new Date();

    const user = await this.prisma.$transaction(async (transaction) => {
      await this.ensureUserExists(transaction, id);

      const updatedUser = await transaction.user.update({
        where: {
          id,
        },
        data: {
          isActive,
        },
        select: USER_RESPONSE_SELECT,
      });

      if (!isActive) {
        await this.revokeAllUserSessions(transaction, id, now);
      }

      return updatedUser;
    });

    return UserMapper.toResponse(user);
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: USER_RESPONSE_SELECT,
    });

    return user ? UserMapper.toResponse(user) : null;
  }

  private async ensureUserExists(
    transaction: Prisma.TransactionClient,
    id: string,
  ): Promise<void> {
    const user = await transaction.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw this.userNotFoundException();
    }
  }

  private async revokeAllUserSessions(
    transaction: Prisma.TransactionClient,
    userId: string,
    revokedAt: Date,
  ): Promise<void> {
    await transaction.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    });

    await transaction.refreshToken.updateMany({
      where: {
        session: {
          userId,
        },
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    });
  }

  private async ensureEmailAvailable(
    email: string,
    excludedUserId?: string,
  ): Promise<void> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: this.normalizeEmail(email),
        ...(excludedUserId !== undefined && {
          id: {
            not: excludedUserId,
          },
        }),
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      throw this.emailAlreadyExistsException();
    }
  }

  private handleUniqueConstraintError(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw this.emailAlreadyExistsException();
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private userNotFoundException(): BusinessException {
    return new BusinessException(
      ErrorCode.USER_NOT_FOUND,
      'User not found',
      HttpStatus.NOT_FOUND,
    );
  }

  private emailAlreadyExistsException(): BusinessException {
    return new BusinessException(
      ErrorCode.USER_EMAIL_EXISTS,
      'Email is already registered',
      HttpStatus.CONFLICT,
    );
  }
}
