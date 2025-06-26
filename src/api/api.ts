import { Skill, TalentSkill } from "@/types/skills";
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
  return useQuery<UserProfile>({
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
  return useMutation<UserProfile, Error, Partial<Omit<UserProfile, "id">>>({
    mutationFn: async (newUser) => {
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

  return useQuery<(TalentSkill & { skill: Skill })[]>({
    queryKey: ["talent_skills", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("talent_skills")
        .select("*, skill:skills(*)")
        .eq("user_id", id)
        .order("years_of_experience", { ascending: false });

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

  type CreateTalentSkillInput = Omit<
    TalentSkill,
    "id" | "created_at" | "updated_at" | "user_id" | "skill"
  >;

  return useMutation<TalentSkill, Error, CreateTalentSkillInput>({
    mutationFn: async (newSkill) => {
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

  interface UpdateTalentSkillParams {
    talentSkillId: number;
    updateData: Partial<
      Omit<
        TalentSkill,
        "id" | "created_at" | "updated_at" | "user_id" | "skill"
      >
    >;
  }

  return useMutation<TalentSkill, Error, UpdateTalentSkillParams>({
    mutationFn: async ({ talentSkillId, updateData }) => {
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

export const useGetSkills = () => {
  return useQuery<Skill[]>({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skills").select("*");

      if (error) {
        throw new Error(
          "An error occurred while fetching data: " + error.message
        );
      }

      return data;
    },
  });
};
