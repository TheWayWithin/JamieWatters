'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ProgressFileInfo {
  filename: string;
  date: string;
  projectName: string;
  taskCount: number;
  issueCount: number;
  relativePath: string;
}

interface ProgressReportGeneratorProps {
  onGenerate: (preview: any) => void;
}

export function ProgressReportGenerator({ onGenerate }: ProgressReportGeneratorProps) {
  const [files, setFiles] = useState<ProgressFileInfo[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [format, setFormat] = useState<'full' | 'summary'>('full');
  const [loading, setLoading] = useState(false);
  const [fetchingFiles, setFetchingFiles] = useState(true);
  const [error, setError] = useState('');

  // Fetch progress files on mount
  useEffect(() => {
    fetchProgressFiles();
  }, []);

  const fetchProgressFiles = async () => {
    try {
      setFetchingFiles(true);
      const res = await fetch('/api/admin/content/list-progress-files', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        const progressFiles = data.files || [];
        setFiles(progressFiles);

        // Auto-select the most recent file if available
        if (progressFiles.length > 0) {
          setSelectedFilePath(progressFiles[0].relativePath);
        }
      } else {
        setError('Failed to fetch progress files');
      }
    } catch (err) {
      setError('Failed to fetch progress files');
      console.error('Fetch progress files error:', err);
    } finally {
      setFetchingFiles(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFilePath) {
      setError('Please select a progress file');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/admin/content/generate-from-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          filePath: selectedFilePath,
          format,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onGenerate(data.preview);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to generate content');
      }
    } catch (err) {
      setError('Failed to generate content');
      console.error('Generate from progress error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString + 'T12:00:00');
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (fetchingFiles) {
    return (
      <Card>
        <h2 className="text-heading-md font-semibold mb-4">📝 Generate from Progress Report</h2>
        <p className="text-body text-text-secondary">Loading progress files...</p>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card>
        <h2 className="text-heading-md font-semibold mb-4">📝 Generate from Progress Report</h2>
        <p className="text-body text-text-secondary mb-4">
          No progress files found.
        </p>
        <p className="text-body-sm text-text-tertiary">
          Create a <code className="bg-bg-secondary px-1.5 py-0.5 rounded">progress/</code> directory
          in your project and add daily progress files (e.g., <code className="bg-bg-secondary px-1.5 py-0.5 rounded">2025-11-21.md</code>).
        </p>
      </Card>
    );
  }

  const selectedFile = files.find(f => f.relativePath === selectedFilePath);

  return (
    <Card>
      <h2 className="text-heading-md font-semibold mb-2">📝 Generate from Progress Report</h2>
      <p className="text-body text-text-secondary mb-6">
        Create posts from curated daily progress files with issues and learnings included.
      </p>

      {/* File Selection */}
      <div className="mb-6">
        <h3 className="text-body-lg font-medium mb-3">Select progress file:</h3>
        <div className="space-y-2">
          {files.map((file) => (
            <label
              key={file.relativePath}
              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedFilePath === file.relativePath
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-border-subtle hover:bg-bg-secondary'
              }`}
            >
              <input
                type="radio"
                name="progress-file"
                checked={selectedFilePath === file.relativePath}
                onChange={() => setSelectedFilePath(file.relativePath)}
                className="mt-1 w-4 h-4 text-brand-primary border-border-default focus:ring-2 focus:ring-brand-primary"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-body font-medium">{formatDate(file.date)}</p>
                  <span className="text-text-tertiary">•</span>
                  <p className="text-body text-text-secondary">{file.projectName}</p>
                </div>
                <p className="text-body-sm text-text-tertiary">
                  {file.taskCount} task{file.taskCount !== 1 ? 's' : ''}
                  {file.issueCount > 0 && (
                    <span> • {file.issueCount} issue{file.issueCount !== 1 ? 's' : ''} documented</span>
                  )}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <h3 className="text-body-lg font-medium mb-3">Output format:</h3>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFormat('full')}
            className={`flex-1 p-3 border rounded-lg text-left transition-colors ${
              format === 'full'
                ? 'border-brand-primary bg-brand-primary/5'
                : 'border-border-subtle hover:bg-bg-secondary'
            }`}
          >
            <p className="text-body font-medium">Full Post</p>
            <p className="text-body-sm text-text-tertiary">
              Detailed post with intro, tasks, challenges & learnings
            </p>
          </button>
          <button
            type="button"
            onClick={() => setFormat('summary')}
            className={`flex-1 p-3 border rounded-lg text-left transition-colors ${
              format === 'summary'
                ? 'border-brand-primary bg-brand-primary/5'
                : 'border-border-subtle hover:bg-bg-secondary'
            }`}
          >
            <p className="text-body font-medium">Quick Summary</p>
            <p className="text-body-sm text-text-tertiary">
              Concise update highlighting key accomplishments
            </p>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-body-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Generate Button */}
      <Button
        variant="primary"
        onClick={handleGenerate}
        disabled={loading || !selectedFilePath}
        className="w-full"
      >
        {loading ? 'Generating...' : 'Generate from Progress Report →'}
      </Button>

      {/* Selected file preview info */}
      {selectedFile && (
        <p className="text-body-sm text-text-tertiary mt-3 text-center">
          Will generate {format === 'full' ? 'full post' : 'quick summary'} from {selectedFile.filename}
        </p>
      )}
    </Card>
  );
}
