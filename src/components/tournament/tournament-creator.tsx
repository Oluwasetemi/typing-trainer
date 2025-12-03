import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import type { TournamentFormat, TournamentSettings, WinCondition } from '@/types/tournament.types';

import { FormActions, FormField, FormSection } from '@/components/common/form-components';

type TournamentCreatorProps = {
  username: string;
  onCreateTournament: (settings: TournamentSettings, name: string, username: string) => void;
};

const TOURNAMENT_FORMATS: { value: TournamentFormat; label: string; description: string }[] = [
  { value: 'single-elimination', label: 'Single Elimination', description: 'Win or go home - losers are eliminated' },
  { value: 'double-elimination', label: 'Double Elimination', description: 'Two chances - losers bracket available' },
  { value: 'round-robin', label: 'Round Robin', description: 'Everyone plays everyone once' },
  { value: 'swiss-system', label: 'Swiss System', description: 'Paired by similar records each round' },
];

const WIN_CONDITIONS: { value: WinCondition; label: string; description: string }[] = [
  { value: 'fastest-completion', label: 'Fastest Completion', description: 'First to finish wins' },
  { value: 'highest-wpm', label: 'Highest WPM', description: 'Highest speed with min accuracy' },
  { value: 'best-score', label: 'Best Score', description: 'WPM × Accuracy combined' },
  { value: 'race-to-target', label: 'Race to Target', description: 'First to reach target WPM/progress' },
];

const TOURNAMENT_SIZES = [4, 8, 16, 32, 64];

export function TournamentCreator({ username, onCreateTournament }: TournamentCreatorProps) {
  const navigate = useNavigate();
  const [tournamentName, setTournamentName] = useState('');
  const [format, setFormat] = useState<TournamentFormat>('single-elimination');
  const [winCondition, setWinCondition] = useState<WinCondition>('highest-wpm');
  const [size, setSize] = useState(8);
  const [minAccuracy, setMinAccuracy] = useState(95);
  const [targetWpm, setTargetWpm] = useState(60);
  const [targetProgress, setTargetProgress] = useState(100);
  const [advanceDelay, setAdvanceDelay] = useState(10000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const settings: TournamentSettings = {
      format,
      winCondition,
      size,
      minAccuracy: winCondition === 'highest-wpm' ? minAccuracy : undefined,
      targetWpm: winCondition === 'race-to-target' ? targetWpm : undefined,
      targetProgress: winCondition === 'race-to-target' ? targetProgress : undefined,
      advanceDelay,
    };

    onCreateTournament(settings, tournamentName, username);
  };

  const selectedFormat = TOURNAMENT_FORMATS.find(f => f.value === format);
  const selectedCondition = WIN_CONDITIONS.find(c => c.value === winCondition);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Create Tournament
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Set up a tournament for multiple players to compete in a bracket-style competition
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <FormSection
          title="Host Information"
          description="Tournament host details"
        >
          <FormField
            label="Your Username"
            id="hostUsername"
            type="text"
            value={username}
            onChange={() => {}}
            disabled
            colSpan="full"
          />
        </FormSection>

        <FormSection
          title="Tournament Details"
          description="Basic information about your tournament"
        >
          <FormField
            label="Tournament Name"
            id="tournamentName"
            type="text"
            value={tournamentName}
            onChange={value => setTournamentName(value)}
            placeholder="My Typing Tournament"
            required
            colSpan="full"
          />
        </FormSection>

        <FormSection
          title="Tournament Format"
          description={selectedFormat?.description || 'Select how participants will compete'}
        >
          <div className="col-span-full space-y-2">
            <label htmlFor="format" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
              Format
            </label>
            <select
              id="format"
              value={format}
              onChange={e => setFormat(e.target.value as TournamentFormat)}
              className="block w-full rounded-md bg-white dark:bg-zinc-800 px-3 py-2 text-base text-gray-900 dark:text-gray-100 outline-1 -outline-offset-1 outline-gray-300 dark:outline-zinc-600 focus:outline-2 focus:-outline-offset-2 focus:outline-purple-600 dark:focus:outline-purple-500 sm:text-sm/6"
            >
              {TOURNAMENT_FORMATS.map(fmt => (
                <option key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </option>
              ))}
            </select>
          </div>
        </FormSection>

        <FormSection
          title="Win Condition"
          description={selectedCondition?.description || 'How winners are determined'}
        >
          <div className="col-span-full space-y-4">
            <div className="space-y-2">
              <label htmlFor="winCondition" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                Condition
              </label>
              <select
                id="winCondition"
                value={winCondition}
                onChange={e => setWinCondition(e.target.value as WinCondition)}
                className="block w-full rounded-md bg-white dark:bg-zinc-800 px-3 py-2 text-base text-gray-900 dark:text-gray-100 outline-1 -outline-offset-1 outline-gray-300 dark:outline-zinc-600 focus:outline-2 focus:-outline-offset-2 focus:outline-purple-600 dark:focus:outline-purple-500 sm:text-sm/6"
              >
                {WIN_CONDITIONS.map(cond => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>

            {winCondition === 'highest-wpm' && (
              <FormField
                label="Minimum Accuracy (%)"
                id="minAccuracy"
                type="number"
                value={minAccuracy.toString()}
                onChange={value => setMinAccuracy(Number(value))}
                required
                colSpan="full"
              />
            )}

            {winCondition === 'race-to-target' && (
              <>
                <FormField
                  label="Target WPM"
                  id="targetWpm"
                  type="number"
                  value={targetWpm.toString()}
                  onChange={value => setTargetWpm(Number(value))}
                  required
                  colSpan="full"
                />
                <FormField
                  label="Target Progress (%)"
                  id="targetProgress"
                  type="number"
                  value={targetProgress.toString()}
                  onChange={value => setTargetProgress(Number(value))}
                  required
                  colSpan="full"
                />
              </>
            )}
          </div>
        </FormSection>

        <FormSection
          title="Tournament Size"
          description="Number of participants (must be power of 2 for elimination formats)"
        >
          <div className="col-span-full space-y-2">
            <label htmlFor="size" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
              Size
            </label>
            <select
              id="size"
              value={size}
              onChange={e => setSize(Number(e.target.value))}
              className="block w-full rounded-md bg-white dark:bg-zinc-800 px-3 py-2 text-base text-gray-900 dark:text-gray-100 outline-1 -outline-offset-1 outline-gray-300 dark:outline-zinc-600 focus:outline-2 focus:-outline-offset-2 focus:outline-purple-600 dark:focus:outline-purple-500 sm:text-sm/6"
            >
              {TOURNAMENT_SIZES.map(s => (
                <option key={s} value={s}>
                  {s}
                  {' '}
                  Players
                </option>
              ))}
            </select>
          </div>
        </FormSection>

        <FormSection
          title="Advanced Settings"
          description="Fine-tune tournament behavior"
        >
          <FormField
            label="Delay Between Rounds (seconds)"
            id="advanceDelay"
            type="number"
            value={(advanceDelay / 1000).toString()}
            onChange={value => setAdvanceDelay(Number(value) * 1000)}
            required
            colSpan="full"
          />
        </FormSection>

        <FormActions
          onCancel={() => navigate({ to: '/' })}
          submitText="Create Tournament"
          cancelText="Cancel"
        />
      </form>
    </div>
  );
}
