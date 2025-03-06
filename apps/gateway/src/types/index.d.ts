export {};
declare module 'express-session' {
    interface SessionData {
        singin: boolean,
        user?: User;
    }
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}