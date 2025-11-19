import { useMemo } from 'react';

export type Key = {
  x: number;
  y: number;
};

export enum KeyboardLayout {
  QWERTY = 'qwerty',
  COLEMAK = 'colemak',
  DVORAK = 'dvorak',
  AZERTY = 'azerty',
  ABCDEF = 'abcdef',
}

const keyboardLayouts: Record<KeyboardLayout, Record<string, Key>> = {
  [KeyboardLayout.QWERTY]: {
    Q: { x: 0.5, y: 0 },
    W: { x: 1.5, y: 0 },
    E: { x: 2.5, y: 0 },
    R: { x: 3.5, y: 0 },
    T: { x: 4.5, y: 0 },
    Y: { x: 5.5, y: 0 },
    U: { x: 6.5, y: 0 },
    I: { x: 7.5, y: 0 },
    O: { x: 8.5, y: 0 },
    P: { x: 9.5, y: 0 },

    A: { x: 0.75, y: 1 },
    S: { x: 1.75, y: 1 },
    D: { x: 2.75, y: 1 },
    F: { x: 3.75, y: 1 },
    G: { x: 4.75, y: 1 },
    H: { x: 5.75, y: 1 },
    J: { x: 6.75, y: 1 },
    K: { x: 7.75, y: 1 },
    L: { x: 8.75, y: 1 },

    Z: { x: 1.25, y: 2 },
    X: { x: 2.25, y: 2 },
    C: { x: 3.25, y: 2 },
    V: { x: 4.25, y: 2 },
    B: { x: 5.25, y: 2 },
    N: { x: 6.25, y: 2 },
    M: { x: 7.25, y: 2 },
  },
  [KeyboardLayout.COLEMAK]: {
    Q: { x: 0.5, y: 0 },
    W: { x: 1.5, y: 0 },
    F: { x: 2.5, y: 0 },
    P: { x: 3.5, y: 0 },
    G: { x: 4.5, y: 0 },
    J: { x: 5.5, y: 0 },
    L: { x: 6.5, y: 0 },
    U: { x: 7.5, y: 0 },
    Y: { x: 8.5, y: 0 },

    A: { x: 0.75, y: 1 },
    R: { x: 1.75, y: 1 },
    S: { x: 2.75, y: 1 },
    T: { x: 3.75, y: 1 },
    D: { x: 4.75, y: 1 },
    H: { x: 5.75, y: 1 },
    N: { x: 6.75, y: 1 },
    E: { x: 7.75, y: 1 },
    I: { x: 8.75, y: 1 },
    O: { x: 9.75, y: 1 },

    Z: { x: 1.25, y: 2 },
    X: { x: 2.25, y: 2 },
    C: { x: 3.25, y: 2 },
    V: { x: 4.25, y: 2 },
    B: { x: 5.25, y: 2 },
    K: { x: 6.25, y: 2 },
    M: { x: 7.25, y: 2 },
  },
  [KeyboardLayout.DVORAK]: {
    P: { x: 3.5, y: 0 },
    Y: { x: 4.5, y: 0 },
    F: { x: 5.5, y: 0 },
    G: { x: 6.5, y: 0 },
    C: { x: 7.5, y: 0 },
    R: { x: 8.5, y: 0 },
    L: { x: 9.5, y: 0 },

    A: { x: 0.75, y: 1 },
    O: { x: 1.75, y: 1 },
    E: { x: 2.75, y: 1 },
    U: { x: 3.75, y: 1 },
    I: { x: 4.75, y: 1 },
    D: { x: 5.75, y: 1 },
    H: { x: 6.75, y: 1 },
    T: { x: 7.75, y: 1 },
    N: { x: 8.75, y: 1 },
    S: { x: 9.75, y: 1 },

    Q: { x: 2.25, y: 2 },
    J: { x: 3.25, y: 2 },
    K: { x: 4.25, y: 2 },
    X: { x: 5.25, y: 2 },
    B: { x: 6.25, y: 2 },
    M: { x: 7.25, y: 2 },
    W: { x: 8.25, y: 2 },
    V: { x: 9.25, y: 2 },
    Z: { x: 10.25, y: 2 },
  },
  [KeyboardLayout.AZERTY]: {
    A: { x: 0.5, y: 0 },
    Z: { x: 1.5, y: 0 },
    E: { x: 2.5, y: 0 },
    R: { x: 3.5, y: 0 },
    T: { x: 4.5, y: 0 },
    Y: { x: 5.5, y: 0 },
    U: { x: 6.5, y: 0 },
    I: { x: 7.5, y: 0 },
    O: { x: 8.5, y: 0 },
    P: { x: 9.5, y: 0 },

    Q: { x: 0.75, y: 1 },
    S: { x: 1.75, y: 1 },
    D: { x: 2.75, y: 1 },
    F: { x: 3.75, y: 1 },
    G: { x: 4.75, y: 1 },
    H: { x: 5.75, y: 1 },
    J: { x: 6.75, y: 1 },
    K: { x: 7.75, y: 1 },
    L: { x: 8.75, y: 1 },
    M: { x: 9.75, y: 1 },

    W: { x: 1.25, y: 2 },
    X: { x: 2.25, y: 2 },
    C: { x: 3.25, y: 2 },
    V: { x: 4.25, y: 2 },
    B: { x: 5.25, y: 2 },
    N: { x: 6.25, y: 2 },
  },
  [KeyboardLayout.ABCDEF]: {
    A: { x: 0.5, y: 0 },
    B: { x: 1.5, y: 0 },
    C: { x: 2.5, y: 0 },
    D: { x: 3.5, y: 0 },
    E: { x: 4.5, y: 0 },
    F: { x: 5.5, y: 0 },
    G: { x: 6.5, y: 0 },
    H: { x: 7.5, y: 0 },
    I: { x: 8.5, y: 0 },
    J: { x: 9.5, y: 0 },
    K: { x: 0.75, y: 1 },
    L: { x: 1.75, y: 1 },
    M: { x: 2.75, y: 1 },
    N: { x: 3.75, y: 1 },
    O: { x: 4.75, y: 1 },
    P: { x: 5.75, y: 1 },
    Q: { x: 6.75, y: 1 },
    R: { x: 7.75, y: 1 },
    S: { x: 8.75, y: 1 },
    T: { x: 1.25, y: 2 },
    U: { x: 2.25, y: 2 },
    V: { x: 3.25, y: 2 },
    W: { x: 4.25, y: 2 },
    X: { x: 5.25, y: 2 },
    Y: { x: 6.25, y: 2 },
    Z: { x: 7.25, y: 2 },
  },
};

