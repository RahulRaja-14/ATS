'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing resume alignment, structure, and visual presentation.
 *
 * - analyzeResumeAlignment - A function that takes resume data and returns an analysis report with a score.
 * - AnalyzeResumeAlignmentInput - The input type for the analyzeResumeAlignment function.
 * - AnalyzeResumeAlignmentOutput - The return type for the analyzeResumeAlignment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeAlignmentInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "Resume file data, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeResumeAlignmentInput = z.infer<typeof AnalyzeResumeAlignmentInputSchema>;

const AnalyzeResumeAlignmentOutputSchema = z.object({
  feedbackReport: z.string().describe('A detailed feedback report on alignment, structure, and visual presentation.'),
  formattingScore: z.number().describe('A score out of 10 evaluating alignment, visual balance, sectioning, and readability.'),
});
export type AnalyzeResumeAlignmentOutput = z.infer<typeof AnalyzeResumeAlignmentOutputSchema>;

export async function analyzeResumeAlignment(input: AnalyzeResumeAlignmentInput): Promise<AnalyzeResumeAlignmentOutput> {
  return analyzeResumeAlignmentFlow(input);
}

const analyzeResumeAlignmentPrompt = ai.definePrompt({
  name: 'analyzeResumeAlignmentPrompt',
  input: {schema: AnalyzeResumeAlignmentInputSchema},
  output: {schema: AnalyzeResumeAlignmentOutputSchema},
  prompt: `You are an expert resume formatting analyst. Analyze the provided resume data for alignment consistency, layout structure, spacing, and visual presentation. Provide a detailed feedback report and a formatting score out of 10.

Resume Data: {{media url=resumeDataUri}}`,
});

const analyzeResumeAlignmentFlow = ai.defineFlow(
  {
    name: 'analyzeResumeAlignmentFlow',
    inputSchema: AnalyzeResumeAlignmentInputSchema,
    outputSchema: AnalyzeResumeAlignmentOutputSchema,
  },
  async input => {
    const {output} = await analyzeResumeAlignmentPrompt(input);
    return output!;
  }
);
