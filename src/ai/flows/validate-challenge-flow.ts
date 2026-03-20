'use server';

/**
 * @fileOverview An AI agent that validates if an image is proof of completing a challenge.
 *
 * - validateChallenge - A function that handles the challenge validation.
 * - ValidateChallengeInput - The input type for the validateChallenge function.
 * - ValidateChallengeOutput - The return type for the validateChallenge function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateChallengeInputSchema = z.object({
  challengeImageUri: z
    .string()
    .describe(
      "A photo submitted as proof for a challenge, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  challengeTitle: z.string().describe('The title of the challenge the user is trying to complete.'),
});
export type ValidateChallengeInput = z.infer<typeof ValidateChallengeInputSchema>;

const ValidateChallengeOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the image is valid proof for the challenge.'),
  reason: z.string().describe('A brief explanation for the decision.')
});
export type ValidateChallengeOutput = z.infer<typeof ValidateChallengeOutputSchema>;

export async function validateChallenge(
  input: ValidateChallengeInput
): Promise<ValidateChallengeOutput> {
  return validateChallengeFlow(input);
}

const validateChallengePrompt = ai.definePrompt({
  name: 'validateChallengePrompt',
  input: {schema: ValidateChallengeInputSchema},
  output: {schema: ValidateChallengeOutputSchema},
  prompt: `You are an AI judge for an eco-friendly application. Your task is to determine if an image submitted by a user serves as valid proof for completing a specific challenge.

  The challenge is: "{{challengeTitle}}"
  
  Analyze the provided image and decide if it logically proves the user completed the challenge. 
  
  For example:
  - If the challenge is "Recycle 15 Plastic Items", the image should clearly show roughly 15 plastic items ready for recycling.
  - If the challenge is "Community Cleanup Event", the image should depict a person or group cleaning up a public area.
  - If the challenge is "Try a No-Plastic Day", an image of a reusable water bottle, cloth bag, or a meal without single-use plastic would be good proof.
  
  Be reasonable but not too strict. If the image is relevant and shows clear intent, approve it. If it's completely irrelevant (e.g., a selfie at home for a cleanup challenge), reject it.

  Provide a brief reason for your decision.

  Here is the image submitted as proof: {{media url=challengeImageUri}}
  `,
});

const validateChallengeFlow = ai.defineFlow(
  {
    name: 'validateChallengeFlow',
    inputSchema: ValidateChallengeInputSchema,
    outputSchema: ValidateChallengeOutputSchema,
  },
  async input => {
    const {output} = await validateChallengePrompt(input);
    return output!;
  }
);
