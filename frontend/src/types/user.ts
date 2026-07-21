export interface User {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string | null;
  bio?: string;
}

export interface PublicUserProfile {
  username: string;
  first_name?: string;
  last_name?: string;
  avatar?: string | null;
  bio?: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar?: File | null;
}
