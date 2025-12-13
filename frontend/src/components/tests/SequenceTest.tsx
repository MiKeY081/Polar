import React, { useState, useEffect } from 'react';
import type { TestResult } from '@/types';
import { TestType } from '@/types';

interface Props {
  onComplete: (result: TestResult) => void;
}

export const SequenceTest: React.FC<Props> = ({ onComplete }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState("Watch the sequence");

  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'
  ];
  
  const activeColors = [
    'bg-red-300 shadow-[0_0_20px_rgba(239,68,68,0.6)]',
    'bg-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.6)]', 
    'bg-green-300 shadow-[0_0_20px_rgba(34,197,94,0.6)]', 
    'bg-yellow-200 shadow-[0_0_20px_rgba(234,179,8,0.6)]'
  ];

  useEffect(() => {
    startRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRound = () => {
    setIsPlaying(true);
    setMessage(`Round ${round + 1}: Watch`);
    setUserSequence([]);
    
    // Add new step
    const nextStep = Math.floor(Math.random() * 4);
    const newSequence = [...sequence, nextStep];
    setSequence(newSequence);
    
    // Play sequence
    let i = 0;
    const interval = setInterval(() => {
      if (i >= newSequence.length) {
        clearInterval(interval);
        setActiveIndex(null);
        setIsPlaying(false);
        setMessage("Your Turn");
        return;
      }
      
      setActiveIndex(newSequence[i]);
      
      setTimeout(() => {
        setActiveIndex(null);
      }, 500); // Light up duration
      
      i++;
    }, 800); // Speed of sequence
  };

  const handleClick = (index: number) => {
    if (isPlaying) return;

    // Visual feedback for click
    setActiveIndex(index);
    setTimeout(() => setActiveIndex(null), 200);

    const newUserSequence = [...userSequence, index];
    setUserSequence(newUserSequence);

    // Check correctness immediately
    if (sequence[newUserSequence.length - 1] !== index) {
      finishGame();
      return;
    }

    // Check if round complete
    if (newUserSequence.length === sequence.length) {
      setRound(r => r + 1);
      setTimeout(startRound, 1000);
    }
  };

  const finishGame = () => {
    setMessage("Game Over");
    const result: TestResult = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      type: TestType.SEQUENCE,
      timestamp: Date.now(),
      score: round,
      accuracy: 100, // Binary outcome per round
      duration: 0,
      meta: { maxSequence: round }
    };
    setTimeout(() => onComplete(result), 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="mb-8 text-2xl font-bold text-slate-200">{message}</div>
      
      <div className="grid grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            onClick={() => handleClick(i)}
            className={`w-32 h-32 rounded-2xl cursor-pointer transition-all duration-100 border-4 border-slate-900
              ${activeIndex === i ? activeColors[i] : colors[i]}
              ${!isPlaying ? 'hover:brightness-110 active:scale-95' : 'opacity-90'}
            `}
          />
        ))}
      </div>
      <p className="mt-6 text-slate-500">Memorize the order of lights.</p>
    </div>
  );
};