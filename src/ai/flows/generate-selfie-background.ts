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
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        { media: { url: input.photoDataUri } },
        { 
          text: `Please edit this image. Keep the person in the foreground exactly as they are, but change the entire background to ${themeDescription}. 
          The new background should be high-resolution, professional, and festive. 
          Ensure the lighting on the person blends naturally with the new ${themeDescription} setting. 
          The subject should remain the central focus of the image.` 
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate image background');
    }

    return {
      generatedImageUrl: media.url,
    };
  }
);
