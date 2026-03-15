'use server';
/**
 * @fileOverview A Genkit flow for generating creative Eid captions for posters.
 *
 * - generateEidCaption - A function that handles the caption generation process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEidCaptionInputSchema = z.object({
  tone: z.enum(['heartfelt', 'joyful', 'spiritual', 'cool', 'family']).default('joyful'),
  language: z.enum(['bangla', 'english']).default('english'),
});

const GenerateEidCaptionOutputSchema = z.object({
  caption: z.string().describe('The generated festive Eid caption.'),
});

export async function generateEidCaption(input: z.infer<typeof GenerateEidCaptionInputSchema>) {
  return generateEidCaptionFlow(input);
}

const generateEidCaptionFlow = ai.defineFlow(
  {
    name: 'generateEidCaptionFlow',
    inputSchema: GenerateEidCaptionInputSchema,
    outputSchema: GenerateEidCaptionOutputSchema,
  },
  async input => {
    const {text} = await ai.generate({
      prompt: `Generate a short, catchy, and creative Eid Mubarak caption for a social media poster.
      Tone: ${input.tone}
      Language: ${input.language}
      
      Instructions:
      - Keep it under 10 words.
      - Include 1 or 2 relevant emojis (moon, mosque, stars).
      - If Bangla, use warm local cultural phrasing.
      - If English, make it modern and festive.
      
      Return only the caption text.`,
    });

    return { caption: text };
  }
);
