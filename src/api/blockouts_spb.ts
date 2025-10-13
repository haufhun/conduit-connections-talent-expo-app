import { supabase } from "../lib/supabase";
import type {
  CreateTalentBlockout,
  TalentBlockoutDatabase,
  UpdateTalentBlockout,
} from "../types/blockouts";

/**
 * Get all blockouts for a talent
 */
export const getTalentBlockouts = async (talentId: string) => {
  const { data, error } = await supabase
    .from("talent_blockouts")
    .select("*")
    .eq("talent_id", talentId)
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data as TalentBlockoutDatabase[];
};

export const getTalentBlockoutsById = async (blockoutId: number) => {
  const { data, error } = await supabase
    .from("talent_blockouts")
    .select("*")
    .eq("id", blockoutId)
    .single();
  if (error) throw error;
  return data as TalentBlockoutDatabase;
};

/**
 * Get blockouts for a talent within a specific date range
 */
export const getTalentBlockoutsInRange = async (
  talentId: string,
  startDate: string,
  endDate: string
) => {
  const { data, error } = await supabase
    .from("talent_blockouts")
    .select("*")
    .eq("talent_id", talentId)
    .gte("start_time", startDate)
    .lte("end_time", endDate)
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data as TalentBlockoutDatabase[];
};

/**
 * Get all recurring blockouts for a talent
 */
export const getTalentRecurringBlockouts = async (talentId: string) => {
  const { data, error } = await supabase
    .from("talent_blockouts")
    .select("*")
    .eq("talent_id", talentId)
    .not("rrule", "is", null)
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data as TalentBlockoutDatabase[];
};

/**
 * Create a new blockout
 */
export const createTalentBlockout = async (
  talentId: string,
  blockout: CreateTalentBlockout
) => {
  const { data, error } = await supabase
    .from("talent_blockouts")
    .insert({
      talent_id: talentId,
      ...blockout,
    })
    .select()
    .single();

  if (error) throw error;
  return data as TalentBlockoutDatabase;
};

/**
 * Update an existing blockout
 */
export const updateTalentBlockout = async (
  blockoutId: number,
  updates: UpdateTalentBlockout
) => {
  // First, get the existing blockout to check if it can be edited
  const { data: existingBlockout, error: fetchError } = await supabase
    .from("talent_blockouts")
    .select("end_time")
    .eq("id", blockoutId)
    .single();

  if (fetchError) throw fetchError;

  // Check if blockout can be edited (end time must be in the future)
  const now = new Date();
  const endTime = new Date(existingBlockout.end_time);

  if (endTime <= now) {
    throw new Error(
      "Cannot update blockout: This blockout has already ended and can only be edited if the end time is in the future."
    );
  }

  const { data, error } = await supabase
    .from("talent_blockouts")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", blockoutId)
    .select()
    .single();

  if (error) throw error;
  return data as TalentBlockoutDatabase;
};

/**
 * Delete a blockout (hard delete - permanently removes from database)
 */
export const deleteTalentBlockout = async (blockoutId: number) => {
  const { data, error } = await supabase
    .from("talent_blockouts")
    .delete()
    .eq("id", blockoutId)
    .select()
    .single();

  if (error) throw error;
  return data as TalentBlockoutDatabase;
};

/**
 * Check if a talent is available during a specific time period
 * This function checks for conflicts with existing blockouts
 */
export const checkTalentAvailability = async (
  talentId: string,
  startTime: string,
  endTime: string
) => {
  // Check for overlapping blockouts
  const { data, error } = await supabase
    .from("talent_blockouts")
    .select("id, title, start_time, end_time, is_all_day")
    .eq("talent_id", talentId)
    .or(
      `and(start_time.lte.${startTime},end_time.gte.${startTime}),and(start_time.lte.${endTime},end_time.gte.${endTime}),and(start_time.gte.${startTime},end_time.lte.${endTime})`
    );

  if (error) throw error;

  return {
    isAvailable: data.length === 0,
    conflictingBlockouts: data,
  };
};

/**
 * Get blockouts that overlap with a specific time period
 */
export const getOverlappingBlockouts = async (
  talentId: string,
  startTime: string,
  endTime: string
) => {
  const { data, error } = await supabase
    .from("talent_blockouts")
    .select("*")
    .eq("talent_id", talentId)
    .or(
      `and(start_time.lte.${startTime},end_time.gte.${startTime}),and(start_time.lte.${endTime},end_time.gte.${endTime}),and(start_time.gte.${startTime},end_time.lte.${endTime})`
    );

  if (error) throw error;
  return data as TalentBlockoutDatabase[];
};

/**
 * Bulk create multiple blockouts
 */
export const createMultipleTalentBlockouts = async (
  talentId: string,
  blockouts: CreateTalentBlockout[]
) => {
  const blockoutsWithTalentId = blockouts.map((blockout) => ({
    talent_id: talentId,
    ...blockout,
  }));

  const { data, error } = await supabase
    .from("talent_blockouts")
    .insert(blockoutsWithTalentId)
    .select();

  if (error) throw error;
  return data as TalentBlockoutDatabase[];
};

/**
 * Get upcoming blockouts for a talent (next 30 days)
 */
export const getUpcomingTalentBlockouts = async (talentId: string) => {
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  const { data, error } = await supabase
    .from("talent_blockouts")
    .select("*")
    .eq("talent_id", talentId)
    .gte("start_time", now.toISOString())
    .lte("start_time", thirtyDaysFromNow.toISOString())
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data as TalentBlockoutDatabase[];
};
