'use client';

import { useState } from 'react';
import { useSessionStore } from '@/stores/useSessionStore';
import AISdkService from '@/services/aiSdkService';
import { Loader2 } from 'lucide-react';

interface AnalysisState {
  analysis: string;
  steps: string;
  links: string;
}

export function AnalysisComponent() {
  const { token } = useSessionStore();
  const [taskIdInput, setTaskIdInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<Partial<AnalysisState>>({});
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskId = Number(taskIdInput.trim());
    if (!taskId || isNaN(taskId) || isAnalyzing) return;

    setIsAnalyzing(true);
    setResult({});
    setError(null);

    try {
      const analysisGenerator = AISdkService.analyzeTicket(taskId, 'initial');
      let lastChunk: Partial<AnalysisState> = {};

      for await (const chunk of analysisGenerator) {
        lastChunk = {
          ...lastChunk,
          ...chunk
        };
        setResult(lastChunk);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderSection = (title: string, content?: string) => {
    if (!isAnalyzing && !content) return null;

    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          {title}
          {isAnalyzing && !content && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
        </h3>
        {content && (
          <div 
            className="prose max-w-none" 
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={taskIdInput}
          onChange={(e) => setTaskIdInput(e.target.value)}
          placeholder="Enter Task ID (e.g., 123)"
          className="flex-1 p-2 border rounded"
          disabled={isAnalyzing}
          type="number"
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2"
          disabled={isAnalyzing}
        >
          {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {renderSection('Analysis', result.analysis)}
        {renderSection('Next Steps', result.steps)}
        {renderSection('Related Links', result.links)}
      </div>
    </div>
  );
}
