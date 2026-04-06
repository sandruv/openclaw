"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { realtimeApiService } from '@/services/realtimeApiService';

export interface LatencyTestProps {}

export function LatencyTest({}: LatencyTestProps) {
  const [latency, setLatency] = useState<number | null>(null);
  const [avgLatency, setAvgLatency] = useState<number | null>(null);
  const [minLatency, setMinLatency] = useState<number>(Infinity);
  const [maxLatency, setMaxLatency] = useState<number | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [readings, setReadings] = useState<number[]>([]);
  
  // Function to perform a single ping test
  const performPing = useCallback(async (): Promise<number> => {
    const startTime = performance.now();
    
    try {
      await realtimeApiService.ping();
      
      const endTime = performance.now();
      return endTime - startTime;
    } catch (error) {
      console.error('Ping error:', error);
      return -1; // Error case
    }
  }, []);
  
  // Function to run a series of ping tests
  const runLatencyTest = useCallback(async () => {
    setIsTesting(true);
    setTestProgress(0);
    
    const testCount = 10;
    const newReadings: number[] = [];
    
    for (let i = 0; i < testCount; i++) {
      const result = await performPing();
      
      if (result > 0) {
        newReadings.push(result);
        setLatency(result);
        setMinLatency((prev: number) => Math.min(result, prev === Infinity ? result : prev));
        setMaxLatency((prev: number | null) => Math.max(result, prev || 0));
        
        // Calculate running average
        const sum = newReadings.reduce((a, b) => a + b, 0);
        setAvgLatency(sum / newReadings.length);
      }
      
      setTestProgress(((i + 1) / testCount) * 100);
      
      // Small delay between pings
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setReadings(newReadings);
    setIsTesting(false);
  }, [performPing]);
  
  // Reset function
  const resetTest = useCallback(() => {
    setLatency(null);
    setAvgLatency(null);
    setMinLatency(Infinity);
    setMaxLatency(null);
    setTestProgress(0);
    setReadings([]);
  }, []);
  
  // Helper function to get color based on latency value
  const getLatencyColor = (value: number | null) => {
    if (value === null) return 'text-neutral-400';
    if (value < 100) return 'text-emerald-400';
    if (value < 200) return 'text-blue-400';
    if (value < 300) return 'text-amber-400';
    return 'text-red-400';
  };

  const getLatencyBg = (value: number | null) => {
    if (value === null) return 'bg-neutral-800/50';
    if (value < 100) return 'bg-emerald-900/20 border-emerald-800/30';
    if (value < 200) return 'bg-blue-900/20 border-blue-800/30';
    if (value < 300) return 'bg-amber-900/20 border-amber-800/30';
    return 'bg-red-900/20 border-red-800/30';
  };
  
  return (
    <div className="space-y-3 bg-neutral-900 border border-neutral-800 rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
          Latency Test
        </h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runLatencyTest} 
            disabled={isTesting}
            className="bg-blue-950/30 border-blue-800/50 text-blue-300 hover:bg-blue-900/30 hover:text-blue-200 transition-all"
          >
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : 'Test Latency'}
          </Button>
          
          {readings.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetTest} 
              disabled={isTesting}
              className="text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
      
      {isTesting && (
        <div className="mt-1">
          <Progress 
            value={testProgress} 
            className="h-1.5 bg-neutral-800" 
          />
          <p className="text-xs text-neutral-400 mt-1 text-right">{Math.round(testProgress)}% complete</p>
        </div>
      )}
      
      {(latency !== null || readings.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <div className={`flex flex-col items-center p-2 rounded-md border ${getLatencyBg(latency)}`}>
            <span className="text-xs text-neutral-400 mb-1">Current</span>
            <span className={`text-lg font-mono font-semibold ${getLatencyColor(latency)}`}>
              {latency !== null ? `${Math.round(latency)}ms` : '-'}
            </span>
          </div>
          <div className={`flex flex-col items-center p-2 rounded-md border ${getLatencyBg(avgLatency)}`}>
            <span className="text-xs text-neutral-400 mb-1">Average</span>
            <span className={`text-lg font-mono font-semibold ${getLatencyColor(avgLatency)}`}>
              {avgLatency !== null ? `${Math.round(avgLatency)}ms` : '-'}
            </span>
          </div>
          <div className={`flex flex-col items-center p-2 rounded-md border ${getLatencyBg(minLatency !== Infinity ? minLatency : null)}`}>
            <span className="text-xs text-neutral-400 mb-1">Min</span>
            <span className={`text-lg font-mono font-semibold ${getLatencyColor(minLatency !== Infinity ? minLatency : null)}`}>
              {minLatency !== Infinity ? `${Math.round(minLatency)}ms` : '-'}
            </span>
          </div>
          <div className={`flex flex-col items-center p-2 rounded-md border ${getLatencyBg(maxLatency)}`}>
            <span className="text-xs text-neutral-400 mb-1">Max</span>
            <span className={`text-lg font-mono font-semibold ${getLatencyColor(maxLatency)}`}>
              {maxLatency !== null ? `${Math.round(maxLatency)}ms` : '-'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
