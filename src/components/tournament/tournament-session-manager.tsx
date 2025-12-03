import { useState } from 'react';

import { Icons } from '@/utils/icons';

import { FormActions, FormField, FormSection } from '../common/form-components';

type TournamentSessionManagerProps = {
  onCreateTournament: (username: string) => void;
  onJoinTournament: (tournamentCode: string, username: string) => void;
};

export default function TournamentSessionManager({
  onCreateTournament,
  onJoinTournament,
}: TournamentSessionManagerProps) {
  const [createUsername, setCreateUsername] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinUsername, setJoinUsername] = useState('');

  const handleCreateTournament = () => {
    if (!createUsername.trim()) {
      // alert('Please enter your username');
      return;
    }
    onCreateTournament(createUsername.trim());
  };

  const handleJoinTournament = () => {
    if (!joinCode.trim() || !joinUsername.trim()) {
      // alert('Please enter both tournament code and username');
      return;
    }
    onJoinTournament(joinCode.trim().toUpperCase(), joinUsername.trim());
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900">
      <header className="mb-8 text-center">
        <h1 className="mb-2 flex items-center justify-center gap-2 text-3xl font-bold text-gray-800 dark:text-gray-100">
          <Icons.Trophy size={32} />
          Tournament Mode
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compete in bracket-style tournaments with multiple rounds
        </p>
      </header>

      <div className="space-y-6">
        {/* Create Tournament */}
        <div className="rounded-lg border border-purple-200 bg-linear-to-r from-purple-50 to-pink-50 p-6 dark:border-purple-800 dark:from-purple-950/20 dark:to-pink-950/20">
          <FormSection
            title="Create Tournament"
            description="Start a new tournament and invite others to compete"
          >
            <FormField
              label="Your Username"
              id="createUsername"
              value={createUsername}
              onChange={setCreateUsername}
              placeholder="ChampionTyper"
              maxLength={20}
              colSpan="full"
              required
            />
          </FormSection>

          <FormActions
            submitText={(
              <>
                <Icons.Trophy size={18} className="mr-2 inline" />
                Create Tournament
              </>
            )}
            onSubmit={handleCreateTournament}
            submitDisabled={!createUsername.trim()}
            className="mt-0"
          />
        </div>

        {/* Join Tournament */}
        <div className="rounded-lg border border-green-200 bg-linear-to-r from-green-50 to-teal-50 p-6 dark:border-green-800 dark:from-green-950/20 dark:to-teal-950/20">
          <FormSection
            title="Join Tournament"
            description="Enter a tournament code to join an existing bracket"
          >
            <FormField
              label="Tournament Code"
              id="joinCode"
              value={joinCode}
              onChange={value => setJoinCode(value.toUpperCase())}
              placeholder="TOUR-AB12"
              maxLength={9}
              colSpan="full"
              required
            />

            <FormField
              label="Your Username"
              id="joinUsername"
              value={joinUsername}
              onChange={setJoinUsername}
              placeholder="ChampionTyper"
              maxLength={20}
              colSpan="full"
              required
            />
          </FormSection>

          <FormActions
            submitText={(
              <>
                <Icons.PersonAdd size={18} className="mr-2 inline" />
                Join Tournament
              </>
            )}
            onSubmit={handleJoinTournament}
            submitDisabled={!joinCode.trim() || !joinUsername.trim()}
            className="mt-0"
          />
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-8 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/30">
        <p className="text-center text-sm text-purple-800 dark:text-purple-300">
          <Icons.Target size={16} className="mr-1 inline" />
          Create your tournament or join with a code to start competing!
        </p>
      </div>
    </div>
  );
}
