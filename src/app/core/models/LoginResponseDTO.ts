export interface LoginResponseDTO {
  message: string;
  isAuthenticated: boolean;
  username: string;
  email: string;
  token: string;
  expiresOn: string;
}
