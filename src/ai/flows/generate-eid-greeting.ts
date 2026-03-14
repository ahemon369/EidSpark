'use server';
/**
 * @fileOverview A Genkit flow for generating personalized trilingual Eid Mubarak greetings.
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
    .enum(['heartfelt', 'formal', 'blessing', 'simple', 'family', 'friend'])
    .describe('The desired style or tone of the Eid greeting.'),
  language: z
    .enum(['bangla', 'english', 'arabic'])
    .default('bangla')
    .describe('The language of the generated greeting.'),
});
export type GenerateEidGreetingInput = z.infer<typeof GenerateEidGreetingInputSchema>;

const GenerateEidGreetingOutputSchema = z.object({
  title: z.string().describe('The festive title of the greeting (e.g., Eid Mubarak).'),
  message: z.string().describe('The main body of the personalized Eid message.'),
  recipientLine: z.string().describe('The personalized recipient line (e.g., Dear [Name]).'),
});
export type GenerateEidGreetingOutput = z.infer<typeof GenerateEidGreetingOutputSchema>;

export async function generateEidGreeting(input: GenerateEidGreetingInput):
  Promise<GenerateEidGreetingOutput> {
  return generateEidGreetingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEidGreetingPrompt',
  input: {schema: GenerateEidGreetingInputSchema},
  output: {schema: GenerateEidGreetingInputSchema},
  prompt: `You are an AI assistant specialized in crafting beautiful and personalized Eid Mubarak greetings.

Generate an Eid greeting for the recipient based on the provided style and language.

Recipient: {{{recipientName}}}
Style: {{{greetingStyle}}}
Language: {{{language}}}

Instructions:
1. Generate a festive title (e.g., "Eid Mubarak" or language equivalent).
2. Generate a warm, body message (3-5 short lines).
3. Generate a recipient line (e.g., "Dear [Name]" or language equivalent).
4. If language is 'bangla', ensure correct Bengali script and warm Bangladeshi cultural phrasing.
5. If language is 'arabic', use traditional Arabic Eid greetings.
6. If language is 'english', use modern and inclusive English phrasing.

The greeting should be warm, festive, and reflect the spirit of Eid. Ensure the message is structured as a JSON object with 'title', 'message', and 'recipientLine'.
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
    return output as GenerateEidGreetingOutput;
  }
);
