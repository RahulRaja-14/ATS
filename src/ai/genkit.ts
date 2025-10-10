import {genkit} from 'genkit';
import {googleAI, gemini} from '@genkit-ai/googleai';

// Use the plugin-provided gemini(...) helper so the plugin can map the
// requested version to a known model reference. The package ships preview
// model refs for the 2.5 Flash family; use the preview id that the plugin
// knows about.
export const ai = genkit({
  plugins: [googleAI()],
  model: gemini('gemini-2.5-flash'),
});