import { UserResponseDto } from '../dto';
import { UserAuthEntity, UserResponseEntity } from '../users.types';

type UserMapperInput = UserResponseEntity | UserAuthEntity;

export class UserMapper {
  static toResponse(user: UserMapperInput): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      role: {
        name: user.role.name,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
