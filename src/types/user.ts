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
  avatar_url?: string;
}
