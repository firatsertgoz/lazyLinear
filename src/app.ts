import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import Orchestrator from './orchestrator';
import config from './config';

const app = express();
app.use(express.json({ limit: '10mb' }));

const upload = multer({ dest: 'uploads/' });

const orchestrator = new Orchestrator(config.claudeApiKey, config.linearApiKey);

// Existing endpoint for JSON payload
app.post('/process-transcript', async (req: Request, res: Response) => {
  try {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Invalid transcript data' });
    }

    await orchestrator.process(transcript);
    res.json({ status: 'success', message: 'Transcript processed successfully' });
  } catch (error) {
    console.error('Error processing transcript:', error);
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
});

// Updated endpoint for CSV file upload
app.post('/upload-transcript', upload.single('transcript'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    console.log('File uploaded:', req.file.path);

    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    console.log('File content:', fileContent.substring(0, 200) + '...'); // Log first 200 characters

    let transcript: string;

    try {
      const records = parse(fileContent, {
        columns: true, // Use the first row as headers
        skip_empty_lines: true,
        trim: true // Trim whitespace from fields
      });

      console.log('Parsed records:', records.slice(0, 5)); // Log first 5 records

      // Join all sentences into a single transcript, including speaker information
      transcript = records.map((record: any) => 
        `${record.speaker_name}: ${record.sentence}`
      ).join(' ');

      if (!transcript) {
        throw new Error('No valid sentences found in CSV');
      }

      console.log('Processed transcript:', transcript.substring(0, 200) + '...'); // Log first 200 characters
    } catch (error) {
      console.error('Error parsing CSV:', error);
      return res.status(400).json({ status: 'error', message: 'Invalid CSV file format', details: (error as Error).message });
    }

    if (typeof transcript !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Invalid transcript data in CSV file' });
    }

    await orchestrator.process(transcript);
    res.json({ status: 'success', message: 'Transcript processed successfully' });
  } catch (error) {
    console.error('Error processing transcript:', error);
    res.status(500).json({ status: 'error', message: (error as Error).message });
  } finally {
    // Clean up: delete the uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});