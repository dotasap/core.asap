import express from 'express';
import dotenv from 'dotenv';
import { PORT } from './config/config';
import { startTransactionMonitoring } from './watcher';

dotenv.config();

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
  
  startTransactionMonitoring().catch(console.error);
});
