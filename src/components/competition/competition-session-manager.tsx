import { useState } from 'react';

import { Icons } from '../../utils/icons';
import { FormActions, FormField, FormSection } from '../common/form-components';

type CompetitionSessionManagerProps = {
  onCreateCompetition: (competitionName: string, username: string) => void;
  onJoinCompetition: (competitionId: string, username: string) => void;
};

export default function CompetitionSessionManager({
  onCreateCompetition,
  onJoinCompetition,
}: CompetitionSessionManagerProps) {
  const [competitionName, setCompetitionName] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinUsername, setJoinUsername] = useState('');

  const handleCreateCompetition = () => {
    if (!createUsername.trim()) {
      return;
    }
    const name = competitionName.trim() || 'Typing Competition';
    onCreateCompetition(name, createUsername.trim());
  };

  const handleJoinCompetition = () => {
    if (!joinCode.trim() || !joinUsername.trim()) {
      return;
    }
    onJoinCompetition(joinCode.trim(), joinUsername.trim());
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center justify-center gap-2">
          <Icons.Flag size={32} />
          Competition Mode
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Race against friends in real-time typing competitions
        </p>
      </header>

      <div className="space-y-6">
        {/* Create Competition */}
        <div className="bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
          <FormSection
            title="Create Competition"
            description="Start a new competition and invite others to race"
          >
            <FormField
              label="Competition Name"
              id="competitionName"
              value={competitionName}
              onChange={setCompetitionName}
              placeholder="Friday Speed Challenge"
              colSpan="full"
            />

            <FormField
              label="Your Username"
              id="createUsername"
              value={createUsername}
              onChange={setCreateUsername}
              placeholder="SpeedTyper123"
              maxLength={20}
              colSpan="full"
              required
            />
          </FormSection>

          <FormActions
            submitText={(
              <>
                <Icons.GameController size={18} className="inline mr-2" />
                Create Competition
              </>
            )}
            onSubmit={handleCreateCompetition}
            submitDisabled={!createUsername.trim() || createUsername.length < 3}
            className="mt-0"
          />
        </div>

        {/* Join Competition */}
        <div className="bg-linear-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <FormSection
            title="Join Competition"
            description="Enter a competition code to join an existing race"
          >
            <FormField
              label="Competition Code"
              id="joinCode"
              value={joinCode}
              onChange={value => setJoinCode(value.toUpperCase())}
              placeholder="RACE-A1B2"
              maxLength={9}
              colSpan="full"
              required
              className="uppercase"
            />

            <FormField
              label="Your Username"
              id="joinUsername"
              value={joinUsername}
              onChange={setJoinUsername}
              placeholder="SpeedTyper123"
              maxLength={20}
              colSpan="full"
              required
            />
          </FormSection>

          <FormActions
            submitText={(
              <>
                <Icons.Rocket size={18} className="inline mr-2" />
                Join Competition
              </>
            )}
            onSubmit={handleJoinCompetition}
            submitDisabled={!joinCode.trim() || !joinUsername.trim() || joinUsername.length < 3}
            className="mt-0"
          />
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            How it works:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className="flex items-center gap-2">
              <Icons.Target size={16} />
              Create or join a competition room
            </li>
            <li className="flex items-center gap-2">
              <Icons.Timer size={16} />
              Wait for other participants in the lobby
            </li>
            <li className="flex items-center gap-2">
              <Icons.Flag size={16} />
              Race begins after countdown
            </li>
            <li className="flex items-center gap-2">
              <Icons.Stats size={16} />
              Live leaderboard shows everyone's progress
            </li>
            <li className="flex items-center gap-2">
              <Icons.Trophy size={16} />
              Winners are crowned at the finish!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
