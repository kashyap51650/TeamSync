import {
  getOrgAnalytics,
  getProductivityOverTime,
} from "@/server/repositories/analytics.repository";
import { cacheTag } from "next/cache";

export const fetchOrganizationAnalytics = async (
  userId: string | undefined,
  orgId?: string,
) => {
  "use cache";
  cacheTag("analytics-overview");
  try {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    if (!orgId) {
      throw new Error("Organization not found for user");
    }

    const stats = await getOrgAnalytics(orgId);
    return stats;
  } catch (error) {
    console.error("Error fetching analytics", error);
    throw error;
  }
};

export const fetchProductivityOverTime = async (
  orgId: string,
  days: number = 14,
) => {
  "use cache";
  cacheTag("analytics-productivity");
  try {
    if (!orgId) {
      throw new Error("Organization not found for user");
    }
    const data = await getProductivityOverTime(orgId, days);
    return data;
  } catch (error) {
    console.error("Error fetching productivity over time", error);
    throw error;
  }
};
