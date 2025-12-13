import { NextFunction, Request, Response, RequestHandler } from "express";
import { ControllerType } from "../types/controller.types";

export class ErrorHandler extends Error {
    constructor(public message: string, public statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const TryCatch =
    (func: ControllerType): RequestHandler =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(func(req, res, next)).catch(next);
