# Transcript Processor

This project is a Node.js application that processes transcripts, analyzes them using Claude AI, and creates tasks in Linear based on the analysis.

## Features

- Upload transcripts via CSV file
- Process transcripts using Claude AI for analysis
- Create tasks in Linear based on the analysis results

## Prerequisites

- Node.js (v14 or later recommended)
- npm (comes with Node.js)
- Claude AI API key
- Linear API key

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/transcript-processor.git
   cd transcript-processor
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your API keys:
   ```
   CLAUDE_API_KEY=your_claude_api_key_here
   LINEAR_API_KEY=your_linear_api_key_here
   ```

4. Build the TypeScript files:
   ```
   npm run build
   ```

## Usage

1. Start the server:
   ```
   npm start
   ```

2. The server will start running on `http://localhost:3000` (or the port specified in your environment).

3. To process a transcript, send a POST request to `/upload-transcript` with a CSV file:
   ```
   curl -X POST http://localhost:3000/upload-transcript \
        -H "Content-Type: multipart/form-data" \
        -F "transcript=@path/to/your/transcript.csv"
   ```

   The CSV file should have two columns: an index and the sentence content.

## API Endpoints

- `POST /process-transcript`: Process a transcript sent as JSON in the request body
- `POST /upload-transcript`: Upload and process a CSV file containing the transcript

## Project Structure

- `src/app.ts`: Main application file with Express server setup
- `src/config.ts`: Configuration file for API keys
- `src/orchestrator.ts`: Orchestrates the processing flow
- `src/services/`:
  - `fanthomParser.ts`: Parses the transcript
  - `claudeIntegration.ts`: Integrates with Claude AI
  - `linearIntegration.ts`: Integrates with Linear

## Development

To run the project in development mode with hot reloading:

```
npm run dev
```

##