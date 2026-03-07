import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import routes from "./routes/index.js";

import { ApiError } from "./utils/apiError.js";
import globalError from "./middleware/globalError.middleware.js";

import chalk from "chalk";

import { webhookCheckout } from "./controllers/order.controller.js";

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

// Checkout webhook
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhookCheckout,
);

app.set("query parser", "extended");
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

if (process.env.NODE_ENV === "development") {
  app.use(
    morgan((tokens, req, res) => {
      const status = Number(tokens.status(req, res));
      const method = tokens.method(req, res);
      const url = tokens.url(req, res);
      const responseTime = tokens["response-time"](req, res);

      // 1. Color for HTTP Method
      const methodColors: Record<string, any> = {
        GET: chalk.green.bold,
        POST: chalk.yellow.bold,
        PUT: chalk.cyan.bold,
        DELETE: chalk.red.bold,
        PATCH: chalk.magenta.bold,
      };
      const methodColor = methodColors[method || ""] || chalk.white.bold;

      // 2. Color for Status Code
      let statusColor = chalk.green;
      if (status >= 500) statusColor = chalk.red.bold;
      else if (status >= 400) statusColor = chalk.red;
      else if (status >= 300) statusColor = chalk.yellow;

      return [
        chalk.gray(`[${new Date().toLocaleTimeString()}]`),
        chalk.magenta.bold(`API »`),
        methodColor(method?.padEnd(7)),
        chalk.white(url),
        statusColor(status),
        chalk.gray(`(${responseTime} ms)`),
      ].join(" ");
    }),
  );
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
app.use(`${api}`, routes);

// Handle unhandled routes
app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware
app.use(globalError);

export default app;
