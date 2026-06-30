export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserProfileDTO {
  firstName: string;
  lastName: string;
}
