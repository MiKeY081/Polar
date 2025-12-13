import { Request, Response } from "express";
import { TryCatch } from "../interfaces/error.interface";
import ProfileServices from "../services/profile.services";

export const getProfile = TryCatch(async (req: Request, res: Response) => {
  const user = req.user!;
  const profile = await ProfileServices.getOrCreateByUser(String((user as any)._id), user.name);
  return res.status(200).json({ success: true, profile });
});

export const saveResult = TryCatch(async (req: Request, res: Response) => {
  const user = req.user!;
  const updated = await ProfileServices.appendResult(String((user as any)._id), req.body);
  return res.status(200).json({ success: true, profile: updated });
});

export const saveMetrics = TryCatch(async (req: Request, res: Response) => {
  const user = req.user!;
  const updated = await ProfileServices.setMetrics(String((user as any)._id), req.body);
  return res.status(200).json({ success: true, profile: updated });
});

export const clearData = TryCatch(async (req: Request, res: Response) => {
  const user = req.user!;
  const updated = await ProfileServices.clearData(String((user as any)._id));
  return res.status(200).json({ success: true, profile: updated });
});
