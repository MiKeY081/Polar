import express from "express";
import { CropController } from "../controller/crop.controller";

const router = express.Router();
const cropController = new CropController();

// Route to get crop by ID
router.get("/:id", async (req, res, next) => {
    try {
        await cropController.getCropsById(req, res, next);
    } catch (error) {
        next(error);
    }
});

// Route to get crops by month
router.get("/get", async (req, res, next) => {
    try {
        await cropController.getCropsByMonth(req, res, next);
    } catch (error) {
        next(error);
    }
});

// Route to get alternative crops
router.get("/alternative", async (req, res, next) => {
    try {
        await cropController.getAlternativeCrops(req, res, next);
    } catch (error) {
        next(error);
    }
});

// Route to get customer trends for crops by month
router.get("/customer-trend", async (req, res, next) => {
    try {
        await cropController.getCustomerPreferenceForMonth(req, res, next);
    } catch (error) {
        next(error);
    }
});

// New route for crop prediction
router.post("/predict", async (req, res, next) => {
    try {
        await cropController.predictCropYield(req, res, next);
    } catch (error) {
        next(error);
    }
});

export default router;
