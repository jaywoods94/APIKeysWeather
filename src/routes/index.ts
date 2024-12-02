import { Router } from 'express';
import weatherRoutes from './api/weatherRoutes.js';  

const router = Router();

router.use('/weather', weatherRoutes);

// Optional: Add a test endpoint
router.get('/test', (_req, res) => {
  res.json({ message: 'API routes are working' });
});

export default router;
