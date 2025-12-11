import { useSettings } from '../../../context/settings-context';
import SettingsToggle from '../settings-toggle';

export default function CompetitionSettings() {
  const { settings, updateSection } = useSettings();

  return (
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-settingsHeadingDark">Competition Mode</h2>
      <p className="mt-1 text-sm leading-6 text-gray-500">
        Configure settings specific to competition mode.
      </p>

      <div className="mt-6 border-t border-gray-200 divide-y divide-gray-200">
        <div className="space-y-4 py-6">
          <SettingsToggle
            enabled={settings.competition.showLeaderboard}
            onChange={showLeaderboard => updateSection('competition', { showLeaderboard })}
            label="Show Live Leaderboard"
            description="Display real-time rankings during competition"
          />

          <SettingsToggle
            enabled={settings.competition.showOpponentProgress}
            onChange={showOpponentProgress => updateSection('competition', { showOpponentProgress })}
            label="Show Opponent Progress"
            description="See other competitors' typing progress"
          />

          <SettingsToggle
            enabled={settings.competition.enableChat}
            onChange={enableChat => updateSection('competition', { enableChat })}
            label="Enable Chat"
            description="Allow text chat during competitions (coming soon)"
          />

          <SettingsToggle
            enabled={settings.competition.autoReadyUp}
            onChange={autoReadyUp => updateSection('competition', { autoReadyUp })}
            label="Auto Ready-Up"
            description="Automatically mark yourself as ready when joining"
          />
        </div>
      </div>
    </div>
  );
}
