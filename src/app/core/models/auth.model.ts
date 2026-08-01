/** Matches auth/auth.service.ts -> PublicUser */
export interface User {
  id: number;
  name: string;
  email: string;
}

/** Matches auth/dto/login.dto.ts -> LoginDto */
export interface LoginRequest {
  email: string;
  password: string;
  device_name?: string;
}

export interface LoginResponseData {
  user: User;
  token: string;
}
