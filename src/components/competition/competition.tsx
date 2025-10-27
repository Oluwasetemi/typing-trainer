import { useEffect, useState } from 'react';

import { useCompetition } from '../../hooks/use-competition';
import CompetitionResults from './competition-results';
import CompetitionTypingView from './competition-typing-view';
import CompetitionWaitingRoom from './competition-waiting-room';
import CountdownOverlay from './countdown-overlay';

type CompetitionProps = {
  competitionId: string;
  userId: string;
  username: string;
  onLeave: () => void;
};

export default function Competition({
  competitionId,
  userId,
  username,
  onLeave,
}: CompetitionProps) {
  const {
    session,
    leaderboard,
    isConnected,
    connectionError,
    joinCompetition,
    setReady,
    startCompetition,
    sendTypingUpdate,
    finishTyping,
    leaveCompetition,
  } = useCompetition(competitionId, userId);

  const [showCountdown, setShowCountdown] = useState(false);
  const [hasJoined, setHasJoined] = useState(() => {
    // Check if we've already joined this competition in this session
    const joinedKey = `typing-competition-joined-${competitionId}`;
    return sessionStorage.getItem(joinedKey) === 'true';
  });

  // Auto-join when connected
  useEffect(() => {
    if (isConnected && !hasJoined) {
      console.log('[Competition] Auto-joining competition:', competitionId, 'as', username);
      joinCompetition(username);
      setHasJoined(true);
      // Mark as joined in sessionStorage to persist across refreshes
      const joinedKey = `typing-competition-joined-${competitionId}`;
      sessionStorage.setItem(joinedKey, 'true');
    }
  }, [isConnected, hasJoined, joinCompetition, username, competitionId]);

  // Handle countdown state
  useEffect(() => {
    if (session?.state === 'countdown' && !showCountdown) {
      setShowCountdown(true);
    }
    if (session?.state === 'active' && showCountdown) {
      setShowCountdown(false);
    }
  }, [session?.state, showCountdown]);

  const handleLeave = () => {
    // Clear the joined flag when leaving
    const joinedKey = `typing-competition-joined-${competitionId}`;
    sessionStorage.removeItem(joinedKey);
    leaveCompetition();
    onLeave();
  };

  const handleRaceAgain = () => {
    // For now, just go back to session manager
    // In the future, could implement a "rematch" feature
    handleLeave();
  };

  // Loading state
  if (!isConnected || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">
            {connectionError || 'Connecting to competition...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600 mb-4">{connectionError}</p>
          <button
            type="button"
            onClick={onLeave}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render based on competition state
  return (
    <>
      {session.state === 'waiting' && (
        <CompetitionWaitingRoom
          session={session}
          currentUserId={userId}
          onReady={setReady}
          onStart={startCompetition}
          onLeave={handleLeave}
        />
      )}

      {showCountdown && session.countdownStartTime && (
        <CountdownOverlay
          countdownStartTime={session.countdownStartTime}
          onCountdownComplete={() => setShowCountdown(false)}
        />
      )}

      {session.state === 'active' && (
        <CompetitionTypingView
          session={session}
          leaderboard={leaderboard}
          onTypingUpdate={sendTypingUpdate}
          onFinish={finishTyping}
        />
      )}

      {session.state === 'finished' && (
        <CompetitionResults
          leaderboard={leaderboard}
          competitionName={session.name}
          onRaceAgain={handleRaceAgain}
          onNewCompetition={handleLeave}
        />
      )}
    </>
  );
}
