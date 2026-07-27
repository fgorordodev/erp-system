import { Test, type TestingModule } from '@nestjs/testing';

import { createUsersServiceMock, type UsersServiceMock } from '@test/mocks';

import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let module: TestingModule;
  let controller: UsersController;

  let usersServiceMock: UsersServiceMock;

  const createdAt = new Date('2026-07-22T21:00:00.000Z');
  const updatedAt = new Date('2026-07-23T18:00:00.000Z');

  const createResponse = (id = 'user-id') => ({
    id,
    email: `${id}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    roles: [{ name: 'EMPLOYEE' }],
    createdAt,
    updatedAt,
  });

  beforeEach(async () => {
    usersServiceMock = createUsersServiceMock();

    module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    controller = module.get(UsersController);
  });

  afterEach(async () => {
    await module.close();
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('delegates to UsersService.create', async () => {
      const dto: CreateUserDto = {
        email: 'user@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = createResponse();

      usersServiceMock.create.mockResolvedValue(response);

      await expect(controller.create(dto)).resolves.toEqual(response);

      expect(usersServiceMock.create).toHaveBeenCalledTimes(1);
      expect(usersServiceMock.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('delegates to UsersService.findAll', async () => {
      const response = [createResponse(), createResponse('admin')];

      usersServiceMock.findAll.mockResolvedValue(response);

      await expect(controller.findAll()).resolves.toEqual(response);

      expect(usersServiceMock.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findMe', () => {
    it('delegates to UsersService.findOne using authenticated user id', async () => {
      const currentUser: AuthenticatedUser = {
        userId: 'current-user',
        sessionId: 'session-id',
        email: 'user@example.com',
        permissions: [],
        roles: [],
      };

      const response = createResponse(currentUser.userId);

      usersServiceMock.findOne.mockResolvedValue(response);

      await expect(controller.findMe(currentUser)).resolves.toEqual(response);

      expect(usersServiceMock.findOne).toHaveBeenCalledTimes(1);
      expect(usersServiceMock.findOne).toHaveBeenCalledWith('current-user');
    });
  });

  describe('findOne', () => {
    it('delegates to UsersService.findOne', async () => {
      const response = createResponse();

      usersServiceMock.findOne.mockResolvedValue(response);

      await expect(controller.findOne('user-id')).resolves.toEqual(response);

      expect(usersServiceMock.findOne).toHaveBeenCalledWith('user-id');
    });
  });

  describe('update', () => {
    it('delegates to UsersService.update', async () => {
      const dto: UpdateUserDto = {
        firstName: 'Updated',
      };

      const response = createResponse();

      usersServiceMock.update.mockResolvedValue(response);

      await expect(controller.update('user-id', dto)).resolves.toEqual(
        response,
      );

      expect(usersServiceMock.update).toHaveBeenCalledTimes(1);
      expect(usersServiceMock.update).toHaveBeenCalledWith('user-id', dto);
    });
  });

  describe('updateStatus', () => {
    it('delegates only the boolean flag', async () => {
      const dto: UpdateUserStatusDto = {
        isActive: false,
      };

      const response = createResponse();

      usersServiceMock.updateStatus.mockResolvedValue(response);

      await expect(controller.updateStatus('user-id', dto)).resolves.toEqual(
        response,
      );

      expect(usersServiceMock.updateStatus).toHaveBeenCalledTimes(1);
      expect(usersServiceMock.updateStatus).toHaveBeenCalledWith(
        'user-id',
        false,
      );
    });
  });

  describe('remove', () => {
    it('delegates to UsersService.remove', async () => {
      const response = createResponse();

      usersServiceMock.remove.mockResolvedValue(response);

      await expect(controller.remove('user-id')).resolves.toEqual(response);

      expect(usersServiceMock.remove).toHaveBeenCalledTimes(1);
      expect(usersServiceMock.remove).toHaveBeenCalledWith('user-id');
    });
  });
});
