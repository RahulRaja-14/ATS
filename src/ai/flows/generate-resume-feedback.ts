'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing a resume and providing feedback on its alignment,
 * structure, and consistency.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateResumeFeedbackInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The resume file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jobDescription: z.string().describe('The job description text.'),
  experienceLevel: z.string().describe("The candidate's experience level: 'entry', 'mid', or 'senior'."),
});
export type GenerateResumeFeedbackInput = z.infer<typeof GenerateResumeFeedbackInputSchema>;

const FeedbackItemSchema = z.object({
  label: z.string().describe('The category of the feedback, e.g., "Contact Information", "Summary".'),
  passed: z.boolean().describe('Whether the resume passed the check for this category.'),
  message: z.string().describe('A detailed message explaining the feedback.'),
});

const GenerateResumeFeedbackOutputSchema = z.object({
  feedbackReport: z
    .string()
    .describe('A detailed feedback report on alignment, structure, and consistency issues. This should be a bulleted list formatted in markdown, with each point starting with `* `.'),
  formattingScore: z
    .number()
    .describe('A formatting score out of 10, based on alignment, visual balance, sectioning, and readability.'),
  alignmentScore: z.number().describe('A score out of 10 for resume alignment with the job description.'),
  hardSkillsScore: z.number().describe('A score out of 10 for hard skills match.'),
  softSkillsScore: z.number().describe('A score out of 10 for soft skills match.'),
  searchabilityScore: z.number().describe('A score out of 10 for ATS searchability.'),
  matchRate: z.number().describe('The overall match rate as a percentage (0-100).'),
  feedback: z.array(FeedbackItemSchema).describe('A list of structured feedback items for different sections of the resume.'),
});
export type GenerateResumeFeedbackOutput = z.infer<typeof GenerateResumeFeedbackOutputSchema>;

// Schema for the prompt's output, which now includes fields for the AI to "show its work".
const PromptOutputSchema = GenerateResumeFeedbackOutputSchema.omit({ matchRate: true }).extend({
  jobHardSkills: z.array(z.string()).describe('The top 10 most critical hard skills identified from the job description.'),
  foundResumeSkills: z.array(z.string()).describe('The skills from the jobHardSkills list that were found in the resume.')
});

const weights = {
  entry: {
    alignmentScore: 0.4,
    hardSkillsScore: 0.3,
    softSkillsScore: 0.15,
    searchabilityScore: 0.1,
    formattingScore: 0.05,
  },
  mid: {
    alignmentScore: 0.5,
    hardSkillsScore: 0.25,
    softSkillsScore: 0.1,
    searchabilityScore: 0.1,
    formattingScore: 0.05,
  },
  senior: {
    alignmentScore: 0.6,
    hardSkillsScore: 0.2,
    softSkillsScore: 0.05,
    searchabilityScore: 0.1,
    formattingScore: 0.05,
  },
};

export async function generateResumeFeedback(
  input: GenerateResumeFeedbackInput
): Promise<GenerateResumeFeedbackOutput> {
  const result = await generateResumeFeedbackFlow(input);
  return result;
}

