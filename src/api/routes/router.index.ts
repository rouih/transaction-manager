
import { Router } from 'express'
import transactionRoutes from "./transaction.route";

const router = Router();


router.use('/transactions', transactionRoutes);

export default router;
