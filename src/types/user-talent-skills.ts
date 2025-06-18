import type { TalentExpandedBlockout } from "./blockouts";

type TalentSkill = {
  talent_skill_id: number;
  skill_id: number;
  skill_name: string;
  skill_image_url: string | null;
  summary: string;
  years_of_experience: number;
  hourly_rate: number;
  youtube_url: string | null;
  skill_image_urls: string[];
  created_at: string;
  updated_at: string;
};

export type TalentWithSkills = {
  // User fields
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  state: string | null;
  metadata: Record<string, any>;
  avatar_url: string | null;

  // Array of talent skills
  talent_skills: TalentSkill[];
  // Array of talent blockouts
  talent_blockouts: TalentExpandedBlockout[];
  // Array of skill IDs for efficient querying
  skill_ids: number[];
  // Array of skill names for efficient text searching
  skill_names: string[];
};
