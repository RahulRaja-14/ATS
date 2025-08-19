import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-resume-alignment.ts';
import '@/ai/flows/generate-resume-feedback.ts';
import '@/ai/flows/score-resume-formatting.ts';
import '@/ai/flows/generate-job-description.ts';

    