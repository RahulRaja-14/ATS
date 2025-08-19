'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

interface PdfViewerProps {
  fileUrl: string;
}

export default function PdfViewer({ fileUrl }: PdfViewerProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset loading state when fileUrl changes
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500); // Give it a moment to load the iframe
    return () => clearTimeout(timer);
  }, [fileUrl]);

  if (!fileUrl) {
    return (
      <div className="border rounded-lg p-4 h-[700px] flex items-center justify-center bg-secondary">
        <p className="text-muted-foreground">No PDF file provided</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg max-h-[700px] h-[700px] overflow-hidden bg-secondary">
      {loading && (
        <div className="p-4">
          <Skeleton className="h-full w-full" />
        </div>
      )}
      <iframe 
        src={fileUrl} 
        width="100%" 
        height="100%"
        onLoad={() => setLoading(false)}
        className={loading ? 'hidden' : 'block'}
      />
    </div>
  );
}
