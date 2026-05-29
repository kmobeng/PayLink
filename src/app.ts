import express, { Request, Response } from "express";
import httpLogger from "./config/httpLogger.config";
import { apiLimiter } from "./middlewares/limiter.middleware";
import authRouter from "./routers/auth.route";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import passport from "passport";
import "./config/passport.config";
import clientRouter from "./routers/client.route";
import invoiceRouter from "./routers/invoice.route";

const app = express();

app.use(httpLogger);
app.use(apiLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

app.use(cookieParser());
app.use(
  cookieSession({
    maxAge: 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY!],
  }),
);
app.use(passport.initialize());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to PayLink API" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/invoices", invoiceRouter);

app.use(errorHandler);

export default app;
