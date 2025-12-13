import React, { useState, useEffect, useRef } from 'react';
import { TestResult, TestType } from '../../types';
import { Button } from '../ui/Button';

interface Props {
  onComplete: (result: TestResult) => void;
}

const N = 2; // 2-Back
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'H', 'K', 'L', 'M', 'O', 'P', 'T', 'X'];
const TOTAL_TRIALS = 20;
const DURATION = 2000; // ms per letter

export const NBackTest: React.FC<Props> = ({ onComplete }) => {
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [score, setScore] = useState(0); // Correct responses
  const [misses, setMisses] = useState(0);
  const [falsePositives, setFalsePositives] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userResponded, setUserResponded] = useState(false);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Generate sequence upfront to ensure we have enough matches (targets)
  const sequenceRef = useRef<string[]>([]);
  
  useEffect(() => {
    const seq = [];
    for (let i = 0; i < TOTAL_TRIALS; i++) {
      // 30% chance to be a match of i - N
      if (i >= N && Math.random() < 0.3) {
        seq.push(seq[i - N]);
      } else {
        // Random letter, try to avoid accidental match if possible
        let char = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        if (i >= N && char === seq[i - N]) {
           // simple retry once to reduce accidental match probability
           char = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        }
        seq.push(char);
      }
    }
    sequenceRef.current = seq;
    runTrial(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runTrial = (index: number) => {
    if (index >= TOTAL_TRIALS) {
      finishTest();
      return;
    }

    setCurrentIndex(index);
    const letter = sequenceRef.current[index];
    setCurrentLetter(letter);
    setUserResponded(false);
    setShowFeedback(null);
    setHistory(prev => [...prev, letter]);

    setTimeout(() => {
      // End of this letter's display time
      // If it was a target and user didn't click, count as miss
      // We need to check previous state logic here inside the timeout which is tricky with closures
      // relying on a ref or handling it in the next cycle logic usually safer
      runTrial(index + 1);
    }, DURATION);
  };

  // Check miss logic on interval transition - simplifying by doing it inside the match check
  // Actually, we need to know if it *was* a match to score misses at the end or track them live.
  // Tracking live is hard with setTimeout closures. We'll verify the whole run at the end or 
  // just count user clicks (simpler for this demo).

  const handleMatchClick = () => {
    if (userResponded) return; // Only one click per letter allowed
    setUserResponded(true);

    const isMatch = currentIndex >= N && sequenceRef.current[currentIndex] === sequenceRef.current[currentIndex - N];

    if (isMatch) {
      setScore(s => s + 1);
      setShowFeedback('correct');
    } else {
      setFalsePositives(s => s + 1);
      setShowFeedback('wrong');
    }
  };

  const finishTest = () => {
    // Calculate stats
    // A true "Miss" is a target that was not clicked.
    let targetCount = 0;
    for(let i=N; i<sequenceRef.current.length; i++) {
      if(sequenceRef.current[i] === sequenceRef.current[i-N]) targetCount++;
    }
    // Matches hit (score)
    // Matches missed = targetCount - score
    const missed = targetCount - score;
    
    // Accuracy formula: (Correct Hits + Correct Rejections) / Total
    // Simplified: (Hits) / (Hits + False Positives + Misses) ?
    // Standard N-Back metric usually d-prime, but let's do percentage of correct responses to targets.
    
    const accuracy = targetCount > 0 ? (score / targetCount) * 100 : 100;

    const result: TestResult = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      type: TestType.NPBACK,
      timestamp: Date.now(),
      score: score, // Correct hits
      accuracy: Math.round(accuracy),
      duration: TOTAL_TRIALS * DURATION,
      difficultyLevel: N,
      meta: { misses: missed, falsePositives: falsePositives }
    };
    onComplete(result);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="text-slate-500 mb-8 font-mono text-sm">
        2-BACK TEST | Trial {currentIndex + 1}/{TOTAL_TRIALS}
      </div>

      <div className="relative w-48 h-48 flex items-center justify-center bg-slate-800 rounded-2xl border border-slate-700 mb-8">
        <span className="text-8xl font-bold text-white">{currentLetter}</span>
        
        {showFeedback === 'correct' && (
          <div className="absolute inset-0 border-4 border-green-500 rounded-2xl animate-ping" />
        )}
        {showFeedback === 'wrong' && (
          <div className="absolute inset-0 border-4 border-red-500 rounded-2xl animate-ping" />
        )}
      </div>

      <Button 
        size="lg" 
        onClick={handleMatchClick}
        disabled={userResponded || currentIndex < N}
        className="w-48 h-16 text-lg"
      >
        MATCH
      </Button>

      <p className="mt-8 text-slate-500 text-sm max-w-sm text-center">
        Press MATCH if the current letter is the same as the one shown <strong>2 steps ago</strong>.
      </p>
    </div>
  );
};