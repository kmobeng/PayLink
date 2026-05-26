declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        isEmailVerified: boolean;
        needToChangePassword: boolean;
        provider: string;
      };
    }
  }
}

export {};