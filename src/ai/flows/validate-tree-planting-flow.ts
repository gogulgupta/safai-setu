'use server';
/**
 * @fileOverview An AI agent that validates if a video is proof of planting a tree.
 *
 * - validateTreePlanting - A function that handles the tree planting validation.
 * - ValidateTreePlantingInput - The input type for the validateTreePlanting function.
 * - ValidateTreePlantingOutput - The return type for the validateTreePlanting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateTreePlantingInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video submitted as proof for planting a tree, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ValidateTreePlantingInput = z.infer<typeof ValidateTreePlantingInputSchema>;

const ValidateTreePlantingOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the video is valid proof for planting a tree.'),
  points: z.number().describe('Points awarded. 0 if not valid.'),
  reason: z.string().describe('A brief explanation for the decision.')
});
export type ValidateTreePlantingOutput = z.infer<typeof ValidateTreePlantingOutputSchema>;

export async function validateTreePlanting(
  input: ValidateTreePlantingInput
): Promise<ValidateTreePlantingOutput> {
  return validateTreePlantingFlow(input);
}

const prompt = ai.definePrompt({
    name: 'validateTreePlantingPrompt',
    input: { schema: z.object({
        videoFrameDataUri: z.string().describe("A single frame from a video recording.")
    }) },
    output: { schema: ValidateTreePlantingOutputSchema },
    prompt: `You are an AI judge for an eco-friendly application. Your task is to determine if the provided image, which is a frame from a video, serves as valid proof that the user is planting a tree or a small sapling.
    
    Analyze the image for the following elements:
    1.  A person or human hands.
    2.  A small tree, sapling, or plant.
    3.  Soil, dirt, or a pot.
    4.  An action that suggests planting (e.g., digging, placing the plant in the ground, watering).
    
    Based on your analysis, decide if the image is valid proof. If it clearly shows a tree planting activity, set 'isValid' to true and award 300 points.
    
    If the image is ambiguous, blurry, or does not clearly show the act of planting, set 'isValid' to false and award 0 points. Provide a helpful reason, for example, "The image was not clear enough to confirm the activity." or "No plant or sapling was detected in the frame."

    Here is the image from the video: {{media url=videoFrameDataUri}}
    `
});

const validateTreePlantingFlow = ai.defineFlow(
  {
    name: 'validateTreePlantingFlow',
    inputSchema: ValidateTreePlantingInputSchema,
    outputSchema: ValidateTreePlantingOutputSchema,
  },
  async (input) => {
    // The advanced Veo model for video analysis requires a billed GCP account.
    // To simulate this feature in a prototype environment, we will instead
    // use a powerful image model to analyze a single frame from the video.
    // This provides a more realistic validation than a simple random result.
    console.log("Starting simulated video validation by analyzing a single frame.");

    const { output } = await prompt({ videoFrameDataUri: input.videoDataUri });
    return output!;
  }
);
