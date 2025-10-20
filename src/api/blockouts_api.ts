import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment-timezone";
import { useAuth } from "../providers/auth-provider";
import type {
  CreateTalentBlockout,
  TalentBlockoutDatabase,
} from "../types/blockouts";
import {
  createTalentBlockout,
  deleteTalentBlockout,
  getTalentBlockouts,
  getTalentBlockoutsById,
  updateTalentBlockout,
} from "./blockouts_spb";
import type { AvailabilityFilter } from "./talent_blockout_schedule_spb";
import {
  checkUserAvailability,
  getAvailableUsers,
  getUserSchedule,
} from "./talent_blockout_schedule_spb";

export const useAvailableUsers = (filter: AvailabilityFilter) => {
  return useQuery({
    queryKey: ["available-users", filter],
    queryFn: () => getAvailableUsers(filter),
    enabled: !!filter.startTime && !!filter.endTime,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUserAvailability = (
  userId: string,
  startTime: string,
  endTime: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["user-availability", userId, startTime, endTime],
    queryFn: () => checkUserAvailability(userId, startTime, endTime),
    enabled: enabled && !!userId && !!startTime && !!endTime,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useUserSchedule = (
  userId: string,
  startDate: string,
  endDate: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["user-schedule", userId, startDate, endDate],
    queryFn: () => {
      return getUserSchedule(userId, startDate, endDate);
      // return getTalentBlockouts(userId);
    },
    enabled: enabled && !!userId && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateTalentBlockout = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const talentId = session?.user?.id ?? "";

  if (!talentId) {
    throw new Error("User ID is not available");
  }

  return useMutation<TalentBlockoutDatabase, Error, CreateTalentBlockout>({
    mutationFn: async (blockoutData) => {
      if (blockoutData.is_all_day) {
        const startTime = moment
          .utc(blockoutData.start_time)
          .startOf("day")
          .toISOString();
        const endTime = moment
          .utc(blockoutData.end_time)
          .endOf("day")
          .toISOString();

        blockoutData.start_time = startTime;
        blockoutData.end_time = endTime;
      }

      return createTalentBlockout(talentId, blockoutData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["talent-blockouts"] });
    },
  });
};

export const useGetTalentBlockoutById = (
  blockoutId: number,
  enabled: boolean = true
) => {
  return useQuery<TalentBlockoutDatabase>({
    queryKey: ["talent-blockout", blockoutId],
    queryFn: () => {
      if (!blockoutId) {
        throw new Error("Blockout ID is required");
      }
      return getTalentBlockoutsById(blockoutId);
    },
    enabled: enabled && !!blockoutId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetTalentBlockouts = (enabled: boolean = true) => {
  const { session } = useAuth();
  const talentId = session?.user?.id ?? "";

  if (!talentId) {
    throw new Error("User ID is not available");
  }

  return useQuery<TalentBlockoutDatabase[]>({
    queryKey: ["talent-blockouts", talentId],
    queryFn: () => getTalentBlockouts(talentId),
    enabled: enabled && !!talentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateTalentBlockout = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TalentBlockoutDatabase,
    Error,
    { blockoutId: number; updates: Partial<CreateTalentBlockout> }
  >({
    mutationFn: async ({ blockoutId, updates }) => {
      if (!blockoutId) {
        throw new Error("Blockout ID is required");
      }

      const blockout = await getTalentBlockoutsById(blockoutId);

      // Preserve timezone if not explicitly updated
      if (!updates.timezone) {
        updates.timezone = blockout.timezone;
      }

      if (updates.is_all_day || blockout.is_all_day) {
        const start = updates.start_time || blockout.start_time;
        const end = updates.end_time || blockout.end_time;

        const startTime = moment.utc(start).startOf("day").toISOString();
        const endTime = moment.utc(end).endOf("day").toISOString();

        updates.start_time = startTime;
        updates.end_time = endTime;
      }

      return updateTalentBlockout(blockoutId, updates);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["talent-blockouts"] });
      queryClient.invalidateQueries({
        queryKey: ["talent-blockout", variables.blockoutId],
      });
    },
  });
};

export const useDeleteTalentBlockout = () => {
  const queryClient = useQueryClient();

  return useMutation<TalentBlockoutDatabase, Error, number>({
    mutationFn: async (blockoutId) => {
      return deleteTalentBlockout(blockoutId);
    },
    onSuccess: (_data, blockoutId) => {
      queryClient.invalidateQueries({ queryKey: ["user-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["talent-blockouts"] });
      queryClient.invalidateQueries({
        queryKey: ["talent-blockout", blockoutId],
      });
    },
  });
};
