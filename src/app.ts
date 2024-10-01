import express, { Request, Response } from 'express';
import Orchestrator from './orchestrator';
import config from './config';

const app = express();
app.use(express.json());

const orchestrator = new Orchestrator(config.claudeApiKey, config.linearApiKey);

app.post('/process-transcript', async (req: Request, res: Response) => {
  try {
    await orchestrator.process(req.body.rawTranscript);
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error processing transcript:', error);
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});