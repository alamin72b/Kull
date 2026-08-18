import type { Request } from "express";

export type AuthenticatedRequest = Omit<Request, "signedCookies"> & {
  signedCookies?: Record<string, unknown>;
  activityUser: {
    id: string;
    username: string;
  };
};
