'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from './ui/label';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  showWordCount?: boolean;
  readOnly?: boolean;
}

export default function JobDescriptionInput({
  value,
  onChange,
  showWordCount = false,
  readOnly = false,
}: JobDescriptionInputProps) {
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-2">
      <Label htmlFor="jobDescription">
        Job Description
      </Label>
      <Textarea
        id="jobDescription"
        name="jobDescription"
        rows={readOnly ? 10 : 6}
        value={value}
        onChange={(e) => !readOnly && onChange(e.target.value)}
        readOnly={readOnly}
        placeholder="Paste the job description here..."
        className="w-full resize-none bg-secondary"
      />
      {showWordCount && !readOnly && (
        <p className="text-xs text-muted-foreground text-right">{wordCount} / 50+ words</p>
      )}
    </div>
  );
}
