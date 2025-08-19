'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing resume alignment with a job description.
 *
 * This flow takes a resume and a job description, analyzes them, and provides a detailed
 * report on how well the resume is aligned with the job description, along with a score.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the schema for a single score component, including the score and a justification.
const ScoreComponentSchema = z.object({
  score: z.number().min(0).max(10).describe('The score for this component, out of 10.'),
  justification: z.string().describe('A detailed justification for the score, highlighting strengths and areas for improvement.'),
});

// Define the input schema for the resume alignment analysis.
const AnalyzeResumeAlignmentInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The resume file's data URI. Must include a MIME type and be Base64 encoded. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeResumeAlignmentInput = z.infer<typeof AnalyzeResumeAlignmentInputSchema>;

// Define the output schema for the resume alignment analysis.
const AnalyzeResumeAlignmentOutputSchema = z.object({
  alignment: ScoreComponentSchema,
  readability: ScoreComponentSchema,
  structure: ScoreComponentSchema,
  visualPresentation: ScoreComponentSchema,
  overallScore: z.number().min(0).max(10).describe('The weighted average of all component scores.'),
  feedback: z.string().describe('A summary of feedback and actionable suggestions for improvement.'),
});
export type AnalyzeResumeAlignmentOutput = z.infer<typeof AnalyzeResumeAlignmentOutputSchema>;

/**
 * Analyzes the resume's alignment with best practices in formatting and presentation.
 * This is the main function to be called from the application.
 * @param input The resume data URI.
 * @returns A detailed analysis report with scores and feedback.
 */
export async function analyzeResumeAlignment(input: AnalyzeResumeAlignmentInput): Promise<AnalyzeResumeAlignmentOutput> {
  // Execute the Genkit flow to perform the analysis.
  return analyzeResumeAlignmentFlow(input);
}

// Define the AI prompt for the resume alignment analysis.
const analyzeResumeAlignmentPrompt = ai.definePrompt({
  name: 'analyzeResumeAlignmentPrompt',
  input: { schema: AnalyzeResumeAlignmentInputSchema },
  output: { schema: AnalyzeResumeAlignmentOutputSchema },
  config: {
    temperature: 0,
    topP: 0.1,
  },
  prompt: `
    You are an expert resume analyst. Your task is to provide a detailed, objective, and consistent analysis of the provided resume.
    Evaluate the resume based on the following criteria and provide a score from 0 to 10 for each, along with a detailed justification.
    Finally, calculate an overall score and provide a summary of feedback.

    **Analysis Rubric:**

    1.  **Alignment (Weight: 30%)**:
        -   **10**: Perfect, consistent alignment of all text, headings, and lists. Uses a standard grid system.
        -   **5**: Generally consistent, but with minor alignment issues.
        -   **0**: Inconsistent alignment, making the resume difficult to read.

    2.  **Readability (Weight: 30%)**:
        -   **10**: Excellent font choice and size (10-12pt for body, 14-16pt for headings). Ample white space.
        -   **5**: Readable, but could be improved with better font choice or spacing.
        -   **0**: Difficult to read due to poor font choice, small size, or lack of white space.

    3.  **Structure (Weight: 20%)**:
        -   **10**: Clear, logical sections (e.g., Summary, Experience, Education, Skills). Easy to navigate.
        -   **5**: Sections are present but could be better organized.
        -   **0**: Poorly organized, confusing structure.

    4.  **Visual Presentation (Weight: 20%)**:
        -   **10**: Clean, professional, and visually appealing. No distracting elements.
        -   **5**: Acceptable, but could be more polished. Minor design flaws.
        -   **0**: Unprofessional, cluttered, or distracting design.

    **Instructions:**
    1.  For each criterion, provide a score and a detailed justification based strictly on the rubric.
    2.  Calculate the overall score as a weighted average of the component scores.
    3.  Provide a summary of feedback with actionable suggestions for improvement.

    Resume Data: {{media url=resumeDataUri}}
  `,
});

// Define the Genkit flow for the resume alignment analysis.
const analyzeResumeAlignmentFlow = ai.defineFlow(
  {
    name: 'analyzeResumeAlignmentFlow',
    inputSchema: AnalyzeResumeAlignmentInputSchema,
    outputSchema: AnalyzeResumeAlignmentOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeResumeAlignmentPrompt(input);
    return output!;
  }
);
