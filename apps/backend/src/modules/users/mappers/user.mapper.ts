import { UserResponseDto } from '@backend/modules/users/dto';
import { UserAuthProjection, UserResponseProjection } from '../persistence';

type UserMapperInput = UserResponseProjection | UserAuthProjection;

export class UserMapper {
  static toResponse(user: UserMapperInput): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: user.roles.map(({ role }) => ({ name: role.name })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
