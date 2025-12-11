import { useSettings } from '../../../context/settings-context';
import SettingsToggle from '../settings-toggle';

export default function ProgressSettings() {
  const { settings, updateSection } = useSettings();

  return (
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-settingsHeadingDark">
        Progress & Stats
      </h2>
      <p className="mt-1 text-sm leading-6 text-gray-500">
        Control what progress and statistics information is displayed.
      </p>

      <div className="mt-6 border-t border-gray-200 divide-y divide-gray-200">
        <div className="space-y-4 py-6">
          <SettingsToggle
            enabled={settings.progress.showProgressBar}
            onChange={showProgressBar => updateSection('progress', { showProgressBar })}
            label="Show Progress Bar"
            description="Display a progress bar showing completion percentage"
          />

          <SettingsToggle
            enabled={settings.progress.showLiveStats}
            onChange={showLiveStats => updateSection('progress', { showLiveStats })}
            label="Show Live Statistics"
            description="Display WPM and accuracy during typing"
          />

          <SettingsToggle
            enabled={settings.progress.showTimer}
            onChange={showTimer => updateSection('progress', { showTimer })}
            label="Show Timer"
            description="Display elapsed time while typing"
          />

          <SettingsToggle
            enabled={settings.progress.showCharacterCount}
            onChange={showCharacterCount => updateSection('progress', { showCharacterCount })}
            label="Show Character Count"
            description="Display characters typed vs total"
          />
        </div>
      </div>
    </div>
  );
}
