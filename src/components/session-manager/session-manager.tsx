import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState } from 'react';

import { useNotification } from '../../hooks/use-notification';
import { useTypingSession } from '../../hooks/use-typing-session';
import { Icons } from '../../utils/icons';
import { Button } from '../button';
import { Notification } from '../common';
import { FormActions, FormField, FormSection } from '../common/form-components';
import { Field, Label } from '../fieldset';
import { Input } from '../input';

type SessionManagerProps = {
  onStartSession: (sessionId: string, role: 'typist' | 'spectator', sessionName?: string) => void;
};

export default function SessionManager({
  onStartSession,
}: SessionManagerProps) {
  const { createSession, joinSession, getSessionUrl } = useTypingSession();
  const { notification, hideNotification, showSuccess } = useNotification();
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
      showSuccess('Copied to clipboard!', 'The link has been copied successfully.');
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Real-time Typing Sessions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create a session to type or join one to spectate
        </p>
      </header>

      <div className="space-y-6">
        {/* Create Session */}
        <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <FormSection
            title="Start a Typing Session"
            description="Create a new session where others can watch you type in real-time"
          >
            <FormField
              label="Session Name"
              id="sessionName"
              value={sessionName}
              onChange={setSessionName}
              placeholder="My Typing Session"
              colSpan="full"
            />
          </FormSection>

          <FormActions
            submitText="Create Session"
            onSubmit={handleCreateSession}
            className="mt-0"
          />
        </div>

        {/* Join Session */}
        <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <FormSection
            title="Watch a Session"
            description="Enter a session ID to spectate someone else's typing session"
          >
            <FormField
              label="Session ID"
              id="joinSessionId"
              value={joinSessionId}
              onChange={setJoinSessionId}
              placeholder="Enter session ID"
              colSpan="full"
              required
            />
          </FormSection>

          <FormActions
            submitText="Join as Spectator"
            onSubmit={handleJoinSession}
            submitDisabled={!joinSessionId.trim()}
            className="mt-0"
          />
        </div>
      </div>

      {/* Share Session Modal */}
      <Dialog open={showShareModal && !!currentSessionId} onClose={() => setShowShareModal(false)} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white dark:bg-zinc-900 px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div>
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50">
                  <Icons.Check aria-hidden="true" className="size-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Session Created!
                  </DialogTitle>
                  <div className="mt-4 space-y-4">
                    <Field className="text-left" disabled>
                      <Label htmlFor="sessionId">Session ID</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="sessionId"
                          type="text"
                          value={currentSessionId || ''}
                          readOnly
                          className="rounded"
                        />
                        <Button
                          type="button"
                          onClick={() => currentSessionId && copyToClipboard(currentSessionId)}
                          color="zinc"
                        >
                          Copy
                        </Button>
                      </div>
                    </Field>

                    <Field className="text-left">
                      <Label htmlFor="spectatorLink">Spectator Link</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="spectatorLink"
                          type="text"
                          value={currentSessionId ? getSessionUrl(currentSessionId, 'spectator') : ''}
                          readOnly
                          disabled
                        />
                        <Button
                          type="button"
                          onClick={() =>
                            currentSessionId && copyToClipboard(
                              getSessionUrl(currentSessionId, 'spectator'),
                            )}
                          color="blue"
                        >
                          Copy
                        </Button>
                      </div>
                    </Field>

                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg text-left">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Next steps:</strong>
                      </p>
                      <ol className="text-sm text-blue-700 dark:text-blue-400 mt-2 space-y-1 list-decimal list-inside">
                        <li>Share the Session ID or link with spectators</li>
                        <li>Click "Start Typing" to begin your session</li>
                        <li>Spectators will see your typing in real-time!</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <Button
                  type="button"
                  onClick={handleJoinAsTypist}
                  color="blue"
                  className="sm:col-start-2"
                >
                  Start Typing
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  outline
                  color="red"
                  className="mt-3 sm:col-start-1 sm:mt-0"
                >
                  Cancel
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

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
