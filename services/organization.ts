import {
  getFirstOrganizationByUserId,
  getOrganizationByUserId,
} from "@/server/repositories/organization.repository";

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
