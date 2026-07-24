import { UserResponseDto } from '../dto';

interface UserMapperInput {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: {
    name: string;
  };
}

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
