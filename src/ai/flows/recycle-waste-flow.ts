'use server';

/**
 * @fileOverview An AI agent that determines if a waste product is recyclable.
 *
 * - recycleWaste - A function that handles the waste recycling analysis.
 * - RecycleWasteInput - The input type for the recycleWaste function.
 * - RecycleWasteOutput - The return type for the recycleWaste function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecycleWasteInputSchema = z.object({
  wastePhotoDataUri: z
    .string()
    .describe(
      "A photo of the waste product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RecycleWasteInput = z.infer<typeof RecycleWasteInputSchema>;

const RecycleWasteOutputSchema = z.object({
  isRecyclable: z.boolean().describe('Whether the item is recyclable or not.'),
  material: z.string().optional().describe('The primary material of the waste item (e.g., Plastic, Glass, Paper).'),
  points: z.number().describe('The number of green points awarded. 0 if not recyclable.'),
  reason: z.string().describe('A brief explanation for the decision.')
});
export type RecycleWasteOutput = z.infer<typeof RecycleWasteOutputSchema>;

export async function recycleWaste(
  input: RecycleWasteInput
): Promise<RecycleWasteOutput> {
  return recycleWasteFlow(input);
}

const recycleWastePrompt = ai.definePrompt({
  name: 'recycleWastePrompt',
  input: {schema: RecycleWasteInputSchema},
  output: {schema: RecycleWasteOutputSchema},
  prompt: `You are an expert in waste management and recycling. Given a photo of a waste item, determine if it is recyclable.

  You must identify the primary material of the item.
  
  If the item is recyclable, award between 5 and 50 Green Points based on the material and its value for recycling. For example, electronics and metals are worth more than paper.
  
  If the item is not recyclable, award 0 points.
  
  Provide a brief reason for your decision, for example, "This is a recyclable plastic bottle." or "Food waste is not recyclable through this system."

  Here is the photo of the waste item: {{media url=wastePhotoDataUri}}
  `,
});

const recycleWasteFlow = ai.defineFlow(
  {
    name: 'recycleWasteFlow',
    inputSchema: RecycleWasteInputSchema,
    outputSchema: RecycleWasteOutputSchema,
  },
  async input => {
    const {output} = await recycleWastePrompt(input);
    return output!;
  }
);
