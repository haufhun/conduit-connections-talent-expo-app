import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../providers/auth-provider";
import type {
  CreateTalentBlockout,
  TalentExpandedBlockout,
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
    queryFn: () => getUserSchedule(userId, startDate, endDate),
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

  return useMutation<TalentExpandedBlockout, Error, CreateTalentBlockout>({
    mutationFn: async (blockoutData) => {
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
  return useQuery<TalentExpandedBlockout>({
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

  return useQuery<TalentExpandedBlockout[]>({
    queryKey: ["talent-blockouts", talentId],
    queryFn: () => getTalentBlockouts(talentId),
    enabled: enabled && !!talentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateTalentBlockout = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TalentExpandedBlockout,
    Error,
    { blockoutId: number; updates: Partial<CreateTalentBlockout> }
  >({
    mutationFn: async ({ blockoutId, updates }) => {
      return updateTalentBlockout(blockoutId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["talent-blockouts"] });
    },
  });
};

export const useDeleteTalentBlockout = () => {
  const queryClient = useQueryClient();

  return useMutation<TalentExpandedBlockout, Error, number>({
    mutationFn: async (blockoutId) => {
      return deleteTalentBlockout(blockoutId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["talent-blockouts"] });
    },
  });
};
