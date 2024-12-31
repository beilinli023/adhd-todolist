declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: {
        id: string;
        email: string;
        name: string;
        preferences: Record<string, any>;
      };
    }
  }
}

export {}; 