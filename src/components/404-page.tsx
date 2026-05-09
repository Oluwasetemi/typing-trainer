'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { TypingProvider } from '../context/typing-context';
import { useTyping } from '../hooks/use-typing';
import { Icons } from '../utils/icons';
import { Button } from './button';
import TextDisplay from './text-display/text-display';
import TypingInput from './typing-input/typing-input';

const CUSTOM_404_TEXT = `Oops! This page took a wrong turn and got lost in cyberspace. But hey, since you're here, why not practice your typing skills? Complete this challenge to unlock your way back home!`;

function Stats404({ currentTime }: { currentTime: number }) {
  const { state } = useTyping();
  const { typedText, startTime, endTime, errors, sourceText } = state;

  // Calculate WPM
  const timeElapsed = endTime
    ? (endTime - (startTime || 0)) / 1000 / 60
    : startTime
      ? (currentTime - startTime) / 1000 / 60
      : 0;

  const wordsTyped = typedText.trim().split(/\s+/).length;
  const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;

  // Calculate accuracy
  const totalWords = sourceText.trim().split(/\s+/).length;
  const errorCount = errors.size;
  const accuracy = totalWords > 0 ? Math.round(((totalWords - errorCount) / totalWords) * 100) : 100;

  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="bg-blue-50 rounded-lg p-4 text-center border-2 border-blue-200">
        <div className="text-3xl font-bold text-blue-600">{wpm}</div>
        <div className="text-sm text-gray-600">WPM</div>
      </div>
      <div className="bg-green-50 rounded-lg p-4 text-center border-2 border-green-200">
        <div className="text-3xl font-bold text-green-600">
          {accuracy}
          %
        </div>
        <div className="text-sm text-gray-600">Accuracy</div>
      </div>
    </div>
  );
}

function NotFound404Content() {
  const { state } = useTyping();
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!state.startTime || state.finished) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);

    return () => clearInterval(interval);
  }, [state.startTime, state.finished]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
    >
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">
        {/* 404 Header */}
        <header className="text-center mb-8">
          <motion.h1
            animate={{
              rotate: [0, -2, 2, -2, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 2,
            }}
            className="text-6xl sm:text-8xl font-bold text-gray-800 mb-2"
          >
            404
          </motion.h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-2">
            Oops! This page got lost...
          </p>
          <p className="text-base sm:text-lg text-gray-500">
            But you can practice your typing while you're here!
          </p>
        </header>

        {/* Typing Game */}
        <div className="space-y-6">
          <TextDisplay />
          <TypingInput />

          {/* Stats */}
          {state.startTime && <Stats404 currentTime={currentTime} />}

          {/* Navigation Buttons */}
          <div className="flex flex-col gap-4 items-center pt-6 border-t border-gray-200">
            {/* Primary Action - Go Home */}
            <Button color="blue" href="/">
              <Icons.Rocket data-slot="icon" />
              Go Back Home
            </Button>

            {/* Secondary Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button color="zinc" href="/solo">
                <Icons.Target data-slot="icon" />
                Try Solo Practice
              </Button>
              <Button color="zinc" href="/competition">
                <Icons.Trophy data-slot="icon" />
                Join Competition
              </Button>
            </div>
          </div>
        </div>

        {/* Completion Message */}
        {state.finished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg text-center"
          >
            <p className="text-lg font-semibold text-green-700">
              🎉 Great job! You're ready to explore more!
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function NotFound404Page() {
  return (
    <TypingProvider initialText={CUSTOM_404_TEXT}>
      <NotFound404Content />
    </TypingProvider>
  );
}
