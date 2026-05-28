import {Router} from 'express';
import { addClient, deleteClient, getClientById, getClients, updateClient } from '../controllers/client.controller';
import { protect } from '../middlewares/auth.middleware';

const clientRouter = Router();

clientRouter.use(protect);

clientRouter.route('/').post(addClient)
.get(getClients);
clientRouter.route('/:id').get(getClientById)
.patch(updateClient)
.delete(deleteClient);

export default clientRouter;