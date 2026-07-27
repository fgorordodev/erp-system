import type { PrismaService } from '@backend/database';

export type PrismaServiceMock = {
  role: {
    findUnique: jest.MockedFunction<PrismaService['role']['findUnique']>;
  };
  user: {
    create: jest.MockedFunction<PrismaService['user']['create']>;
    findMany: jest.MockedFunction<PrismaService['user']['findMany']>;
    findFirst: jest.MockedFunction<PrismaService['user']['findFirst']>;
    update: jest.MockedFunction<PrismaService['user']['update']>;
  };
};

export const createPrismaServiceMock = (): PrismaServiceMock => ({
  role: {
    findUnique: jest.fn(),
  },
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
});
