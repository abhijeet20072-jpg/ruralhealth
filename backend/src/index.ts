import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import authRoutes from './auth.routes';
import facilityRoutes from './facility.routes';
import patientRoutes from './patient.routes';
import appointmentRoutes from './appointment.routes';
import triageRoutes from './triage.routes';
import recordRoutes from './record.routes';
import referralRoutes from './referral.routes';
import teleconsultationRoutes from './teleconsultation.routes';
import { processSync } from './sync.controller';
import { clinicalAuth } from './auth.middleware';

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
app.use('/api/facilities', facilityRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/teleconsultations', teleconsultationRoutes);
app.post('/api/sync', clinicalAuth, processSync);

// Only start the server if this script is executed directly (not required in tests)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`[Backend] Server is running on port ${port}`);
  });
}
