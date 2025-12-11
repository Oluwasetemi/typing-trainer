import { useSettings } from '../../../context/settings-context';
import SettingsToggle from '../settings-toggle';

export default function BehaviorSettings() {
  const { settings, updateSection } = useSettings();

  return (
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900">Typing Behavior</h2>
      <p className="mt-1 text-sm leading-6 text-gray-500">
        Configure how typing interactions work.
      </p>

      <div className="mt-6 border-t border-gray-200 divide-y divide-gray-200">
        <div className="space-y-4 py-6">
          <SettingsToggle
            enabled={settings.behavior.spaceSkipsWord}
            onChange={spaceSkipsWord => updateSection('behavior', { spaceSkipsWord })}
            label="Space Skips to Next Word"
            description="Pressing space jumps to the next word instead of advancing letter by letter"
          />

          <SettingsToggle
            enabled={settings.behavior.strictMode}
            onChange={strictMode => updateSection('behavior', { strictMode })}
            label="Strict Mode"
            description="Must correct all errors before continuing (coming soon)"
          />

          <SettingsToggle
            enabled={settings.behavior.pauseOnError}
            onChange={pauseOnError => updateSection('behavior', { pauseOnError })}
            label="Pause on Error"
            description="Briefly pause when an error is detected (coming soon)"
          />

          <SettingsToggle
            enabled={settings.behavior.confirmReset}
            onChange={confirmReset => updateSection('behavior', { confirmReset })}
            label="Confirm Reset"
            description="Show confirmation dialog before resetting progress"
          />
        </div>
      </div>
    </div>
  );
}
