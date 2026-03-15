'use server';
/**
 * @fileOverview A Genkit flow for generating AI Eid backgrounds for selfies.
 *
 * - generateSelfieBackground - A function that handles the AI background generation process.
 * - GenerateSelfieBackgroundInput - The input type for the function.
 * - GenerateSelfieBackgroundOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSelfieBackgroundInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  theme: z
    .enum([
      'mosque_courtyard_sunset',
      'night_sky_moon_stars',
      'lantern_eid_street',
      'golden_geometric_patterns',
      'ramadan_night_mosque'
    ])
    .describe('The desired Eid background theme.'),
});
export type GenerateSelfieBackgroundInput = z.infer<typeof GenerateSelfieBackgroundInputSchema>;

const GenerateSelfieBackgroundOutputSchema = z.object({
  generatedImageUrl: z.string().describe('The data URI of the generated image with the new background.'),
});
export type GenerateSelfieBackgroundOutput = z.infer<typeof GenerateSelfieBackgroundOutputSchema>;

const themePrompts: Record<string, string> = {
  mosque_courtyard_sunset: 'a beautiful mosque courtyard at sunset with warm orange and purple hues in the sky',
  night_sky_moon_stars: 'a cinematic clear night sky with a bright glowing crescent moon and twinkling stars',
  lantern_eid_street: 'a festive Eid street decorated with many colorful glowing lanterns and fairy lights',
  golden_geometric_patterns: 'an elegant background of complex golden Islamic geometric patterns and soft ambient lighting',
  ramadan_night_mosque: 'a peaceful night scene of a traditional mosque illuminated by moonlight and lanterns'
};

export async function generateSelfieBackground(input: GenerateSelfieBackgroundInput): Promise<GenerateSelfieBackgroundOutput> {
  return generateSelfieBackgroundFlow(input);
}

const generateSelfieBackgroundFlow = ai.defineFlow(
  {
    name: 'generateSelfieBackgroundFlow',
    inputSchema: GenerateSelfieBackgroundInputSchema,
    outputSchema: GenerateSelfieBackgroundOutputSchema,
  },
  async input => {
    const themeDescription = themePrompts[input.theme];
    
    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image',
        prompt: [
          { media: { url: input.photoDataUri } },
          { 
            text: `You are a professional image editor. 
            Step 1: Detect the main person in the foreground of this image.
            Step 2: Carefully remove everything in the background while keeping the person exactly as they are.
            Step 3: Generate and place a high-resolution, festive background of ${themeDescription} behind the person.
            Ensure the lighting on the person blends naturally with the new ${themeDescription} setting. 
            The subject should remain the central focus. Do not modify the subject's face or body.` 
          },
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
          safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          ]
        },
      });

      if (!media || !media.url) {
        throw new Error('AI failed to return an image. It might have been blocked by safety filters.');
      }

      return {
        generatedImageUrl: media.url,
      };
    } catch (error: any) {
      console.error("Selfie Background Flow Error:", error);
      throw new Error(error.message || 'Background generation failed. Please try again.');
    }
  }
);
