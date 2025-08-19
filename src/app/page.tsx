'use client';

import React, { useEffect, useRef, useState, startTransition } from 'react';
import { useActionState } from 'react';
import { analyzeResumeAction, type AnalysisState } from '@/app/actions';
import { generateJobDescriptionAction } from '@/app/actions/generateJobDescriptionAction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  BarChart,
  AlignLeft,
  Eye,
  Wand2,
  GraduationCap,
  User,
  Briefcase,
} from 'lucide-react';
import type { GenerateResumeFeedbackOutput } from '@/ai/flows/generate-resume-feedback';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const PdfViewer = dynamic(() => import('@/components/PdfViewer'), { ssr: false });

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        'Analyze Resume'
      )}
    </Button>
  );
}

const FeatureIcon = ({
  icon: Icon, text,
}: { icon: React.ElementType; text: string }) => (
  <div className="flex items-center gap-3">
    <div className="bg-primary/10 p-2 rounded-full">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <span className="text-foreground">{text}</span>
  </div>
);

function InitialState() {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed h-full">
      <CardHeader>
        <div className="bg-primary/10 p-4 rounded-full mx-auto">
          <FileText className="w-12 h-12 text-primary" />
        </div>
        <CardTitle className="font-headline mt-4 text-2xl">Your Results Await</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground max-w-sm">
          Upload your resume and job description to receive a detailed analysis.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 text-left">
          <FeatureIcon icon={CheckCircle} text="Detailed feedback report" />
          <FeatureIcon icon={BarChart} text="Formatting score out of 10" />
          <FeatureIcon icon={AlignLeft} text="Alignment suggestions" />
          <FeatureIcon icon={Eye} text="Visual appeal tips" />
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState({ title = "Analyzing...", description = "Our AI is reviewing your resume. This may take a moment." }: { title?: string; description?: string; }) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <div className="space-y-2 pt-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function SectionFeedback({
  label,
  passed,
  message,
}: {
  label: string;
  passed: boolean;
  message: string;
}) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-border/50 last:border-b-0">
      <div className="mt-1">
        {passed ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-foreground">{label}</h4>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// Simple markdown-to-HTML for the report
const formatReport = (report: string) => {
  return report
    .split('\n')
    .map((line: string) => {
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (line.startsWith('* ')) {
        return `<li class="ml-4 list-disc">${line.substring(2)}</li>`;
      }
      return `<p class="mb-2">${line}</p>`;
    })
    .join('');
};

function ResultsDisplay({ result }: { result: GenerateResumeFeedbackOutput | null }) {
  if (!result) return null;

  const {
    matchRate,
    feedback,
    searchabilityScore,
    hardSkillsScore,
    softSkillsScore,
    formattingScore,
  } = result;

  return (
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Resume Review Summary</CardTitle>
          <CardDescription>Here's how your resume scored across key ATS categories.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-muted"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="text-blue-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${matchRate || 0}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{matchRate || 0}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Formatting</h4>
              <Progress value={(formattingScore || 0) * 10} />
              <p className="text-sm text-muted-foreground">{formattingScore}/10</p>
            </div>
            <div>
              <h4 className="font-semibold">Searchability</h4>
              <Progress value={(searchabilityScore || 0) * 10} />
              <p className="text-sm text-muted-foreground">{searchabilityScore}/10</p>
            </div>
            <div>
              <h4 className="font-semibold">Hard Skills</h4>
              <Progress value={(hardSkillsScore || 0) * 10} />
              <p className="text-sm text-muted-foreground">{hardSkillsScore}/10</p>
            </div>
            <div>
              <h4 className="font-semibold">Soft Skills</h4>
              <Progress value={(softSkillsScore || 0) * 10} />
              <p className="text-sm text-muted-foreground">{softSkillsScore}/10</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-lg font-semibold mb-2">ATS Section Feedback</h4>
            {feedback && Array.isArray(feedback) && feedback.length > 0 ? (
              <div className="divide-y divide-border/50">
                {feedback.map((item, index) => (
                  <SectionFeedback
                    key={index}
                    label={item.label}
                    passed={item.passed}
                    message={item.message}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No detailed feedback available.</p>
            )}
          </div>
        </CardContent>
      </Card>
  );
}

function AnalysisSection({
  state,
  activeTab,
  setActiveTab,
  pdfUrl,
}: {
  state: AnalysisState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pdfUrl: string | null;
}) {
  const { pending } = useFormStatus();

  if (pending) {
    return <LoadingState />;
  }
  
  if (!state.data) {
    return <InitialState />;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
      <TabsList className="mb-4">
        {state.data && <TabsTrigger value="analysis">Analysis</TabsTrigger>}
        {state.data?.feedbackReport && <TabsTrigger value="detailed-report">Detailed Report</TabsTrigger>}
        {state.data && <TabsTrigger value="resume">Uploaded Resume</TabsTrigger>}
      </TabsList>

      {state.data && (
        <TabsContent value="analysis">
          <ResultsDisplay result={state.data} />
        </TabsContent>
      )}

      {state.data?.feedbackReport && (
        <TabsContent value="detailed-report">
           <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Detailed Analysis</CardTitle>
              <CardDescription>Our AI's line-by-line feedback on your resume.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formatReport(state.data.feedbackReport) }} />
            </CardContent>
          </Card>
        </TabsContent>
      )}

      {state.data && (
        <TabsContent value="resume" className="h-[700px]">
          <PdfViewer fileUrl={pdfUrl || ''} />
        </TabsContent>
      )}
    </Tabs>
  );
}

// This is a new wrapper for the AnalysisSection to manage the PDF URL lifecycle
function ControlledAnalysisSection({
  state,
  pdfUrl,
  ...props
}: {
  state: AnalysisState;
  pdfUrl: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {

  return (
    <div className="min-h-[700px]">
      <AnalysisSection state={state} pdfUrl={pdfUrl} {...props} />
    </div>
  );
}

type ExperienceLevel = 'entry' | 'mid' | 'senior';

const experienceLevelConfig = {
  entry: {
    title: 'Entry-Level',
    description: 'Students & recent graduates. Less than 2 years of work experience.',
    icon: GraduationCap,
  },
  mid: {
    title: 'Mid-Level',
    description: 'You have between 2 and 10 years of relevant work experience.',
    icon: User,
  },
  senior: {
    title: 'Senior-Level',
    description: 'You have more than 10 years of relevant work experience.',
    icon: Briefcase,
  },
};

export default function HomePage() {
  const initialState: AnalysisState = { data: null, error: null };
  const [state, formAction] = useActionState(analyzeResumeAction, initialState);
  const { toast } = useToast();

  const [jobDescription, setJobDescription] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('analysis');

  const resumeRef = useRef<HTMLInputElement | null>(null);

  const jobDescriptionWordCount = jobDescription.trim().split(/\s+/).filter(Boolean).length;
  const isJobDescriptionValid = jobDescriptionWordCount >= 50;
  
  const handleExperienceChange = (level: ExperienceLevel) => {
    setExperienceLevel(level);
    if (resumeFile && isJobDescriptionValid) {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', jobDescription);
      formData.append('experienceLevel', level);
      startTransition(() => {
        formAction(formData);
      });
    }
  };


  useEffect(() => {
    if (state.error) {
      toast({ variant: 'destructive', title: 'Error', description: state.error });
    } else if (state.data) {
      setActiveTab('analysis');
      if (resumeFile) {
        // Revoke old URL before creating a new one to prevent memory leaks
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(URL.createObjectURL(resumeFile));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.data, state.error]); 

  const handleGenerateDescription = async () => {
    if (!jobRole) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a job role.' });
      return;
    }
    if (!experienceLevel) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select an experience level.' });
        return;
    }
    setIsGenerating(true);
    try {
      const result = await generateJobDescriptionAction({
        jobRole,
        experienceLevel: experienceLevel,
        yearsOfExperience: 5, // Defaulting for generation
      });
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else if (result.data) {
        setJobDescription(result.data.jobDescription);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      toast({ variant: 'destructive', title: 'Error', description: `Failed to generate: ${errorMessage}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resumeFile || !isJobDescriptionValid || !experienceLevel) return;

    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="text-foreground">
      <div className="relative w-full max-w-2xl mx-auto my-8 px-4">
        <div className="absolute top-6 left-0 right-0 h-1 bg-muted rounded-full z-0" />
        <div
          className="absolute top-6 left-0 h-1 bg-blue-500 rounded-full z-10 transition-all duration-500"
          style={{
            width: state.data ? '100%' : isJobDescriptionValid ? '66.6%' : resumeFile ? '33.3%' : '0%',
          }}
        />
        <div className="relative z-20 flex justify-between items-center">
          {['Upload Resume', 'Add Job', 'View Results'].map((label, i) => {
            const step = i + 1;
            const isActive =
              (step === 1 && !!resumeFile) ||
              (step === 2 && isJobDescriptionValid) ||
              (step === 3 && !!state.data);
            return (
              <div key={step} className="flex flex-col items-center text-center w-1/3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md transition-colors duration-300 ${isActive ? 'bg-blue-500' : 'bg-muted-foreground'}`}>
                  {step}
                </div>
                <span className="mt-2 text-sm text-foreground">{label}</span>
              </div>
            );
          })}
        </div>
      </div>


      <main className="flex-1 container mx-auto px-4 pb-12">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 md:grid-cols-2 items-start">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Upload Resume & Job</CardTitle>
                <CardDescription>Upload your resume and job description to get started.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="resume">1. Resume File</Label>
                  <Input
                    id="resume"
                    name="resume"
                    type="file"
                    required
                    ref={resumeRef}
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setResumeFile(file);
                    }}
                    className="bg-secondary"
                  />
                  {resumeFile && <p className="text-sm text-muted-foreground mt-2">Selected: {resumeFile.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label>2. Your Experience Level</Label>
                  <div className="space-y-3">
                    {(Object.keys(experienceLevelConfig) as ExperienceLevel[]).map((level) => {
                      const Icon = experienceLevelConfig[level].icon;
                      return (
                        <div
                          key={level}
                          className={cn(
                            "w-full p-4 rounded-lg border flex justify-between items-center transition-colors",
                            experienceLevel === level
                              ? "bg-primary/10 border-primary"
                              : "bg-card hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <Icon className="w-6 h-6 text-primary" />
                            <div>
                              <h4 className="font-semibold">{experienceLevelConfig[level].title}</h4>
                              <p className="text-sm text-muted-foreground">{experienceLevelConfig[level].description}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant={experienceLevel === level ? "default" : "outline"}
                            onClick={() => handleExperienceChange(level)}
                          >
                            Choose
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                <Label>3. Job Description</Label>
                <Tabs defaultValue="paste">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paste">Paste Description</TabsTrigger>
                    <TabsTrigger value="generate">Generate with AI</TabsTrigger>
                  </TabsList>
                  <TabsContent value="paste" className="pt-4">
                    <JobDescriptionInput
                      value={jobDescription}
                      onChange={(value) => setJobDescription(value)}
                      showWordCount
                    />
                  </TabsContent>
                  <TabsContent value="generate" className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobRole">Job Role</Label>
                      <Input
                        id="jobRole"
                        placeholder="e.g., Senior Software Engineer"
                        value={jobRole}
                        onChange={(e) => setJobRole(e.target.value)}
                      />
                    </div>
                    
                    <Button type="button" onClick={handleGenerateDescription} disabled={isGenerating || !jobRole} className="w-full">
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Generate Description
                        </>
                      )}
                    </Button>
                    {jobDescription && (
                      <div className="space-y-2">
                        <Label>Generated Description</Label>
                        <JobDescriptionInput
                          value={jobDescription}
                          onChange={(value) => setJobDescription(value)}
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                </div>

                <div className="flex gap-4">
                  <SubmitButton disabled={!resumeFile || !isJobDescriptionValid || !experienceLevel} />
                </div>

              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">💡 We'll analyze your resume in context of the job description provided.</p>
              </CardFooter>
            </Card>

            <div className="min-h-[700px]">
              <ControlledAnalysisSection
                state={state}
                pdfUrl={pdfUrl}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
