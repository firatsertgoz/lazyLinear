import axios from 'axios';

class OllamaIntegration {
  private apiUrl: string;

  constructor(apiUrl: string = 'http://localhost:11434') {
    this.apiUrl = apiUrl;
  }

  async getStructuredIssues(transcript: string, model: string = 'llama3.2'): Promise<any> {
    try {
      const response = await axios.post(`${this.apiUrl}/api/generate`, {
        model: model,
        prompt: `Parse this transcript and provide a structured output. The output should have a format
        that relates to a Jira or Linear ticket. The structure should be as follows:
        Title:
        Description:
        (Optional) Steps to Reproduce:
        (Optional) Expected Behavior:
        (Optional) Actual Behavior:
        (Optional) Additional context:
        \n\n${transcript}`,
        stream: false,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data.response;
    } catch (error) {
      console.error('Error calling Ollama API:', error);
      throw error;
    }
  }
}

export default OllamaIntegration;