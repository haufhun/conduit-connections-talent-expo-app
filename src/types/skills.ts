export interface Skill {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  image_url: string | null;
}

export interface TalentSkill {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  skill_id: string;
  summary: string | null;
  years_of_experience: number;
  hourly_rate: number | null;
  image_urls: string[];
  skill?: Skill; // Optional joined skill data
}
