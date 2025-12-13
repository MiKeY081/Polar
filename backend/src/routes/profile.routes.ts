import { Router } from "express";
import { getProfile, saveResult, saveMetrics, clearData } from "../controller/profile.controller";
import { isAuthorized } from "../middleware/auth.middleware";

const router = Router();

router.get("/", isAuthorized, getProfile);
router.post("/results", isAuthorized, saveResult);
router.post("/metrics", isAuthorized, saveMetrics);
router.delete("/data", isAuthorized, clearData);

export default router;
