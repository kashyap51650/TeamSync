"use server";

import { getCurrentUser } from "@/lib/auth";
import {
  updateUserProfile,
  updateAllNotificationSettings,
  updateUserPassword,
  verifyUserPassword,
  getUserNotificationSettings,
} from "@/server/repositories/settings.repository";

interface UpdateProfilePayload {
  name: string;
}

interface NotificationSettings {
  [key: string]: boolean;
}

interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface SettingsResponse {
  success: boolean;
  error?: string;
  data?: unknown;
}

export async function updateProfileAction(
  payload: UpdateProfilePayload,
): Promise<SettingsResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const result = await updateUserProfile(user.sub, {
      name: payload.name,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function updateNotificationSettingsAction(
  payload: NotificationSettings,
): Promise<SettingsResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get current settings and merge with new ones
    const currentSettings = await getUserNotificationSettings(user.sub);
    const mergedSettings = {
      ...currentSettings,
      ...payload,
    };

    const result = await updateAllNotificationSettings(
      user.sub,
      mergedSettings,
    );

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function updatePasswordAction(
  payload: UpdatePasswordPayload,
): Promise<SettingsResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Verify current password
    const isValid = await verifyUserPassword(user.sub, payload.currentPassword);
    if (!isValid) {
      return {
        success: false,
        error: "Current password is incorrect",
      };
    }

    // Update password
    const result = await updateUserPassword(user.sub, payload.newPassword);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
