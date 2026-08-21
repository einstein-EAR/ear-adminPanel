export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: AuthUser;
  token: string;
};

export type UpdateCredentialsInput = {
  name: string;
  email: string;
  password: string;
  currentPassword: string;
};

export type UpdateCredentialsResponse = {
  message: string;
  user: AuthUser;
  token: string;
};
