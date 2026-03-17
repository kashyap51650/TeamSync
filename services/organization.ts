import {
  getFirstOrganizationByUserId,
  getOrganizationBySlug,
  getOrganizationByUserId,
} from "@/server/repositories/organization.repository";
import { cacheLife } from "next/cache";

export const fetchOrganizationByUser = async (userId: string | undefined) => {
  "use cache";
  try {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const organization = await getOrganizationByUserId(userId);

    if (!organization) {
      throw new Error("Organization not found for user");
    }

    return organization;
  } catch (error) {
    console.error("Error fetching organization", error);
    throw error;
  }
};

export const fetchFirstOrganizationByUser = async (
  userId: string | undefined,
) => {
  "use cache";
  try {
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const organization = await getFirstOrganizationByUserId(userId);
    return organization;
  } catch (error) {
    console.error("Error fetching organization", error);
    throw error;
  }
};

export const fetchOrganizationBySlug = async (slug: string) => {
  "use cache";
  try {
    const organization = await getOrganizationBySlug(slug);
    if (!organization) {
      throw new Error("Organization not found");
    }
    return organization;
  } catch (error) {
    console.error("Error fetching organization", error);
    throw error;
  }
};
