import express, {Request,Response} from 'express';
import httpLogger from './config/httpLogger.config';

const app = express();

app.use(httpLogger)
app.use(express.json());
app.use(express.urlencoded({ extended: true , limit:'50kb'}));

app.get('/', (req:Request, res: Response) => {
  res.json({message: "Welcome to PayLink API"});
});

export default app;