import type {
  CompetitionSession,
  Participant,
} from '../../types/competition.types'

type CompetitionWaitingRoomProps = {
  session: CompetitionSession
  currentUserId: string
  onReady: (isReady: boolean) => void
  onStart: () => void
  onLeave: () => void
}

export default function CompetitionWaitingRoom({
  session,
  currentUserId,
  onReady,
  onStart,
  onLeave,
}: CompetitionWaitingRoomProps) {
  const participants = Object.values(session.participants)
  const currentParticipant = session.participants[currentUserId]
  const isHost = currentParticipant?.isHost || false
  const readyCount = participants.filter((p) => p.isReady).length
  const totalCount = participants.length
  const canStart = totalCount >= session.settings.minParticipants

  const copyCompetitionCode = () => {
    navigator.clipboard.writeText(session.code).then(() => {
      // Could add a toast notification here
    })
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Waiting Room</h1>
        <p className="text-gray-600">{session.name}</p>
      </header>

      {/* Competition Code */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Competition Code:</p>
            <p className="text-2xl font-bold text-purple-700">{session.code}</p>
          </div>
          <button
            type="button"
            onClick={copyCompetitionCode}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
          >
            📋 Copy Code
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Share this code with friends to invite them
        </p>
      </div>

      {/* Ready Status */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-800">
              Ready:
              {readyCount}/{totalCount}
            </p>
            <p className="text-xs text-blue-600">
              {canStart
                ? 'Minimum participants met!'
                : `Need ${session.settings.minParticipants - totalCount} more participant(s)`}
            </p>
          </div>
          {currentParticipant && (
            <button
              type="button"
              title="Click me to show you are ready"
              onClick={() => onReady(!currentParticipant.isReady)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentParticipant.isReady
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {currentParticipant.isReady ? '✓ Ready' : 'Not Ready'}
            </button>
          )}
        </div>
      </div>

      {/* Participants List */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Participants ({totalCount}/{session.settings.maxParticipants})
        </h2>
        <div className="space-y-2">
          {participants.map((participant) => (
            <ParticipantCard
              key={participant.userId}
              participant={participant}
              isYou={participant.userId === currentUserId}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onLeave}
          className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
        >
          Leave Competition
        </button>

        {isHost && (
          <button
            type="button"
            onClick={onStart}
            disabled={!canStart}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {canStart ? '🏁 Start Competition' : 'Waiting for participants...'}
          </button>
        )}
      </div>

      {!isHost && (
        <p className="text-center text-sm text-gray-500 mt-3">
          Waiting for host to start the competition...
        </p>
      )}
    </div>
  )
}

function ParticipantCard({
  participant,
  isYou,
}: {
  participant: Participant
  isYou: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${
        isYou ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${
            isYou ? 'bg-blue-500' : 'bg-gray-400'
          }`}
        >
          {participant.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-gray-800">
            {participant.username}
            {isYou && (
              <span className="ml-2 text-xs text-blue-600 font-semibold">
                (You)
              </span>
            )}
            {participant.isHost && (
              <span className="ml-2 text-xs text-purple-600 font-semibold">
                👑 Host
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">
            {participant.isConnected ? 'Connected' : 'Disconnected'}
          </p>
        </div>
      </div>

      <div>
        {participant.isReady ? (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            ✓ Ready
          </span>
        ) : (
          <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
            Not Ready
          </span>
        )}
      </div>
    </div>
  )
}
