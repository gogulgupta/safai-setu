'use server';

/**
 * @fileOverview An AI assistant that can answer user questions.
 *
 * - askAiAssistant - A function that handles the user's query.
 * - AiAssistantInput - The input type for the askAiAssistant function.
 * - AiAssistantOutput - The return type for the askAiAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiAssistantInputSchema = z.object({
  query: z.string().describe('The user\'s question or query.'),
});
export type AiAssistantInput = z.infer<typeof AiAssistantInputSchema>;

const AiAssistantOutputSchema = z.object({
  answer: z.string().describe('The AI\'s answer to the user\'s query.'),
});
export type AiAssistantOutput = z.infer<typeof AiAssistantOutputSchema>;

export async function askAiAssistant(
  input: AiAssistantInput
): Promise<AiAssistantOutput> {
  return aiAssistantFlow(input);
}

const aiAssistantPrompt = ai.definePrompt({
  name: 'aiAssistantPrompt',
  input: {schema: AiAssistantInputSchema},
  output: {schema: AiAssistantOutputSchema},
  prompt: `You are a helpful AI assistant for SafaiSetu, an application focused on waste management, recycling, and promoting eco-friendly habits.

Your role is to answer user questions clearly and concisely. The questions might be about:
- How to use the SafaiSetu app.
- Information about recycling different materials (plastic, paper, e-waste).
- Details about government schemes for waste management or agriculture (like subsidies for Happy Seeders).
- General knowledge questions related to sustainability and the environment.
- Any other general query.

Here is the user's question:
"{{query}}"

Provide a helpful and informative answer. If the question is outside your scope, politely say that you cannot answer it.
`,
});

const aiAssistantFlow = ai.defineFlow(
  {
    name: 'aiAssistantFlow',
    inputSchema: AiAssistantInputSchema,
    outputSchema: AiAssistantOutputSchema,
  },
  async input => {
    const {output} = await aiAssistantPrompt(input);
    return output!;
  }
);
