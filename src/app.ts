import express, {Request,Response} from 'express';
import httpLogger from './config/httpLogger.config';
import {apiLimiter} from "./middlewares/limiter.middleware";
import authRouter from './routers/auth.route';

const app = express();

app.use(httpLogger)
app.use(apiLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true , limit:'50kb'}));

app.get('/', (req:Request, res: Response) => {
  res.json({message: "Welcome to PayLink API"});
});

app.use("/api/v1/auth", authRouter);

export default app;