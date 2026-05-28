declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
      isEmailVerified: boolean;
      needToChangePassword: boolean;
      provider: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
