// src/app/actions/analyzeResumeAction.ts
'use server';

import { generateResumeFeedback, GenerateResumeFeedbackOutput } from '@/ai/flows/generate-resume-feedback';

export type AnalysisState = {
  data: GenerateResumeFeedbackOutput | null;
  error: string | null;
};

async function fileToDataURI(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function analyzeResumeAction(
  prevState: AnalysisState,
  formData: FormData
): Promise<AnalysisState> {
  const resumeFile = formData.get('resume') as File;
  const jobDescription = formData.get('jobDescription') as string;
  const experienceLevel = formData.get('experienceLevel') as string;

  if (!resumeFile || !jobDescription || !experienceLevel) {
    return { data: null, error: 'Missing required fields.' };
  }

  try {
    const resumeDataUri = await fileToDataURI(resumeFile);
    
    const result = await generateResumeFeedback({
      resumeDataUri,
      jobDescription,
      experienceLevel,
    });
    
    return { data: result, error: null };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { data: null, error: errorMessage };
  }
}
