// ===== JanSathi AI — Async Error Handler Utility =====
// Wraps async Express route handlers to forward rejected Promises to
// the global error handler (app.use((err, req, res, next) => {})).
// Without this, a forgotten try/catch in ANY route handler would let
// an unhandled rejection crash the entire Node.js process.
//
// Usage:
//   router.get("/", asyncHandler(async (req, res) => {
//     const data = await riskyOperation();
//     res.json(data);
//   }));

import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRouteHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void | Response>;

/**
 * Wraps an async route handler and forwards any thrown errors to Express
 * global error middleware via next(err).
 */
export function asyncHandler(fn: AsyncRouteHandler): RequestHandler {
    return function (req: Request, res: Response, next: NextFunction) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
