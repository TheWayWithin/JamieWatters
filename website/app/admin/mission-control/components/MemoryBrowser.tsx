'use client';

import { useState, useEffect } from 'react';

interface MemoryFile {
  name: string;
  modified: string;
  pinned?: boolean;
}

interface MemoryFilesResponse {
  files: MemoryFile[];
}

export function MemoryBrowser() {
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMemoryFiles();
  }, []);

  const fetchMemoryFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/memory', {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Memory API error response:', response.status, errorText);
        throw new Error(`Failed to fetch memory files: ${response.status} - ${errorText.slice(0, 100)}`);
      }

      const data: MemoryFilesResponse = await response.json();
      console.log('Memory API response:', data);
      
      if (!data.files) {
        console.error('Memory API returned no files array:', data);
        throw new Error('API returned invalid response (no files array)');
      }
      
      setFiles(data.files);
      setError(null);
      
      // Auto-select MEMORY.md if available, otherwise first file
      const memoryMd = data.files.find(f => f.name === 'MEMORY.md');
      if (memoryMd && !selectedFile) {
        setSelectedFile('MEMORY.md');
        fetchFileContent('MEMORY.md');
      } else if (data.files.length > 0 && !selectedFile) {
        setSelectedFile(data.files[0].name);
        fetchFileContent(data.files[0].name);
      }
    } catch (err) {
      console.error('Error fetching memory files:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch memory files');
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (filename: string) => {
    try {
      setLoadingContent(true);
      const response = await fetch(`/api/admin/memory/${encodeURIComponent(filename)}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch file content: ${response.status}`);
      }

      const data = await response.json();
      setFileContent(data.content || '');
    } catch (err) {
      console.error('Error fetching file content:', err);
      setFileContent('Error loading file content');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleFileSelect = (filename: string) => {
    setSelectedFile(filename);
    fetchFileContent(filename);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch (err) {
      return dateStr;
    }
  };

  const renderContent = (content: string) => {
    // Simple markdown-style rendering for preview
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="text-title-lg font-bold text-text-primary mb-2 mt-4 first:mt-0">
            {line.replace('# ', '')}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-title-md font-semibold text-text-primary mb-2 mt-3 first:mt-0">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-body font-medium text-text-primary mb-1 mt-2 first:mt-0">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      return (
        <p key={index} className="text-body text-text-secondary leading-relaxed">
          {line}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <h3 className="text-title-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          🧠 Memory
        </h3>
        <p className="text-body text-text-secondary">Loading memory files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h3 className="text-title-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          🧠 Memory
        </h3>
        <div className="bg-error/10 border border-error/20 rounded-md p-3">
          <p className="text-error text-body-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96">
      <div className="p-4 border-b border-border-default">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-title-lg font-semibold text-text-primary flex items-center gap-2">
            🧠 Memory
          </h3>
          <button
            onClick={fetchMemoryFiles}
            className="text-brand-primary hover:text-brand-secondary text-body-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* File List */}
        <div className="w-1/3 border-r border-border-default overflow-y-auto">
          <div className="p-2">
            {files.length === 0 ? (
              <div className="p-2">
                <p className="text-body-sm text-text-secondary">No memory files synced.</p>
                <p className="text-body-xs text-text-tertiary mt-1">Run sync script to populate.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {files.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => handleFileSelect(file.name)}
                    className={`w-full text-left p-2 rounded text-body-sm transition-colors ${
                      selectedFile === file.name
                        ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                        : 'hover:bg-bg-primary text-text-primary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium flex items-center gap-1">
                        {file.pinned && '📌'}
                        {file.name}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {formatDate(file.modified)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* File Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {selectedFile ? (
              <>
                <div className="mb-3 pb-2 border-b border-border-subtle">
                  <h4 className="font-medium text-text-primary text-body">
                    {selectedFile}
                  </h4>
                </div>
                {loadingContent ? (
                  <p className="text-body text-text-secondary">Loading content...</p>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    {renderContent(fileContent)}
                  </div>
                )}
              </>
            ) : (
              <p className="text-body text-text-secondary">
                Select a file from the list to view its contents
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}