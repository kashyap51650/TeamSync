import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const DEFAULT_NOTIFICATION_SETTINGS: Record<string, boolean> = {
  task_assigned: true,
  task_due_soon: true,
  project_updates: true,
};

export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    avatarUrl?: string;
  },
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
  });
}

export async function updateAllNotificationSettings(
  userId: string,
  settings: Record<string, boolean>,
) {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true },
  });

  return {
    notificationSettings: {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...settings,
    },
  };
}

export async function getUserNotificationSettings(userId: string) {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true },
  });

  return DEFAULT_NOTIFICATION_SETTINGS;
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword);

  return prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

export async function verifyUserPassword(userId: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      passwordHash: true,
    },
  });

  if (!user?.passwordHash) return false;

  // You'll need to import and use your password comparison function
  const { comparePassword } = await import("@/lib/auth");
  return comparePassword(password, user.passwordHash);
}
