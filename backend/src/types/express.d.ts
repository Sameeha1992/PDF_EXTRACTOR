import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export { };

THIS_SHOULD_CAUSE_AN_ERROR