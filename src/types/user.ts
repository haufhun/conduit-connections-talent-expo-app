export enum UserType {
  TALENT = "TALENT",
  ORGANIZER = "ORGANIZER",
}

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  state?: string;
  metadata?: {
    bio?: string;
  };
  email: string;
  phone?: string;
  avatar_url?: string;
  user_type: UserType;
}
