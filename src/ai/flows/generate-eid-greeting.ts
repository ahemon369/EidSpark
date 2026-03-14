'use server';
/**
 * @fileOverview A Genkit flow for generating personalized Eid Mubarak greetings.
 *
 * - generateEidGreeting - A function that handles the Eid greeting generation process.
 * - GenerateEidGreetingInput - The input type for the generateEidGreeting function.
 * - GenerateEidGreetingOutput - The return type for the generateEidGreeting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEidGreetingInputSchema = z.object({
  recipientName: z
    .string()
    .describe('The name of the recipient for whom the greeting is being generated.'),
  greetingStyle: z
    .enum(['formal', 'casual', 'heartfelt', 'humorous'])
    .describe('The desired style or tone of the Eid greeting.'),
});
export type GenerateEidGreetingInput = z.infer<typeof GenerateEidGreetingInputSchema>;

const GenerateEidGreetingOutputSchema = z.object({
  greetingMessage: z.string().describe('The AI-generated personalized Eid Mubarak greeting message.'),
});
export type GenerateEidGreetingOutput = z.infer<typeof GenerateEidGreetingOutputSchema>;

export async function generateEidGreeting(input: GenerateEidGreetingInput):
  Promise<GenerateEidGreetingOutput> {
  return generateEidGreetingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEidGreetingPrompt',
  input: {schema: GenerateEidGreetingInputSchema},
  output: {schema: GenerateEidGreetingOutputSchema},
  prompt: `You are an AI assistant specialized in crafting beautiful and personalized Eid Mubarak greetings.

Generate an Eid Mubarak greeting for the recipient based on the provided style.

Recipient: {{{recipientName}}}
Style: {{{greetingStyle}}}

The greeting should be warm, festive, and reflect the spirit of Eid.
`,
});

const generateEidGreetingFlow = ai.defineFlow(
  {
    name: 'generateEidGreetingFlow',
    inputSchema: GenerateEidGreetingInputSchema,
    outputSchema: GenerateEidGreetingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