type KeyboardDisplayProps = {
  currentChar: string;
  layout?: KeyboardLayout;
};

export default function KeyboardDisplay({
  currentChar,
  layout = KeyboardLayout.QWERTY,
}: KeyboardDisplayProps) {
  const currentLayout = keyboardLayouts[layout];

  const activeKey = useMemo(() => {
    if (!currentChar)
      return null;
    const upperChar = currentChar.toUpperCase();
    return upperChar in currentLayout ? upperChar : null;
  }, [currentChar, currentLayout]);

  return (
    <div className="flex justify-center w-full">
      <div
        className="relative"
        style={{ width: '500px', height: '150px' }}
      >
        {Object.entries(currentLayout).map(([char, pos]) => {
          const isActive = activeKey === char;

          return (
            <div
              key={char}
              className={`absolute w-11 h-10 rounded-lg border flex items-center justify-center text-sm font-mono transition-all duration-200 ${
                isActive
                  ? 'bg-white/50 border-blue-400 text-black scale-110 shadow-lg shadow-blue-500/50'
                  : 'bg-black border-neutral-700 text-white'
              }`}
              style={{
                left: `${pos.x * 46}px`,
                top: `${pos.y * 46 + 10}px`,
              }}
            >
              {char}
            </div>
          );
        })}
      </div>
    </div>
  );
}
