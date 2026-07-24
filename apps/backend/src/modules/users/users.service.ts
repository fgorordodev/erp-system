import { Injectable } from '@nestjs/common';

import { BusinessException, ErrorCode } from '../../common/exceptions';
import { PrismaService } from '../../database';
import { HashService, ROLES } from '../../security';
import { CreateUserDto, UpdateUserDto } from './dto';
import { USER_AUTH_SELECT, USER_RESPONSE_SELECT } from './persistence';
import { UserAuthProjection, UserResponseProjection } from './persistence';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseProjection> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      throw new BusinessException(
        ErrorCode.USER_EMAIL_EXISTS,
        'Email is already registered',
        409,
      );
    }

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
        500,
      );
    }

    const hashedPassword = await this.hashService.hash(dto.password);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        role: {
          connect: {
            id: defaultRole.id,
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

  async findOne(id: string): Promise<UserResponseProjection> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: USER_RESPONSE_SELECT,
    });

    if (!user) {
      throw new BusinessException(
        ErrorCode.USER_NOT_FOUND,
        'User not found',
        404,
      );
    }

    return user;
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

  async update(
    id: string,
    dto: UpdateUserDto,
  ): Promise<UserResponseProjection> {
    await this.findOne(id);

    if (dto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
          id: {
            not: id,
          },
        },
        select: {
          id: true,
        },
      });

      if (existingUser) {
        throw new BusinessException(
          ErrorCode.USER_EMAIL_EXISTS,
          'Email is already registered',
          409,
        );
      }
    }

    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...(dto.email !== undefined && {
          email: dto.email,
        }),
        ...(dto.firstName !== undefined && {
          firstName: dto.firstName.trim(),
        }),
        ...(dto.lastName !== undefined && {
          lastName: dto.lastName.trim(),
        }),
      },
      select: USER_RESPONSE_SELECT,
    });
  }

  async remove(id: string): Promise<UserResponseProjection> {
    await this.findOne(id);

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

  async updateStatus(
    id: string,
    isActive: boolean,
  ): Promise<UserResponseProjection> {
    await this.findOne(id);

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

  findById(id: string): Promise<UserResponseProjection | null> {
    return this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: USER_RESPONSE_SELECT,
    });
  }
}
