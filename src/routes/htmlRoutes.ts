import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router, Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

// Define route to serve index.html
router.get('*', (_req: Request, res: Response) => {
  try {
    // Going up three levels: src/routes -> src -> server -> root, then into client/dist
    const indexPath = path.resolve(__dirname, '../../../client/dist/index.html');
    console.log('Attempting to serve:', indexPath);
    
    // Send the index.html file
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).json({ error: 'Error serving the application' });
      }
    });
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;