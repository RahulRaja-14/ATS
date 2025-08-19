'use server';

import { generateResumeFeedback, type GenerateResumeFeedbackOutput } from '@/ai/flows/generate-resume-feedback';
import { ZodError } from 'zod';

export interface AnalysisState {
  data: GenerateResumeFeedbackOutput | null;
  error: string | null;
}

// Convert file to base64 Data URI
async function fileToDataUri(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${file.type};base64,${base64}`;
}

export async function analyzeResumeAction(
  prevState: AnalysisState,
  formData: FormData
): Promise<AnalysisState> {
  try {
    const file = formData.get('resume') as File | null;
    const jobDescription = formData.get('jobDescription')?.toString() || '';
    const experienceLevel = formData.get('experienceLevel')?.toString() || 'entry';

    if (!file || file.size === 0) {
      throw new Error('Please select a resume file to upload.');
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a PDF or DOCX file.');
    }

    // 5MB size limit
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File is too large. Please upload a file smaller than 5MB.');
    }

    const resumeDataUri = await fileToDataUri(file);

    // Pass both resume and job description
    const result = await generateResumeFeedback({
      resumeDataUri,
      jobDescription,
      experienceLevel,
    });

    return { data: result, error: null };
  } catch (e) {
    console.error(e);

    let errorMessage = 'An unexpected error occurred.';
    if (e instanceof ZodError) {
      errorMessage = e.errors.map((err) => err.message).join(', ');
    } else if (e instanceof Error) {
      errorMessage = e.message;
    }

    return { data: null, error: `Analysis failed: ${errorMessage}` };
  }
}
