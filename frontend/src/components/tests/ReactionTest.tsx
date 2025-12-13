import React, { useState, useRef, useEffect } from 'react';
import { TestResult, TestType } from '../../types';
import { Button } from '../ui/Button';
import { Zap } from 'lucide-react';

interface Props {
  onComplete: (result: TestResult) => void;
}

export const ReactionTest: React.FC<Props> = ({ onComplete }) => {
  const [state, setState] = useState<'idle' | 'waiting' | 'ready' | 'finished'>('idle');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [attempts, setAttempts] = useState<number[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MAX_ATTEMPTS = 5;

  const startAttempt = () => {
    setState('waiting');
    const delay = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
    timeoutRef.current = setTimeout(() => {
      setStartTime(Date.now());
      setState('ready');
    }, delay);
  };

  const handleClick = () => {
    if (state === 'waiting') {
      // Too early
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      alert("Too early! Wait for the green screen.");
      setState('idle');
      return;
    }

    if (state === 'ready') {
      const endTime = Date.now();
      const time = endTime - startTime;
      setReactionTime(time);
      const newAttempts = [...attempts, time];
      setAttempts(newAttempts);

      if (newAttempts.length >= MAX_ATTEMPTS) {
        finishTest(newAttempts);
      } else {
        setState('idle'); // Go back to idle to start next attempt
      }
    }
  };

  const finishTest = (finalAttempts: number[]) => {
    setState('finished');
    const avg = finalAttempts.reduce((a, b) => a + b, 0) / finalAttempts.length;
    
    // Construct Result
    const result: TestResult = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      type: TestType.REACTION,
      timestamp: Date.now(),
      score: Math.round(avg),
      accuracy: 100, // Simple reaction time usually doesn't have accuracy unless we count false starts
      duration: 0, // Not applicable
      meta: { attempts: finalAttempts }
    };
    
    setTimeout(() => onComplete(result), 1500);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full min-h-[400px]">
      {state === 'finished' ? (
        <div className="text-center animate-fade-in">
          <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Test Complete</h2>
          <p className="text-slate-400">Average Reaction: {Math.round(attempts.reduce((a,b)=>a+b,0)/attempts.length)}ms</p>
        </div>
      ) : (
        <>
          <div 
            className={`w-full max-w-md h-64 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 shadow-2xl
              ${state === 'idle' ? 'bg-slate-800 hover:bg-slate-700' : ''}
              ${state === 'waiting' ? 'bg-red-600' : ''}
              ${state === 'ready' ? 'bg-green-500 scale-105' : ''}
            `}
            onMouseDown={state === 'idle' ? startAttempt : handleClick}
          >
            {state === 'idle' && <span className="text-xl font-bold text-slate-300">Click to Start Attempt {attempts.length + 1}/{MAX_ATTEMPTS}</span>}
            {state === 'waiting' && <span className="text-3xl font-bold text-white">Wait for Green...</span>}
            {state === 'ready' && <span className="text-4xl font-bold text-white">CLICK!</span>}
          </div>
          <p className="mt-8 text-slate-500 text-sm">
            Instruction: Click the box as soon as it turns green.
          </p>
        </>
      )}
    </div>
  );
};