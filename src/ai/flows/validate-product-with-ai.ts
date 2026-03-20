'use server';

/**
 * @fileOverview An AI agent that validates a product by scanning a barcode or identifying it from an image using AI.
 *
 * - validateProductWithAI - A function that validates the product.
 * - ValidateProductWithAIInput - The input type for the validateProductWithAI function.
 * - ValidateProductWithAIOutput - The return type for the validateProductWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateProductWithAIInputSchema = z.object({
  barcode: z.string().optional().describe('The barcode of the product.'),
  productPhotoDataUri: z
    .string()
    .optional()
    .describe(
      'A photo of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type ValidateProductWithAIInput = z.infer<typeof ValidateProductWithAIInputSchema>;

const ValidateProductWithAIOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the product is valid or not.'),
  productName: z.string().optional().describe('The name of the product if identified.'),
  material: z.string().optional().describe('The primary material of the product (e.g., Plastic, Glass, Paper).'),
});
export type ValidateProductWithAIOutput = z.infer<typeof ValidateProductWithAIOutputSchema>;

export async function validateProductWithAI(
  input: ValidateProductWithAIInput
): Promise<ValidateProductWithAIOutput> {
  return validateProductWithAIFlow(input);
}

const productIdentificationPrompt = ai.definePrompt({
  name: 'productIdentificationPrompt',
  input: {schema: ValidateProductWithAIInputSchema},
  output: {schema: ValidateProductWithAIOutputSchema},
  prompt: `You are a product validation expert. Given a product photo, identify the product and validate it against a product catalog. Also identify the primary material of the product.

  {{#if productPhotoDataUri}}
  Here is a photo of the product: {{media url=productPhotoDataUri}}
  {{else}}
  No product photo provided.
  {{/if}}
  {{#if barcode}}
  Here is the barcode of the product: {{barcode}}
  {{else}}
  No barcode provided.
  {{/if}}

  Determine if the product is valid and return the result.
  If you can identify the product, include the product name and material in the output.
  If both barcode and product photo are missing, return isValid: false.
  `,
});

const validateProductWithAIFlow = ai.defineFlow(
  {
    name: 'validateProductWithAIFlow',
    inputSchema: ValidateProductWithAIInputSchema,
    outputSchema: ValidateProductWithAIOutputSchema,
  },
  async input => {
    // If both barcode and photo are missing, return isValid: false immediately.
    if (!input.barcode && !input.productPhotoDataUri) {
      return {isValid: false};
    }
    
    const {output} = await productIdentificationPrompt(input);
    return output!;
  }
);
