import { supabase } from "../lib/supabase";
import { TalentWithSkills } from "../types/user-talent-skills";

/**
 * Get a talent's profile with all their talent skills
 */
export const getTalentWithSkills = async (talentId: string) => {
  const { data, error } = await supabase
    .from("user_talent_skills")
    .select("*")
    .eq("id", talentId)
    .single();

  if (error) throw error;
  return data as TalentWithSkills;
};

/**
 * Gets the top talents that are suggested based on recently added
 */
export const getSuggestedTalents = async () => {
  const { data, error } = await supabase
    .from("user_talent_skills")
    .select("*")
    .limit(10)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as TalentWithSkills[];
};

/**
 * Search for talents by skill name
 */
export const searchTalentsBySkill = async (skillName: string) => {
  // Convert skill name to lowercase and remove spaces for consistent matching
  const normalizedSkillName = skillName.toLowerCase().replace(/\s+/g, "");

  const { data, error } = await supabase
    .from("user_talent_skills")
    .select("*")
    .filter("skill_names", "cs", `{${normalizedSkillName}}`);

  if (error) throw error;

  // Additional client-side filtering for partial matches within skill names
  const filteredData =
    data?.filter((talent) =>
      talent.skill_names?.some((skillName: string) =>
        skillName.includes(normalizedSkillName)
      )
    ) || [];

  return filteredData as TalentWithSkills[];
};

/**
 * Get all talents with a specific skill
 */
export const getTalentsBySkillId = async (skillId: number) => {
  const { data, error } = await supabase
    .from("user_talent_skills")
    .select("*")
    .overlaps("skill_ids", [skillId]);

  if (error) throw error;
  return data as TalentWithSkills[];
};

/**
 * Search talents by name or skill name (database-level filtering)
 */
export const searchTalents = async (searchTerm: string) => {
  // Convert search term to lowercase and remove spaces for skill matching
  const normalizedSearchTerm = searchTerm.toLowerCase().replace(/\s+/g, "");

  // First get talents by name match
  const nameQuery = supabase
    .from("user_talent_skills")
    .select("*")
    .or(`first_name.ilike.*${searchTerm}*,last_name.ilike.*${searchTerm}*`);

  // Then get talents by skill name match using partial matching
  const skillQuery = supabase.from("user_talent_skills").select("*");

  // Execute both queries
  const [nameResults, skillResults] = await Promise.all([
    nameQuery,
    skillQuery,
  ]);

  if (nameResults.error) throw nameResults.error;
  if (skillResults.error) throw skillResults.error;

  // Filter skill results for partial matches
  const skillFilteredData =
    skillResults.data?.filter((talent) =>
      talent.skill_names?.some((skillName: string) =>
        skillName.includes(normalizedSearchTerm)
      )
    ) || [];

  // Combine results and remove duplicates based on talent ID
  const combinedTalents = [...(nameResults.data || []), ...skillFilteredData];
  const uniqueTalents = combinedTalents.filter(
    (talent, index, array) =>
      array.findIndex((t) => t.id === talent.id) === index
  );

  return uniqueTalents as TalentWithSkills[];
};

/**
 * Get talents with skills in a specific price range
 */
export const getTalentsByPriceRange = async (
  minPrice: number,
  maxPrice: number
) => {
  const { data, error } = await supabase
    .from("user_talent_skills")
    .select("*")
    .gte("hourly_rate", minPrice)
    .lte("hourly_rate", maxPrice);

  if (error) throw error;
  return data as TalentWithSkills[];
};

/**
 * Get talents in a specific location with particular skills
 */
export const getTalentsByLocationAndSkill = async (
  state: string,
  skillName: string
) => {
  // Convert skill name to lowercase and remove spaces for consistent matching
  const normalizedSkillName = skillName.toLowerCase().replace(/\s+/g, "");

  const { data, error } = await supabase
    .from("user_talent_skills")
    .select("*")
    .eq("state", state);

  if (error) throw error;

  // Filter for partial skill name matches
  const filteredData =
    data?.filter((talent) =>
      talent.skill_names?.some((skillName: string) =>
        skillName.includes(normalizedSkillName)
      )
    ) || [];

  return filteredData as TalentWithSkills[];
};