const resumeFeedbackPrompt = ai.definePrompt({
  name: 'resumeFeedbackPrompt',
  input: {schema: GenerateResumeFeedbackInputSchema},
  output: {schema: PromptOutputSchema},
  prompt: `You are an AI resume expert and ATS (Applicant Tracking System) specialist, acting as a senior hiring manager. Analyze the provided resume against the given job description with meticulous, line-by-line detail.

Your primary goal is to provide a comprehensive analysis with scores, a detailed report, and structured feedback.

**Experience Level Context:**

The candidate has self-identified their experience level as: **{{{experienceLevel}}}**.

You MUST adjust your analysis and scoring based on this level.

**Analysis requirements:**

1.  **Detailed Feedback Report (\`feedbackReport\`):**
    *   This is the most important part. Write a concise, bulleted list of the most critical improvements needed, tailored to the candidate's experience level.
    *   Use markdown for the bulleted list, with each point starting with \`* \`.
    *   Focus only on the top 3-5 most impactful changes the user should make.
    *   For each bullet point, a detailed report on alignment, structure, and consistency issues. This should be a bulleted list formatted in markdown, with each point starting with \`* \`.

2.  **Scores (out of 10):**
    *   Apply scoring expectations based on the experience level. For example, a senior candidate should be held to a higher standard for achievements than an entry-level one.
    *   **\`formattingScore\`: Evaluate visual balance, sectioning, readability, font choice, and overall professional design. Your scoring MUST follow this rubric:**
        *   **10:** Perfect formatting. Professional, clean, consistent font, ample whitespace, clear sections, no typos/grammar errors.
        *   **8-9:** Excellent formatting. Minor inconsistencies (e.g., one or two typos, slight alignment issues).
        *   **6-7:** Good formatting. Readable, but has several inconsistencies, some clutter, or a few typos.
        *   **4-5:** Fair formatting. Difficult to read in some sections due to clutter, poor font choice, or multiple errors.
        *   **1-3:** Poor formatting. Very difficult to read, unprofessional, major errors.
    *   **\`alignmentScore\`: Assess how well the resume's content, experience, and skills align with the job description's requirements. Your scoring MUST follow this rubric:**
        *   **10:** Perfect alignment. Every job, project, and skill directly addresses the top requirements of the job description.
        *   **8-9:** Strong alignment. Most experience is highly relevant and tailored.
        *   **6-7:** Good alignment. Core responsibilities match, but some experience is less relevant or not tailored.
        *   **4-5:** Moderate alignment. Some transferable skills, but experience is in a different domain or lacks focus.
        *   **1-3:** Poor alignment. Little to no connection between the resume's content and the job description.
    *   **\`hardSkillsScore\`: To calculate this score, you MUST first complete the \`jobHardSkills\` and \`foundResumeSkills\` fields. Your scoring MUST strictly follow this logic:**
        *   First, in the \`jobHardSkills\` field, list the top 10 most critical hard skills from the job description.
        *   Second, review the resume and in the \`foundResumeSkills\` field, list the skills from your first list that are present.
        *   Finally, calculate the score: **Score = (Number of items in \`foundResumeSkills\` / 10) * 10.** Round to the nearest whole number.
    *   **\`softSkillsScore\`: Measure the match between soft skills (e.g., communication, teamwork) on the resume and those implied or stated in the job description. Your scoring MUST follow this rubric:**
        *   **10:** Clear.
        *   **8-9:** Evidence for most key soft skills.
        *   **6-7:** Evidence for some soft skills, but lacking examples.
        *   **4-5:** Vague claims of a soft skills with no evidence.
        *   **1-3:** Little to no mention of required soft skills.
    *   **\`searchabilityScore\`: Score how easily an ATS can parse key information. Your scoring MUST follow this rubric:**
        *   **10:** Perfect ATS compatibility. Uses standard section headings (e.g., "Work Experience," "Education," "Skills"), standard date formats (Month Year - Month Year), no tables/columns, standard web fonts.
        *   **8-9:** Mostly parsable. Minor issues like non-standard headings (e.g., "My Career") or slightly unusual date formats.
        *   **6-7:** Moderately parsable. May use some tables or columns, which can confuse an ATS.
        *   **4-5:** Difficult to parse. Uses heavy formatting, graphics, or a multi-column layout that will likely fail parsing.
        *   **1-3:** Not parsable. The resume is an image, uses excessive graphics, or has a completely non-standard structure.

3.  **Structured Feedback (\`feedback\` array):**
    *   Provide an array of feedback items for the following categories: 'ATS Compatibility', 'Contact Information', 'Professional Summary', 'Section Headdings', 'Job Title & Company Match', 'Date Formatting', 'Action Verbs'.
    *   For each item in the array, provide:
        *   \`label\`: The name of the category.
        *   \`passed\`: A boolean indicating if the check was passed (true) or failed (false).
        *   \`message\`: A concise, one-sentence explanation, tailored to the experience level.

**Inputs:**

Job Description:
\`\`\`
{{{jobDescription}}}
\`\`\`

Resume:
{{media url=resumeDataUri}}`,
});

const generateResumeFeedbackFlow = ai.defineFlow(
  {
    name: 'generateResumeFeedbackFlow',
    inputSchema: GenerateResumeFeedbackInputSchema,
    outputSchema: GenerateResumeFeedbackOutputSchema,
  },
  async (input: GenerateResumeFeedbackInput): Promise<GenerateResumeFeedbackOutput> => {
    const {output: promptResult} = await resumeFeedbackPrompt(input);

    if (!promptResult) {
      throw new Error('Failed to get a valid response from the AI model.');
    }
    
    const level = input.experienceLevel as keyof typeof weights;
    const levelWeights = weights[level];

    const matchRate =
      (promptResult.alignmentScore * levelWeights.alignmentScore) +
      (promptResult.hardSkillsScore * levelWeights.hardSkillsScore) +
      (promptResult.softSkillsScore * levelWeights.softSkillsScore) +
      (promptResult.searchabilityScore * levelWeights.searchabilityScore) +
      (promptResult.formattingScore * levelWeights.formattingScore);

    // Construct the final output to match the expected schema, excluding the intermediate fields.
    const finalResult: GenerateResumeFeedbackOutput = {
      feedbackReport: promptResult.feedbackReport,
      formattingScore: promptResult.formattingScore,
      alignmentScore: promptResult.alignmentScore,
      softSkillsScore: promptResult.softSkillsScore,
      searchabilityScore: promptResult.searchabilityScore,
      feedback: promptResult.feedback,
      hardSkillsScore: promptResult.hardSkillsScore,
      matchRate: Math.round(matchRate * 10),
    };

    return finalResult;
  }
);
