export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    preferences: {
      theme: 'light' | 'dark';
      notifications: boolean;
      language: string;
    };
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
} 