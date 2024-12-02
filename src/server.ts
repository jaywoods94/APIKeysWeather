import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';

// Configure environment variables
dotenv.config();

// Create Express application
const app: Express = express();
const PORT = process.env.PORT || 3001;

// Get the directory name using fileURLToPath
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the client/dist directory
const clientPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientPath));

// Use API routes
app.use(routes);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Static files being served from:', clientPath);
  console.log('\nPress CTRL+C to stop the server');
});

export default app;