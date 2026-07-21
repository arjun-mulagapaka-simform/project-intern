export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export interface ApiErrorResponse {
  detail?: string;
  [key: string]: string | string[] | undefined;
}
