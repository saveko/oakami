import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'oakami-backend'
  });
});

// Auth Routes (stub)
app.post('/api/auth/login', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

app.post('/api/auth/register', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// Reviews Routes (stub)
app.get('/api/reviews', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

app.post('/api/reviews/sync', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// AI Reply Routes (stub)
app.post('/api/replies/generate', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

app.post('/api/replies/approve', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Oakami Backend running on port ${PORT}`);
});

export default app;
