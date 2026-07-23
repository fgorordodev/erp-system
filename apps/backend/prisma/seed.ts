import { PrismaClient } from '@prisma/client';

import { PERMISSIONS, ROLE_DEFINITIONS } from '../src/security';

import { PrismaPg } from '@prisma/adapter-pg';

import { config } from 'dotenv';

import { resolve } from 'node:path';

import { env } from 'prisma/config';

config({
  path: resolve(__dirname, '../../.env'),
});

const adapter = new PrismaPg({
  connectionString: env('DATABASE_URL'),
});

const prisma = new PrismaClient({
  adapter,
});

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

async function main() {
  console.log('🌱 Starting seed');

  await seedPermissions();

  await seedRoles();

  console.log('✅ Seed completed');
}

main()
  .catch(console.error)

  .finally(async () => {
    await prisma.$disconnect();
  });
