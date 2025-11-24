'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ProgressFileInfo {
  filename: string;
  date: string;
  projectId: string;
  projectName: string;
  taskCount: number;
  issueCount: number;
  repoPath: string;
}

interface ProgressReportGeneratorProps {
  onGenerate: (preview: any) => void;
}

export function ProgressReportGenerator({ onGenerate }: ProgressReportGeneratorProps) {
  const [files, setFiles] = useState<ProgressFileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProgressFileInfo | null>(null);
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
          setSelectedFile(progressFiles[0]);
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
    if (!selectedFile) {
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
          projectId: selectedFile.projectId,
          repoPath: selectedFile.repoPath,
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

  // Group files by project for better organization
  const filesByProject = files.reduce((acc, file) => {
    if (!acc[file.projectName]) {
      acc[file.projectName] = [];
    }
    acc[file.projectName].push(file);
    return acc;
  }, {} as Record<string, ProgressFileInfo[]>);

  if (fetchingFiles) {
    return (
      <Card>
        <h2 className="text-heading-md font-semibold mb-4">Generate from Progress Report</h2>
        <p className="text-body text-text-secondary">Loading progress files from GitHub...</p>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card>
        <h2 className="text-heading-md font-semibold mb-4">Generate from Progress Report</h2>
        <p className="text-body text-text-secondary mb-4">
          No progress files found in any tracked projects.
        </p>
        <div className="text-body-sm text-text-tertiary space-y-2">
          <p>To use this feature:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Enable &quot;Track Progress&quot; for a project in settings</li>
            <li>Ensure the project has a GitHub URL configured</li>
            <li>Run <code className="bg-bg-secondary px-1.5 py-0.5 rounded">/dailyreport</code> in that project to create progress files</li>
          </ol>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-heading-md font-semibold mb-2">Generate from Progress Report</h2>
      <p className="text-body text-text-secondary mb-6">
        Create posts from curated daily progress files with issues and learnings included.
      </p>

      {/* File Selection */}
      <div className="mb-6">
        <h3 className="text-body-lg font-medium mb-3">Select progress file:</h3>
        <div className="space-y-4">
          {Object.entries(filesByProject).map(([projectName, projectFiles]) => (
            <div key={projectName}>
              <p className="text-body-sm font-medium text-text-secondary mb-2">{projectName}</p>
              <div className="space-y-2">
                {projectFiles.map((file) => (
                  <label
                    key={`${file.projectId}-${file.repoPath}`}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFile?.repoPath === file.repoPath && selectedFile?.projectId === file.projectId
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-border-subtle hover:bg-bg-secondary'
                    }`}
                  >
                    <input
                      type="radio"
                      name="progress-file"
                      checked={selectedFile?.repoPath === file.repoPath && selectedFile?.projectId === file.projectId}
                      onChange={() => setSelectedFile(file)}
                      className="mt-1 w-4 h-4 text-brand-primary border-border-default focus:ring-2 focus:ring-brand-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-body font-medium">{formatDate(file.date)}</p>
                        <span className="text-body-sm text-text-tertiary">({file.filename})</span>
                      </div>
                      <p className="text-body-sm text-text-tertiary">
                        {file.taskCount} task{file.taskCount !== 1 ? 's' : ''}
                        {file.issueCount > 0 && (
                          <span> &bull; {file.issueCount} issue{file.issueCount !== 1 ? 's' : ''} documented</span>
                        )}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
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
              Detailed post with intro, tasks, challenges &amp; learnings
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
        disabled={loading || !selectedFile}
        className="w-full"
      >
        {loading ? 'Generating...' : 'Generate from Progress Report'}
      </Button>

      {/* Selected file preview info */}
      {selectedFile && (
        <p className="text-body-sm text-text-tertiary mt-3 text-center">
          Will generate {format === 'full' ? 'full post' : 'quick summary'} from {selectedFile.projectName}/{selectedFile.filename}
        </p>
      )}
    </Card>
  );
}
