import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TestResult, TestType } from '../../types';
import { Grid3X3 } from 'lucide-react';
import { start } from 'repl';

interface Props {
  onComplete: (result: TestResult) => void;
}

export const PatternTest: React.FC<Props> = ({ onComplete }) => {
  const [level, setLevel] = useState(1);
  const [gridSize, setGridSize] = useState(3);
  const [targetCells, setTargetCells] = useState<number[]>([]);
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'result' | 'gameover'>('memorize');
  const [score, setScore] = useState(0);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Generate pattern based on level
  const startLevel = useCallback((currentLevel: number) => {
    // Difficulty curve
    const size = currentLevel < 3 ? 3 : currentLevel < 6 ? 4 : 5;
    setGridSize(size);
    
    const totalCells = size * size;
    // Cap targets to prevent infinite loop
    const numTargets = Math.min(currentLevel + 2, totalCells - 1); 
    
    const targets = new Set<number>();
    
    // Safety break to prevent infinite loop
    let attempts = 0;
    while(targets.size < numTargets && attempts < 1000) {
      targets.add(Math.floor(Math.random() * totalCells));
      attempts++;
    }
    
    setTargetCells(Array.from(targets));
    setSelectedCells([]);
    setPhase('memorize');
    
    // Show for limited time based on difficulty
    const duration = Math.max(1000, 2000 - (currentLevel * 100));
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPhase('recall');
    }, duration + 1000); // Base 1s + variable
  }, []);

  useEffect(() => {
    startLevel(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startLevel]);

  const finishGame = useCallback(() => {
    setPhase('gameover');
    if (timerRef.current) clearTimeout(timerRef.current);
    
    const result: TestResult = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      type: TestType.PATTERN,
      timestamp: Date.now(),
      score: score,
      accuracy: 100,
      duration: 0,
      difficultyLevel: level,
      meta: { finalLevel: level }
    };
    
    timerRef.current = setTimeout(() => onComplete(result), 2000);
  }, [score, level, onComplete]);

  const checkResult = useCallback((userSelection: number[], currentTargets: number[]) => {
    setPhase('result');
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Check if correct
    const isCorrect = currentTargets.every(t => userSelection.includes(t));
    
    timerRef.current = setTimeout(() => {
      if (isCorrect) {
        setScore(s => s + (level * 100));
        setLevel(l => {
          const next = l + 1;
          startLevel(next);
          return next;
        });
      } else {
        finishGame();
      }
    }, 1000);
  }, [level, startLevel, finishGame]);

  const handleCellClick = (index: number) => {
    if (phase !== 'recall') return;
    
    // Toggle selection
    let newSelected = [...selectedCells];
    if (selectedCells.includes(index)) {
      newSelected = newSelected.filter(i => i !== index);
    } else {
      newSelected.push(index);
    }
    setSelectedCells(newSelected);
      
    // Auto check if matched number of targets
    if (newSelected.length === targetCells.length) {
      checkResult(newSelected, targetCells);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="mb-4 flex justify-between w-full max-w-md text-slate-300 font-mono">
        <span>Level: {level}</span>
        <span>Score: {score}</span>
      </div>

      {phase === 'gameover' ? (
        <div className="text-center animate-fade-in">
          <Grid3X3 className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Game Over</h2>
          <p className="text-slate-400">Final Score: {score}</p>
        </div>
      ) : (
        <div 
          className="grid gap-2 bg-slate-800 p-4 rounded-xl shadow-2xl transition-all"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const isTarget = targetCells.includes(i);
            const isSelected = selectedCells.includes(i);
            const showTarget = phase === 'memorize'  && isTarget;
            
            let bgClass = "bg-slate-700";
            if (showTarget) bgClass = "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]";
            if (phase === 'recall' && isSelected) bgClass = "bg-indigo-400";
            if (phase === 'result') {
               if (isTarget && isSelected) bgClass = "bg-green-500";
               if (!isTarget && isSelected) bgClass = "bg-red-500";
               if (isTarget && !isSelected) bgClass = "bg-yellow-500 animate-pulse";
            }

            return (
              <div
                key={i}
                onClick={() => handleCellClick(i)}
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${bgClass}`}
              />
            );
          })}
        </div>
      )}
      <p className="mt-8 text-slate-500 text-sm h-4">
        {phase === 'memorize' && "Memorize the pattern..."}
        {phase === 'recall' && "Recreate the pattern."}
        {phase === 'result' && "Checking..."}
      </p>
    </div>
  );
};