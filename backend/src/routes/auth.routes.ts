import { Router } from "express";
import { AuthController } from "../controller/auth.controller";

const router = Router();
const authController = new AuthController();

// Wrap async functions in a try-catch
router.post("/register", async (req, res, next) => {
    try {
        await authController.userRegister(req, res, next);
    } catch (error) {
        next(error); // Pass errors to the error handler
    }
});

router.post("/login", async (req, res, next) => {
    try {
        await authController.userLogin(req, res, next);
    } catch (error) {
        next(error);
    }
});

router.post("/logout", async (req, res, next) => {
    try {
        await authController.userLogout(req, res, next);
    } catch (error) {
        next(error);
    }
});

export default router;
