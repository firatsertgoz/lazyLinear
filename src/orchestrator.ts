import FanthomParser from './services/fanthomParser';
import ClaudeIntegration from './services/claudeIntegration';
import LinearIntegration from './services/linearIntegration';
import OllamaIntegration from './services/ollamaIntegration';

interface Issue {
  title: string;
  description: string;
}

class Orchestrator {
  private parser: FanthomParser;
  private claude: ClaudeIntegration;
  private linear: LinearIntegration;
  private ollama: OllamaIntegration;

  constructor(claudeApiKey: string, linearApiKey: string) {
    this.parser = new FanthomParser();
    this.claude = new ClaudeIntegration(claudeApiKey);
    this.linear = new LinearIntegration(linearApiKey);
    this.ollama = new OllamaIntegration();
  }

  async process(rawTranscript: string, integration: 'claude' | 'ollama'): Promise<void> {
    const parsedTranscript = this.parser.parseTranscript(rawTranscript);
    let structuredIssues: Issue[];

    if (integration === 'claude') {
      structuredIssues = await this.claude.getStructuredIssues(parsedTranscript);
    } else if (integration === 'ollama') {
      structuredIssues = await this.ollama.getStructuredIssues(parsedTranscript);
    } else {
      throw new Error('Invalid integration selected');
    }

    console.log(structuredIssues);

    for (const issue of structuredIssues) {
     // await this.linear.createTask(issue.title, issue.description);
    }
  }
}

export default Orchestrator;