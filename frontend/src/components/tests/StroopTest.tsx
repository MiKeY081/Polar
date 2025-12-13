import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { TestType, type TestResult } from '@/types';

interface Props {
  onComplete: (result: TestResult) => void;
}

const COLORS = [
  { name: 'RED', value: '#ef4444' }, // red-500
  { name: 'BLUE', value: '#3b82f6' }, // blue-500
  { name: 'GREEN', value: '#22c55e' }, // green-500
  { name: 'YELLOW', value: '#eab308' }, // yellow-500
];

export const StroopTest: React.FC<Props> = ({ onComplete }) => {
  const [trials, setTrials] = useState(0);
  const [currentTrial, setCurrentTrial] = useState<any>(null);
  const [startTime, setStartTime] = useState(0);
  const [results, setResults] = useState<{time: number, correct: boolean}[]>([]);
  const MAX_TRIALS = 10;

  const nextTrial = () => {
    if (trials >= MAX_TRIALS) {
      finishTest();
      return;
    }

    const textIndex = Math.floor(Math.random() * COLORS.length);
    // 50% chance of congruent (text matches color), 50% incongruent
    const isIncongruent = Math.random() > 0.5;
    let colorIndex = textIndex;
    
    if (isIncongruent) {
      // Pick a different color
      do {
        colorIndex = Math.floor(Math.random() * COLORS.length);
      } while (colorIndex === textIndex);
    }

    setCurrentTrial({
      text: COLORS[textIndex].name,
      color: COLORS[colorIndex].value,
      correctAnswer: COLORS[colorIndex].name // The user must identify the INK COLOR
    });
    setStartTime(Date.now());
    setTrials(t => t + 1);
  };

  useEffect(() => {
    nextTrial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (colorName: string) => {
    if (!currentTrial) return;
    const timeTaken = Date.now() - startTime;
    const isCorrect = colorName === currentTrial.correctAnswer;
    
    const newResults = [...results, { time: timeTaken, correct: isCorrect }];
    setResults(newResults);
    
    // Small delay between trials? No, rapid fire is better for stroop flow
    nextTrial();
  };

  const finishTest = () => {
    const correctCount = results.filter(r => r.correct).length;
    const avgTime = results.reduce((a, b) => a + b.time, 0) / results.length;
    const accuracy = (correctCount / MAX_TRIALS) * 100;

    const result: TestResult = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      type: TestType.STROOP,
      timestamp: Date.now(),
      score: Math.round(avgTime), // Lower is better
      accuracy: accuracy,
      duration: results.reduce((a, b) => a + b.time, 0),
      meta: { correct: correctCount, total: MAX_TRIALS }
    };
    onComplete(result);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="text-slate-400 mb-8 font-mono">
        Trial {trials} / {MAX_TRIALS}
      </div>

      {currentTrial && (
        <div className="mb-12">
          <h1 
            className="text-6xl font-black tracking-wider transition-colors duration-100"
            style={{ color: currentTrial.color }}
          >
            {currentTrial.text}
          </h1>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {COLORS.map((c) => (
          <button
            key={c.name}
            onClick={() => handleAnswer(c.name)}
            className="h-16 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-500 transition-all font-bold text-slate-200"
          >
            {c.name}
          </button>
        ))}
      </div>
      
      <p className="mt-8 text-slate-500 text-sm">
        Click the button that matches the <span className="text-white font-bold">INK COLOR</span> of the word.
      </p>
    </div>
  );
};