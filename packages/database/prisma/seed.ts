import { Prisma, PrismaClient } from "@prisma/client";
type TransactionClient = Prisma.TransactionClient;
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import { resolve } from "node:path";
import { env } from "prisma/config";
import { compare, hash } from "bcrypt";

const PERMISSIONS = {
  USER_CREATE: { name: "user:create", description: "Create users" },
  USER_READ: { name: "user:read", description: "Read users" },
  USER_UPDATE: { name: "user:update", description: "Update users" },
  USER_DELETE: { name: "user:delete", description: "Delete users" },
} as const;

const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  EMPLOYEE: "EMPLOYEE",
} as const;

const ROLE_DEFINITIONS = {
  [ROLES.ADMIN]: {
    description: "Administrator with full access",
    permissions: [...Object.values(PERMISSIONS)],
    isSystem: true,
  },
  [ROLES.MANAGER]: {
    description: "Manager user",
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.USER_CREATE,
      PERMISSIONS.USER_UPDATE,
    ],
    isSystem: true,
  },
  [ROLES.EMPLOYEE]: {
    description: "Default employee role",
    permissions: [PERMISSIONS.USER_READ],
    isSystem: true,
  },
} as const;

config({
  path: resolve(__dirname, "../../../.env"),
});

const adapter = new PrismaPg({
  connectionString: env("DATABASE_URL"),
});

const prisma = new PrismaClient({
  adapter,
});

async function seedPermissions(tx: TransactionClient): Promise<void> {
  for (const permission of Object.values(PERMISSIONS)) {
    await tx.permission.upsert({
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

async function seedRoles(tx: TransactionClient): Promise<void> {
  for (const [roleName, roleData] of Object.entries(ROLE_DEFINITIONS)) {
    const role = await tx.role.upsert({
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

    const permissionNames = roleData.permissions.map(
      (permission) => permission.name,
    );

    const permissions = await tx.permission.findMany({
      where: {
        name: {
          in: permissionNames,
        },
      },
    });

    if (permissions.length !== permissionNames.length) {
      const existingPermissionNames = new Set(
        permissions.map((permission) => permission.name),
      );

      const missingPermissionNames = permissionNames.filter(
        (permissionName) => !existingPermissionNames.has(permissionName),
      );

      throw new Error(
        `Missing permissions for role ${roleName}: ${missingPermissionNames.join(", ")}`,
      );
    }

    const permissionIds = permissions.map((permission) => permission.id);

    await tx.rolePermission.deleteMany({
      where: {
        roleId: role.id,
        permissionId: {
          notIn: permissionIds,
        },
      },
    });

    await tx.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId: role.id,
        permissionId,
      })),
      skipDuplicates: true,
    });
  }
}

async function seedAdminUser(tx: TransactionClient): Promise<void> {
  const email = env("SEED_ADMIN_EMAIL").trim().toLowerCase();
  const password = env("SEED_ADMIN_PASSWORD");
  const firstName = env("SEED_ADMIN_FIRST_NAME").trim();
  const lastName = env("SEED_ADMIN_LAST_NAME").trim();

  const adminRole = await tx.role.findUnique({
    where: {
      name: ROLES.ADMIN,
    },
  });

  if (!adminRole) {
    throw new Error(
      `Role ${ROLES.ADMIN} is missing. Run seedRoles before seedAdminUser.`,
    );
  }

  const existingAdmin = await tx.user.findUnique({
    where: {
      email,
    },
  });

  let adminUser;

  if (!existingAdmin) {
    adminUser = await tx.user.create({
      data: {
        email,
        password: await hash(password, 12),
        firstName,
        lastName,
        isActive: true,
      },
    });
  } else {
    const passwordMatches = await compare(password, existingAdmin.password);

    const requiresUpdate =
      existingAdmin.firstName !== firstName ||
      existingAdmin.lastName !== lastName ||
      !existingAdmin.isActive ||
      existingAdmin.deletedAt !== null ||
      !passwordMatches;

    if (requiresUpdate) {
      adminUser = await tx.user.update({
        where: {
          id: existingAdmin.id,
        },
        data: {
          firstName,
          lastName,
          isActive: true,
          deletedAt: null,
          ...(!passwordMatches && {
            password: await hash(password, 12),
          }),
        },
      });
    } else {
      adminUser = existingAdmin;
    }
  }

  await tx.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log(`👤 Administrator ready: ${email}`);
}

async function main(): Promise<void> {
  console.log("🌱 Starting seed");

  await prisma.$transaction(async (tx) => {
    await seedPermissions(tx);
    await seedRoles(tx);
    await seedAdminUser(tx);
  });

  console.log("✅ Seed completed");
}

main()
  .catch((error: unknown) => {
    console.error("❌ Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
