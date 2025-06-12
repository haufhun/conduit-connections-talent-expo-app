import { supabase } from "@/lib/supabase";
import type { TalentWithSkills } from "../types/user-talent-skills";
import { expandRecurringBlockouts, isUserAvailable } from "../utils/rrule";

export interface AvailabilityFilter {
  startTime: string;
  endTime: string;
  skillIds?: number[];
  excludeUserIds?: string[];
}

export interface AvailableUser extends TalentWithSkills {
  availability_status: "available" | "partially_available" | "unavailable";
  conflicting_blockouts: any[];
}

/**
 * Get available users for a specific time range
 */
export const getAvailableUsers = async (
  filter: AvailabilityFilter
): Promise<{ data: AvailableUser[] | null; error: any }> => {
  try {
    // First, get all users with their skills and blockouts
    let query = supabase.from("user_talent_skills").select("*");

    // Filter by skills if provided
    if (filter.skillIds && filter.skillIds.length > 0) {
      query = query.overlaps("skill_ids", filter.skillIds);
    }

    // Exclude specific users if provided
    if (filter.excludeUserIds && filter.excludeUserIds.length > 0) {
      query = query.not("id", "in", `(${filter.excludeUserIds.join(",")})`);
    }

    const { data: users, error } = await query;

    if (error) {
      return { data: null, error };
    }

    if (!users) {
      return { data: [], error: null };
    }

    // Process each user's availability
    const requestStart = new Date(filter.startTime);
    const requestEnd = new Date(filter.endTime);

    const processedUsers: AvailableUser[] = users.map((user) => {
      const { available, conflictingBlockouts } = isUserAvailable(
        user.talent_blockouts || [],
        requestStart,
        requestEnd
      );

      return {
        ...user,
        availability_status: available ? "available" : "unavailable",
        conflicting_blockouts: conflictingBlockouts,
      };
    });

    // Sort by availability (available users first)
    processedUsers.sort((a, b) => {
      if (
        a.availability_status === "available" &&
        b.availability_status !== "available"
      ) {
        return -1;
      }
      if (
        a.availability_status !== "available" &&
        b.availability_status === "available"
      ) {
        return 1;
      }
      return 0;
    });

    return { data: processedUsers, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Check if a specific user is available for a time range
 */
export const checkUserAvailability = async (
  userId: string,
  startTime: string,
  endTime: string
): Promise<{
  available: boolean;
  conflictingBlockouts: any[];
  error?: any;
}> => {
  try {
    const { data: user, error } = await supabase
      .from("user_talent_skills")
      .select("talent_blockouts")
      .eq("id", userId)
      .single();

    if (error) {
      return { available: false, conflictingBlockouts: [], error };
    }

    const { available, conflictingBlockouts } = isUserAvailable(
      user?.talent_blockouts || [],
      new Date(startTime),
      new Date(endTime)
    );

    return { available, conflictingBlockouts };
  } catch (error) {
    return { available: false, conflictingBlockouts: [], error };
  }
};

/**
 * Get a user's schedule for a specific date range (including recurring events)
 */
export const getUserSchedule = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<{ data: any[] | null; error: any }> => {
  try {
    const { data: user, error } = await supabase
      .from("user_talent_skills")
      .select("talent_blockouts")
      .eq("id", userId)
      .single();

    if (error) {
      return { data: null, error };
    }

    console.log("User Blockouts:", user?.talent_blockouts);

    const expandedBlockouts = expandRecurringBlockouts(
      user?.talent_blockouts || [],
      new Date(startDate),
      new Date(endDate)
    );

    console.log("Expanded Blockouts:", expandedBlockouts);

    return { data: expandedBlockouts, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
