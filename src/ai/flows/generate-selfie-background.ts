'use server';
/**
 * @fileOverview A Genkit flow for generating professional AI Eid backgrounds for selfies.
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
      'grand_mosque_night',
      'lantern_festival',
      'golden_crescent',
      'islamic_palace',
      'eid_fireworks',
      'kaaba_night',
      'bangladesh_village'
    ])
    .describe('The desired Eid background theme.'),
});
export type GenerateSelfieBackgroundInput = z.infer<typeof GenerateSelfieBackgroundInputSchema>;

const GenerateSelfieBackgroundOutputSchema = z.object({
  generatedImageUrl: z.string().describe('The data URI of the generated image with the new background.'),
});
export type GenerateSelfieBackgroundOutput = z.infer<typeof GenerateSelfieBackgroundOutputSchema>;

const themePrompts: Record<string, string> = {
  grand_mosque_night: 'a magnificent grand mosque at night with white marble domes, minarets, and glowing blue lights reflecting in water',
  lantern_festival: 'a festive Eid street decorated with hundreds of colorful glowing glass lanterns hanging from above, warm magical atmosphere',
  golden_crescent: 'a cinematic royal background featuring a huge glowing golden crescent moon and shimmering stars in a deep velvet purple sky',
  islamic_palace: 'an elegant palace balcony with intricate white and gold Islamic geometric arches and a lush garden view',
  eid_fireworks: 'a vibrant city skyline at night with massive colorful fireworks exploding in the sky celebrating Eid',
  kaaba_night: 'a peaceful night scene inspired by the architecture of the Masjid al-Haram, soft spiritual lighting and white marble',
  bangladesh_village: 'a traditional rural Bangladesh village scene on Eid morning with green fields, palm trees, and a small local mosque'
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
            text: `You are a world-class professional image compositor. 
            TASK: 
            1. Extract the person from the foreground of this image with pixel-perfect edges.
            2. Replace the background entirely with: ${themeDescription}.
            3. Ensure the lighting, color balance, and shadows on the person perfectly match the new ${themeDescription} environment.
            4. The final result must look like a high-end studio portrait.
            5. Maintain the original quality and facial features of the subject exactly as they are.
            
            STYLING: The background should be sharp, cinematic, and festive. Use a 16:9 cinematic aspect ratio style within the frame.` 
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
