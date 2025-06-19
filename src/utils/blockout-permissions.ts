import {
  TalentBlockoutDatabase,
  TalentExpandedBlockout,
} from "@/types/blockouts";

/**
 * Utility functions for checking blockout permissions
 */

/**
 * Checks if a blockout can be edited
 * Business rule: Blockouts can only be edited if their end_time is in the future
 *
 * @param blockout - The blockout to check
 * @returns true if the blockout can be edited, false otherwise
 */
export const canEditBlockout = (blockout: TalentBlockoutDatabase): boolean => {
  const now = new Date();
  const endTime = new Date(blockout.end_time);
  return endTime > now;
};

/**
 * Checks if a blockout can be deleted
 * Business rule: Blockouts can only be deleted if their end_time is in the future
 *
 * @param blockout - The blockout to check
 * @returns true if the blockout can be deleted, false otherwise
 */
export const canDeleteBlockout = (
  blockout: TalentBlockoutDatabase
): boolean => {
  // Same rule as editing for now
  return canEditBlockout(blockout);
};

/**
 * Gets the status of a blockout for display purposes
 *
 * @param blockout - The blockout to get status for
 * @returns object with status information
 */
export const getBlockoutStatus = (blockout: TalentExpandedBlockout) => {
  const now = new Date();
  const startTime = new Date(blockout.start_time);
  const endTime = new Date(blockout.end_time);

  if (endTime <= now) {
    return {
      status: "ended" as const,
      label: "Ended - View Only",
      canEdit: false,
      canDelete: false,
    };
  } else if (startTime <= now && endTime > now) {
    return {
      status: "active" as const,
      label: "Active - Editable",
      canEdit: true,
      canDelete: true,
    };
  } else {
    return {
      status: "upcoming" as const,
      label: "Upcoming - Editable",
      canEdit: true,
      canDelete: true,
    };
  }
};
