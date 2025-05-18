import { TalentSkill } from "@/types/skills";
import { UserProfile } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/auth-provider";

export const useGetUserProfile = () => {
  const { session } = useAuth();
  const id = session?.user.id ?? "";
  if (!id) {
    throw new Error("User ID is not available");
  }
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(
          "An error occurred while fetching data: " + error.message
        );
      }

      return data;
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const id = session?.user.id ?? "";
  if (!id) {
    throw new Error("User ID is not available");
  }
  return useMutation({
    mutationFn: async (newUser: Partial<Omit<UserProfile, "id">>) => {
      const { data, error } = await supabase
        .from("users")
        .update(newUser)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        throw new Error(
          "An error occurred while updating the user: " + error.message
        );
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useGetUserTalentSkills = () => {
  const { session } = useAuth();
  const id = session?.user.id ?? "";
  if (!id) {
    throw new Error("User ID is not available");
  }

  return useQuery({
    queryKey: ["talent_skills", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("talent_skills")
        .select("*, skill:skills(*)")
        .eq("user_id", id);

      if (error) {
        throw new Error(
          "An error occurred while fetching data: " + error.message
        );
      }

      return data;
    },
  });
};

export const useCreateTalentSkill = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const id = session?.user?.id ?? "";
  if (!id) {
    throw new Error("User ID is not available");
  }

  return useMutation({
    mutationFn: async (newSkill: any) => {
      const { data, error } = await supabase
        .from("talent_skills")
        .insert({ ...newSkill, user_id: id })
        .select()
        .single();

      if (error) {
        throw new Error(
          "An error occurred while creating the skill: " + error.message
        );
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent_skills"] });
    },
  });
};

export const useUpdateTalentSkill = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  if (!session?.user.id) {
    throw new Error("User ID is not available");
  }

  return useMutation({
    mutationFn: async ({
      talentSkillId,
      updateData,
    }: {
      talentSkillId: number;
      updateData: Partial<Omit<TalentSkill, "id">>;
    }) => {
      const { data, error } = await supabase
        .from("talent_skills")
        .update(updateData)
        .eq("id", talentSkillId)
        .select()
        .single();

      if (error) {
        throw new Error(
          "An error occurred while updating the skill: " + error.message
        );
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent_skills"] });
    },
  });
};
