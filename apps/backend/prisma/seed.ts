import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { env } from 'prisma/config';
import {
  HashService,
  PERMISSIONS,
  ROLE_DEFINITIONS,
  ROLES,
} from '../src/security';

config({
  path: resolve(__dirname, '../../../.env'),
});

const adapter = new PrismaPg({
  connectionString: env('DATABASE_URL'),
});

const prisma = new PrismaClient({
  adapter,
});

const hashService = new HashService();

async function seedPermissions() {
  for (const permission of Object.values(PERMISSIONS)) {
    await prisma.permission.upsert({
      where: {
        name: permission.name,
      },

      update: {
        description: permission.description,
      },

      create: {
        name: permission.name,

        description: permission.description,
      },
    });
  }
}

async function seedRoles() {
  for (const [roleName, roleData] of Object.entries(ROLE_DEFINITIONS)) {
    const role = await prisma.role.upsert({
      where: {
        name: roleName,
      },

      update: {
        description: roleData.description,
        isSystem: roleData.isSystem,
      },

      create: {
        name: roleName,
        description: roleData.description,
        isSystem: roleData.isSystem,
      },
    });

    for (const permissionData of roleData.permissions) {
      const permission = await prisma.permission.findUnique({
        where: {
          name: permissionData.name,
        },
      });

      if (!permission) {
        throw new Error(`Permission ${permissionData.name} missing`);
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,

            permissionId: permission.id,
          },
        },

        update: {},

        create: {
          roleId: role.id,

          permissionId: permission.id,
        },
      });
    }
  }
}

async function seedAdminUser(): Promise<void> {
  const email = env('SEED_ADMIN_EMAIL').trim().toLowerCase();
  const password = env('SEED_ADMIN_PASSWORD');
  const firstName = env('SEED_ADMIN_FIRST_NAME');
  const lastName = env('SEED_ADMIN_LAST_NAME');

  const adminRole = await prisma.role.findUnique({
    where: {
      name: ROLES.ADMIN,
    },
  });

  if (!adminRole) {
    throw new Error(
      `Role ${ROLES.ADMIN} is missing. Run seedRoles before seedAdminUser.`,
    );
  }

  const passwordHash = await hashService.hash(password);

  await prisma.user.upsert({
    where: {
      email,
    },

    update: {
      firstName,
      lastName,
      password: passwordHash,
      roleId: adminRole.id,
      isActive: true,
      deletedAt: null,
    },

    create: {
      email,
      password: passwordHash,
      firstName,
      lastName,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log(`👤 Administrator ready: ${email}`);
}

async function main() {
  console.log('🌱 Starting seed');

  await seedPermissions();

  await seedRoles();

  await seedAdminUser();

  console.log('✅ Seed completed');
}

main()
  .catch((error: unknown) => {
    console.error('❌ Seed failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
