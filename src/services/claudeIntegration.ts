import axios from 'axios';

class ClaudeIntegration {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getStructuredIssues(transcript: string): Promise<any> {
    try {
      const response = await axios.post('https://api.anthropic.com/v1/completions', {
        prompt: `Analyze this transcript and provide structured issues:\n\n${transcript}`,
        model: 'claude-3-5-sonnet-20240620',
        max_tokens_to_sample: 1000,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
      });

      return response.data.completion;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }
}

export default ClaudeIntegration;