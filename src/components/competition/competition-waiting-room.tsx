import type { LucideIcon } from 'lucide-react';

import { useNotification } from '@/hooks/use-notification';

import type {
  CompetitionSession,
  Participant,
} from '../../types/competition.types';

import { Icons } from '../../utils/icons';
import { Notification } from '../common';

type CompetitionWaitingRoomProps = {
  session: CompetitionSession;
  currentUserId: string;
  onReady: (isReady: boolean) => void;
  onStart: () => void;
  onLeave: () => void;
};

export default function CompetitionWaitingRoom({
  session,
  currentUserId,
  onReady,
  onStart,
  onLeave,
}: CompetitionWaitingRoomProps) {
  const { notification, showSuccess, hideNotification } = useNotification();
  const participants = Object.values(session.participants);
  const currentParticipant = session.participants[currentUserId];
  const isHost = currentParticipant?.isHost || false;
  const readyCount = participants.filter(p => p.isReady).length;
  const totalCount = participants.length;
  const canStart = totalCount >= session.settings.minParticipants;

  const copyCompetitionCode = () => {
    navigator.clipboard.writeText(session.code).then(() => {
      showSuccess('Competition code copied!', `Code ${session.code} has been copied to clipboard. Share it with friends!`);
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Waiting Room</h1>
        <p className="text-gray-600 dark:text-gray-400">{session.name}</p>
      </header>

      {/* Competition Code */}
      <div className="bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Competition Code:</p>
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
              {readyCount}
              /
              {totalCount}
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
              onClick={() => onReady(!currentParticipant.isReady)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentParticipant.isReady
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-2 border-yellow-400'
              }`}
            >
              {currentParticipant.isReady ? '✓ Ready' : '👆 Click to Get Ready'}
            </button>
          )}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Activity Timeline (
          {totalCount}
          /
          {session.settings.maxParticipants}
          )
        </h2>
        <ParticipantsTimeline
          participants={participants}
          currentUserId={currentUserId}
        />
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
            className="flex-1 px-4 py-3 bg-linear-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
      <Notification
        show={notification.show}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </div>
  );
}

type TimelineEvent = {
  id: string;
  type: 'joined' | 'ready' | 'host';
  participant: Participant;
  icon: LucideIcon;
  iconBackground: string;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function ParticipantsTimeline({
  participants,
  currentUserId,
}: {
  participants: Participant[];
  currentUserId: string;
}) {
  // Sort participants by join time (oldest first)
  const sortedParticipants = [...participants].sort(
    (a, b) => a.joinedAt - b.joinedAt,
  );

  // Create timeline events
  const timelineEvents: TimelineEvent[] = sortedParticipants.flatMap(
    (participant) => {
      const events: TimelineEvent[] = [
        {
          id: `${participant.userId}-joined`,
          type: 'joined',
          participant,
          icon: participant.isHost ? Icons.PersonAdd : Icons.Person,
          iconBackground: participant.isHost ? 'bg-purple-500' : 'bg-gray-400',
        },
      ];

      if (participant.isReady) {
        events.push({
          id: `${participant.userId}-ready`,
          type: 'ready',
          participant,
          icon: Icons.ThumbUp,
          iconBackground: 'bg-green-500',
        });
      }

      return events;
    },
  );

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {timelineEvents.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== timelineEvents.length - 1
                ? (
                    <span
                      aria-hidden="true"
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    />
                  )
                : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={classNames(
                      event.iconBackground,
                      'flex size-8 items-center justify-center rounded-full ring-8 ring-white',
                    )}
                  >
                    <event.icon
                      aria-hidden="true"
                      className="size-5 text-white"
                    />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      {event.type === 'joined' && (
                        <>
                          <span className="font-medium text-gray-900">
                            {event.participant.username}
                          </span>
                          {' '}
                          {event.participant.isHost
                            ? 'created the competition'
                            : 'joined the competition'}
                          {event.participant.userId === currentUserId && (
                            <span className="ml-1 text-xs text-blue-600 font-semibold">
                              (You)
                            </span>
                          )}
                        </>
                      )}
                      {event.type === 'ready' && (
                        <>
                          <span className="font-medium text-gray-900">
                            {event.participant.username}
                          </span>
                          {' '}
                          is ready to race
                          {event.participant.userId === currentUserId && (
                            <span className="ml-1 text-xs text-blue-600 font-semibold">
                              (You)
                            </span>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <time
                      dateTime={new Date(
                        event.participant.joinedAt,
                      ).toISOString()}
                    >
                      {formatRelativeTime(event.participant.joinedAt)}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);

  if (seconds < 10)
    return 'Just now';
  if (seconds < 60)
    return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
