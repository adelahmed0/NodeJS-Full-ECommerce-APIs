import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import morgan from "morgan";

import categoryRouter from "./routes/category.route.js";

const app: Application = express();
const api = process.env.API_PREFIX || "/api";

app.use(helmet());

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // set `RateLimit` and `RateLimit-Policy` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests, please try again later.",
});

app.use(`${api}`, limiter);

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Language"],
  }),
);

// Routes
app.use(`${api}/categories`, categoryRouter);

// Handle unhandled routes
app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Can't find this route: ${req.originalUrl}`);
  next(err);
});

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({
    status: "error",
    message: err.message,
  });
});

export default app;
