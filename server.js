import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint for Cloud Run and monitoring
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Single Page Application fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// If executed directly
if (process.env.NODE_ENV === 'production' || !process.env.DISABLE_SERVER_LISTEN) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Production server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
