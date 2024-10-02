import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import pdf from 'pdf-parse';
import Orchestrator from './orchestrator';
import config from './config';

const app = express();
app.use(express.json({ limit: '10mb' }));

const upload = multer({ dest: 'uploads/' });
const orchestrator = new Orchestrator(config.claudeApiKey, config.linearApiKey);

interface TranscriptRequest extends Request {
  transcript?: string;
  integration?: 'claude' | 'ollama';
}

// Helper Functions
const validateIntegration = (integration: string): integration is 'claude' | 'ollama' => {
  return integration === 'claude' || integration === 'ollama';
};

const handleTranscriptProcessing = async (req: TranscriptRequest, res: Response) => {
  const { transcript, integration } = req;

  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({ status: 'error', message: 'Invalid transcript data' });
  }

  if (!integration || !validateIntegration(integration)) {
    return res.status(400).json({ status: 'error', message: 'Invalid integration specified' });
  }

  try {
    await orchestrator.process(transcript, integration);
    res.json({ status: 'success', message: 'Transcript processed successfully' });
  } catch (error) {
    console.error('Error processing transcript:', error);
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};

const parseCSV = (filePath: string): string => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  return records.map((record: any) => `${record.speaker_name}: ${record.sentence}`).join(' ');
};

const parseJSON = (filePath: string): string => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const jsonData = JSON.parse(fileContent);
  if (!jsonData.transcript || typeof jsonData.transcript !== 'string') {
    throw new Error('Invalid JSON format: missing or invalid transcript field');
  }
  return jsonData.transcript;
};

const parsePDF = async (filePath: string): Promise<string> => {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdf(dataBuffer);
  if (!pdfData.text || pdfData.text.trim().length === 0) {
    throw new Error('No text content found in PDF');
  }
  return pdfData.text;
};

// Add this new parsing function for .txt files
const parseTXT = (filePath: string): string => {
  return fs.readFileSync(filePath, 'utf-8');
};

const handleFileUpload = async (req: TranscriptRequest, res: Response, parseFunction: (filePath: string) => string | Promise<string>) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  }

  try {
    req.transcript = await parseFunction(req.file.path);
    req.integration = req.body.integration as 'claude' | 'ollama';
    await handleTranscriptProcessing(req, res);
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(400).json({ status: 'error', message: 'Invalid file format', details: (error as Error).message });
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
};

// Routes
app.post('/process-transcript', (req: TranscriptRequest, res: Response) => handleTranscriptProcessing(req, res));

app.post('/upload-transcript', upload.single('transcript'), (req: TranscriptRequest, res: Response) => {
  req.integration = req.body.integration as 'claude' | 'ollama';
  handleFileUpload(req, res, parseCSV);
});

app.post('/upload-json-transcript', upload.single('transcript'), (req: TranscriptRequest, res: Response) => {
  req.integration = req.body.integration as 'claude' | 'ollama';
  handleFileUpload(req, res, parseJSON);
});

app.post('/upload-pdf-transcript', upload.single('transcript'), (req: TranscriptRequest, res: Response) => {
  req.integration = req.body.integration as 'claude' | 'ollama';
  handleFileUpload(req, res, parsePDF);
});

// Add this new route after the existing routes
app.post('/upload-txt-transcript', upload.single('transcript'), (req: TranscriptRequest, res: Response) => {
  req.integration = req.body.integration as 'claude' | 'ollama';
  handleFileUpload(req, res, parseTXT);
});

// Add this new endpoint after the existing routes
app.post('/process-string', async (req: TranscriptRequest, res: Response) => {
  const { transcript, integration } = req.body;

  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({ status: 'error', message: 'Invalid transcript data' });
  }

  if (!integration || !validateIntegration(integration)) {
    return res.status(400).json({ status: 'error', message: 'Invalid integration specified' });
  }

  try {
    await orchestrator.process(transcript, integration);
    res.json({ status: 'success', message: 'Transcript processed successfully' });
  } catch (error) {
    console.error('Error processing transcript:', error);
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});