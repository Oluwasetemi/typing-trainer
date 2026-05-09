import { useState } from 'react';

import { useSettings } from '../../context/settings-context';
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from '../alert';
import { Button } from '../button';
import AccessibilitySettings from './sections/accessibility-settings';
import AudioSettings from './sections/audio-settings';
import BehaviorSettings from './sections/behavior-settings';
import CompetitionSettings from './sections/competition-settings';
import DisplaySettings from './sections/display-settings';
import KeyboardSettings from './sections/keyboard-settings';
import ProgressSettings from './sections/progress-settings';
import SessionSettings from './sections/session-settings';

type SettingsPageProps = {
  currentSection: string;
};

export default function SettingsPage({ currentSection }: SettingsPageProps) {
  const { resetSettings } = useSettings();
  const [isResetAlertOpen, setIsResetAlertOpen] = useState(false);

  const handleResetAll = () => {
    resetSettings();
    setIsResetAlertOpen(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
      {currentSection === 'display' && <DisplaySettings />}
      {currentSection === 'keyboard' && <KeyboardSettings />}
      {currentSection === 'progress' && <ProgressSettings />}
      {currentSection === 'audio' && <AudioSettings />}
      {currentSection === 'behavior' && <BehaviorSettings />}
      {currentSection === 'competition' && <CompetitionSettings />}
      {currentSection === 'session' && <SessionSettings />}
      {currentSection === 'accessibility' && <AccessibilitySettings />}

      {/* Reset All Settings Button */}
      <div className="pt-8 border-t border-gray-200">
        <Button
          type="button"
          color="red"
          onClick={() => setIsResetAlertOpen(true)}
        >
          Reset All Settings to Defaults
        </Button>
        <p className="mt-2 text-sm text-gray-500">
          This will reset all your preferences to the default values.
        </p>
      </div>

      {/* Reset Confirmation Alert */}
      <Alert open={isResetAlertOpen} onClose={() => setIsResetAlertOpen(false)}>
        <AlertTitle>Reset All Settings?</AlertTitle>
        <AlertDescription>
          Are you sure you want to reset all settings to their default values? This action cannot be undone.
        </AlertDescription>
        <AlertActions>
          <Button plain onClick={() => setIsResetAlertOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleResetAll}>
            Reset Settings
          </Button>
        </AlertActions>
      </Alert>
    </div>
  );
}
