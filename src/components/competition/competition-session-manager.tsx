import { useState } from 'react';

import { Icons } from '../../utils/icons';

type CompetitionSessionManagerProps = {
  onCreateCompetition: (competitionName: string) => void;
  onJoinCompetition: (competitionId: string, username: string) => void;
};

export default function CompetitionSessionManager({
  onCreateCompetition,
  onJoinCompetition,
}: CompetitionSessionManagerProps) {
  const [competitionName, setCompetitionName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinUsername, setJoinUsername] = useState('');

  const handleCreateCompetition = () => {
    const name = competitionName.trim() || 'Typing Competition';
    onCreateCompetition(name);
  };

  const handleJoinCompetition = () => {
    if (!joinCode.trim() || !joinUsername.trim()) {
      // eslint-disable-next-line no-alert
      alert('Please enter both competition code and username');
      return;
    }
    onJoinCompetition(joinCode.trim(), joinUsername.trim());
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Icons.Flag size={32} />
          Competition Mode
        </h1>
        <p className="text-gray-600">
          Race against friends in real-time typing competitions
        </p>
      </header>

      <div className="space-y-6">
        {/* Create Competition */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
          <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center gap-2">
            <Icons.GameController size={24} />
            Create Competition
          </h2>
          <p className="text-purple-600 mb-4">
            Start a new competition and invite others to race
          </p>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="competitionName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Competition Name (Optional)
              </label>
              <input
                id="competitionName"
                type="text"
                value={competitionName}
                onChange={e => setCompetitionName(e.target.value)}
                placeholder="Friday Speed Challenge"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
              />
            </div>

            <button
              type="button"
              onClick={handleCreateCompetition}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all font-medium shadow-md"
            >
              Create Competition
            </button>
          </div>
        </div>

        {/* Join Competition */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
            <Icons.Rocket size={24} />
            Join Competition
          </h2>
          <p className="text-green-600 mb-4">
            Enter a competition code to join an existing race
          </p>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="joinCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Competition Code
              </label>
              <input
                id="joinCode"
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="RACE-A1B2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black uppercase"
                maxLength={9}
              />
            </div>

            <div>
              <label
                htmlFor="joinUsername"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Username
              </label>
              <input
                id="joinUsername"
                type="text"
                value={joinUsername}
                onChange={e => setJoinUsername(e.target.value)}
                placeholder="SpeedTyper123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                maxLength={20}
              />
            </div>

            <button
              type="button"
              onClick={handleJoinCompetition}
              disabled={!joinCode.trim() || !joinUsername.trim()}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Competition
            </button>
          </div>
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
