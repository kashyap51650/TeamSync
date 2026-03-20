import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { put } from "@vercel/blob";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  MAX_AVATAR_FILE_SIZE,
  MIME_EXTENSIONS,
} from "@/lib/constant";

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

export async function uploadAvatarImage(userId: string, file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  if (file.size > MAX_AVATAR_FILE_SIZE) {
    throw new Error("File size exceeds 5MB");
  }

  const extension = MIME_EXTENSIONS[file.type] ?? "png";
  const blobPath = `avatars/${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  return put(blobPath, file, {
    access: "public",
    addRandomSuffix: false,
  });
}
