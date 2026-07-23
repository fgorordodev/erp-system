import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database';

import { BusinessException } from '../../common/exceptions/business.exception';

import { ErrorCode } from '../../common/exceptions/error.codes';

import { HashService } from '../../security';

import { CreateUserDto } from './dto/create-user.dto';

import { UpdateUserDto } from './dto/update-user.dto';

const DEFAULT_ROLE = 'EMPLOYEE';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly hashService: HashService,
  ) {}

  async create(dto: CreateUserDto) {
    const password = await this.hashService.hash(dto.password);

    const defaultRole = await this.prisma.role.findUnique({
      where: {
        name: DEFAULT_ROLE,
      },
    });

    if (!defaultRole) {
      throw new Error(`Default role ${DEFAULT_ROLE} not found`);
    }

    return this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        password,
        role: {
          connect: {
            id: defaultRole.id,
          },
        },
      },
      select: {
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
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: {
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
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
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
      },
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

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
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

    return this.prisma.user.update({
      where: {
        id,
      },
      data: dto,
      select: {
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
        updatedAt: true,
      },
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
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }
}
