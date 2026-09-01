import type { Request } from "express";

export type AuthenticatedRequest = Omit<Request, "signedCookies"> & {
  signedCookies?: Record<string, unknown>;
  activityUser: {
    id: string;
    email: string;
    name: string | null;
    picture: string | null;
  };
};
