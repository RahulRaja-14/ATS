'use server';

/**
 * @fileOverview A flow to score resume formatting based on alignment, visual balance, sectioning, and overall readability.
 *
 * - scoreResumeFormatting - A function that handles the resume formatting scoring process.
 * - ScoreResumeFormattingInput - The input type for the scoreResumeFormatting function.
 * - ScoreResumeFormattingOutput - The return type for the scoreResumeFormatting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScoreResumeFormattingInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A resume file (PDF or DOCX) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ScoreResumeFormattingInput = z.infer<typeof ScoreResumeFormattingInputSchema>;

const ScoreResumeFormattingOutputSchema = z.object({
  score: z
    .number()
    .describe(
      'A score out of 10 evaluating alignment, visual balance, sectioning, and overall readability.'
    ),
  feedback: z.string().describe('Detailed feedback on the resume formatting.'),
});
export type ScoreResumeFormattingOutput = z.infer<typeof ScoreResumeFormattingOutputSchema>;

export async function scoreResumeFormatting(
  input: ScoreResumeFormattingInput
): Promise<ScoreResumeFormattingOutput> {
  return scoreResumeFormattingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scoreResumeFormattingPrompt',
  input: {schema: ScoreResumeFormattingInputSchema},
  output: {schema: ScoreResumeFormattingOutputSchema},
  prompt: `You are an expert resume formatter. You will score the resume based on alignment, visual balance, sectioning, and overall readability, giving it a score out of 10. You will also provide detailed feedback on the resume's formatting.

Resume:
{{media url=resumeDataUri}}`,
});

const scoreResumeFormattingFlow = ai.defineFlow(
  {
    name: 'scoreResumeFormattingFlow',
    inputSchema: ScoreResumeFormattingInputSchema,
    outputSchema: ScoreResumeFormattingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
