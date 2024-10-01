import { LinearClient } from '@linear/sdk';

class LinearIntegration {
  private client: LinearClient;

  constructor(apiKey: string) {
    this.client = new LinearClient({ apiKey });
  }

  async createTask(title: string, description: string): Promise<any> {
    try {
      const issue = await this.client.createIssue({
        title,
        description,
        teamId: 'your_team_id_here', // Replace with your actual team ID
      });
      return issue;
    } catch (error) {
      console.error('Error creating Linear task:', error);
      throw error;
    }
  }
}

export default LinearIntegration;