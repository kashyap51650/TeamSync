"use server";

import { authenticatedAction } from "@/lib/action";
import {
  updateUserProfile,
  updateAllNotificationSettings,
  updateUserPassword,
  verifyUserPassword,
  getUserNotificationSettings,
  uploadAvatarImage,
} from "@/server/repositories/settings.repository";

interface UpdateProfilePayload {
  name: string;
  avatarUrl?: string;
}

interface NotificationSettings {
  [key: string]: boolean;
}

interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const updateProfileAction = authenticatedAction(
  async (user, payload: UpdateProfilePayload) => {
    const result = await updateUserProfile(user.sub, {
      name: payload.name,
      avatarUrl: payload.avatarUrl,
    });

    return result;
  },
);

export const updateNotificationSettingsAction = authenticatedAction(
  async (user, payload: NotificationSettings) => {
    const currentSettings = await getUserNotificationSettings(user.sub);
    const mergedSettings = {
      ...currentSettings,
      ...payload,
    };

    const result = await updateAllNotificationSettings(user.sub, mergedSettings);

    return result;
  },
);

export const updatePasswordAction = authenticatedAction(
  async (user, payload: UpdatePasswordPayload) => {
    const isValid = await verifyUserPassword(user.sub, payload.currentPassword);
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }
    const result = await updateUserPassword(user.sub, payload.newPassword);

    return result;
  },
);

export const uploadAvatarAction = authenticatedAction(async (user, formData: FormData) => {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("File is required");
  }
  const blob = await uploadAvatarImage(user.sub, file);
  return { url: blob.url };
});
