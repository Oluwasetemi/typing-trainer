import { useSettings } from '../../../context/settings-context';
import SettingsToggle from '../settings-toggle';

export default function SessionSettings() {
  const { settings, updateSection } = useSettings();

  return (
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900">Session Mode</h2>
      <p className="mt-1 text-sm leading-6 text-gray-500">
        Configure settings for real-time typing sessions with spectators.
      </p>

      <div className="mt-6 border-t border-gray-200 divide-y divide-gray-200">
        <div className="space-y-4 py-6">
          <SettingsToggle
            enabled={settings.session.allowSpectators}
            onChange={allowSpectators => updateSection('session', { allowSpectators })}
            label="Allow Spectators"
            description="Let others watch your typing sessions"
          />

          <SettingsToggle
            enabled={settings.session.showSpectatorCount}
            onChange={showSpectatorCount => updateSection('session', { showSpectatorCount })}
            label="Show Spectator Count"
            description="Display how many people are watching"
          />

          <SettingsToggle
            enabled={settings.session.broadcastTypingSpeed}
            onChange={broadcastTypingSpeed => updateSection('session', { broadcastTypingSpeed })}
            label="Broadcast Typing Stats"
            description="Share real-time WPM and accuracy with spectators"
          />
        </div>
      </div>
    </div>
  );
}
