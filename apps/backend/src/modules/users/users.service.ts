import { Injectable } from '@nestjs/common';

import { BusinessException, ErrorCode } from '../../common/exceptions';
import { PrismaService } from '../../database';
import { HashService, ROLES } from '../../security';
import { CreateUserDto, UpdateUserDto } from './dto';

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  isActive: true,
  role: {
    select: {
      name: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async create(dto: CreateUserDto) {
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
      select: userSelect,
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: userSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: userSelect,
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

  findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        deletedAt: null,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
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
        email: dto.email,
        firstName: dto.firstName?.trim(),
        lastName: dto.lastName?.trim(),
      },
      select: userSelect,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
      select: userSelect,
    });
  }

  async updateStatus(id: string, isActive: boolean) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        isActive,
      },
      select: userSelect,
    });
  }
}
