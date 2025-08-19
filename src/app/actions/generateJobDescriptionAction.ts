'use server';

import {
  generateJobDescription,
  type GenerateJobDescriptionInput,
  type GenerateJobDescriptionOutput,
} from '@/ai/flows/generate-job-description';

export interface GenerationState {
  data: GenerateJobDescriptionOutput | null;
  error: string | null;
}

export async function generateJobDescriptionAction(input: GenerateJobDescriptionInput): Promise<GenerationState> {
  if (!input.jobRole) {
    return { data: null, error: 'Please provide a job role.' };
  }

  try {
    const result = await generateJobDescription(input);
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return { data: null, error: `Generation failed: ${errorMessage}` };
  }
}
