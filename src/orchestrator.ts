import FanthomParser from './services/fanthomParser';
import ClaudeIntegration from './services/claudeIntegration';
import LinearIntegration from './services/linearIntegration';

interface Issue {
  title: string;
  description: string;
}

class Orchestrator {
  private parser: FanthomParser;
  private claude: ClaudeIntegration;
  private linear: LinearIntegration;

  constructor(claudeApiKey: string, linearApiKey: string) {
    this.parser = new FanthomParser();
    this.claude = new ClaudeIntegration(claudeApiKey);
    this.linear = new LinearIntegration(linearApiKey);
  }

  async process(rawTranscript: string): Promise<void> {
    const parsedTranscript = this.parser.parseTranscript(rawTranscript);
    const structuredIssues = await this.claude.getStructuredIssues(parsedTranscript);
    
    // Assuming structuredIssues is an array of issue objects
    for (const issue of structuredIssues as Issue[]) {
    //   await this.linear.createTask(issue.title, issue.description);
    }
  }
}

export default Orchestrator;