'use server';

/**
 * @fileOverview An AI agent that validates if an image is proof for a complaint about stubble burning.
 *
 * - validateComplaint - A function that handles the complaint validation.
 * - ValidateComplaintInput - The input type for the validateComplaint function.
 * - ValidateComplaintOutput - The return type for the validateComplaint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateComplaintInputSchema = z.object({
  proofImageUri: z
    .string()
    .describe(
      "A photo or video frame submitted as proof for a complaint, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  complaintDescription: z.string().optional().describe('The user\'s description of the incident.'),
});
export type ValidateComplaintInput = z.infer<typeof ValidateComplaintInputSchema>;

const ValidateComplaintOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the image is valid proof for a stubble burning or related environmental complaint.'),
  reason: z.string().describe('A brief explanation for the decision.')
});
export type ValidateComplaintOutput = z.infer<typeof ValidateComplaintOutputSchema>;

export async function validateComplaint(
  input: ValidateComplaintInput
): Promise<ValidateComplaintOutput> {
  return validateComplaintFlow(input);
}

const validateComplaintPrompt = ai.definePrompt({
  name: 'validateComplaintPrompt',
  input: {schema: ValidateComplaintInputSchema},
  output: {schema: ValidateComplaintOutputSchema},
  prompt: `You are an AI environmental compliance officer for the SafaiSetu app. Your task is to determine if an image submitted by a user serves as valid proof for a complaint about stubble burning, crop residue burning, or significant air pollution.

  Analyze the provided image. The image should logically prove an environmental issue is occurring.
  
  Valid proof would be:
  - A clear image of a field on fire or large amounts of smoke rising from a field.
  - A video frame showing the act of burning agricultural waste.
  - Visible smog or heavy air pollution that can be reasonably attributed to burning.
  
  Invalid proof would be:
  - A random selfie, a picture of a house, or an image unrelated to fire, smoke, or fields.
  - A blurry or dark image where nothing can be clearly identified.
  
  User's description (if provided): "{{complaintDescription}}"
  
  Be reasonable. If the image shows clear intent of environmental harm related to burning, approve it.

  Provide a brief reason for your decision. For example, "The image clearly shows a field on fire." or "The submitted image is not relevant to a stubble burning complaint."

  Here is the image submitted as proof: {{media url=proofImageUri}}
  `,
});

const validateComplaintFlow = ai.defineFlow(
  {
    name: 'validateComplaintFlow',
    inputSchema: ValidateComplaintInputSchema,
    outputSchema: ValidateComplaintOutputSchema,
  },
  async input => {
    const {output} = await validateComplaintPrompt(input);
    return output!;
  }
);
