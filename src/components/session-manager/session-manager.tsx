import { useState } from 'react';

import { useTypingSession } from '../../hooks/use-typing-session';

type SessionManagerProps = {
  onStartSession: (sessionId: string, role: 'typist' | 'spectator', sessionName?: string) => void;
};

export default function SessionManager({
  onStartSession,
}: SessionManagerProps) {
  const { createSession, joinSession, getSessionUrl } = useTypingSession();
  const [sessionName, setSessionName] = useState('');
  const [joinSessionId, setJoinSessionId] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const handleCreateSession = () => {
    const session = createSession(sessionName || undefined);
    setCurrentSessionId(session.id);
    setShowShareModal(true);
  };

  const handleJoinAsTypist = () => {
    if (currentSessionId) {
      onStartSession(currentSessionId, 'typist', sessionName);
      setShowShareModal(false);
    }
  };

  const handleJoinSession = () => {
    if (joinSessionId.trim()) {
      joinSession(joinSessionId.trim());
      onStartSession(joinSessionId.trim(), 'spectator');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Real-time Typing Sessions
        </h1>
        <p className="text-gray-600">
          Create a session to type or join one to spectate
        </p>
      </header>

      <div className="space-y-6">
        {/* Create Session */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            Start a Typing Session
          </h2>
          <p className="text-blue-600 mb-4">
            Create a new session where others can watch you type in real-time
          </p>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="sessionName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Session Name (Optional)
              </label>
              <input
                id="sessionName"
                type="text"
                value={sessionName}
                onChange={e => setSessionName(e.target.value)}
                placeholder="My Typing Session"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>

            <button
              type="button"
              onClick={handleCreateSession}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Create Session
            </button>
          </div>
        </div>

        {/* Join Session */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-xl font-semibold text-green-800 mb-4">
            Watch a Session
          </h2>
          <p className="text-green-600 mb-4">
            Enter a session ID to spectate someone else's typing session
          </p>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="joinSessionId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Session ID
              </label>
              <input
                id="joinSessionId"
                type="text"
                value={joinSessionId}
                onChange={e => setJoinSessionId(e.target.value)}
                placeholder="Enter session ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
              />
            </div>

            <button
              type="button"
              onClick={handleJoinSession}
              disabled={!joinSessionId.trim()}
              className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join as Spectator
            </button>
          </div>
        </div>

        {/* Solo Practice */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Solo Practice
          </h2>
          <p className="text-gray-600 mb-4">
            Practice typing without real-time features
          </p>

          <button
            type="button"
            onClick={() => onStartSession('solo', 'typist')}
            className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Start Solo Practice
          </button>
        </div>
      </div>

      {/* Share Session Modal */}
      {showShareModal && currentSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Session Created! 🎉
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="sessionId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Session ID
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="sessionId"
                    type="text"
                    value={currentSessionId}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-black"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(currentSessionId)}
                    className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="spectatorLink"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Spectator Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="spectatorLink"
                    type="text"
                    value={getSessionUrl(currentSessionId, 'spectator')}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-xs text-black"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        getSessionUrl(currentSessionId, 'spectator'),
                      )}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Next steps:</strong>
                </p>
                <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                  <li>Share the Session ID or link with spectators</li>
                  <li>Click "Start Typing" to begin your session</li>
                  <li>Spectators will see your typing in real-time!</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleJoinAsTypist}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Start Typing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
