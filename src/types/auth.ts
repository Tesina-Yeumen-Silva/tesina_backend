export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export interface RegisterPayload {
  email: string;
  name: string;
  passwordHash: string;
  roleId: number;
  code: string;
}
