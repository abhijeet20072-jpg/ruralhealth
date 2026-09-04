import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import authRoutes from './auth.routes';

dotenv.config();

export const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    service: 'Rural Healthcare API',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);

// Only start the server if this script is executed directly (not required in tests)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`[Backend] Server is running on port ${port}`);
  });
}
