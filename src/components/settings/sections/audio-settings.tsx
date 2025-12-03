import { useSettings } from '../../../context/settings-context';
import SettingsSelect from '../settings-select';
import SettingsToggle from '../settings-toggle';

export default function AudioSettings() {
  const { settings, updateSection } = useSettings();

  return (
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900">Audio Settings</h2>
      <p className="mt-1 text-sm leading-6 text-gray-500">
        Configure sound effects and audio feedback.
      </p>

      <div className="mt-6 border-t border-gray-200 divide-y divide-gray-200">
        <div className="space-y-4 py-6">
          <SettingsToggle
            enabled={settings.audio.enabled}
            onChange={enabled => updateSection('audio', { enabled })}
            label="Enable Audio"
            description="Turn on sound effects"
          />

          <SettingsSelect
            value={settings.audio.soundEffect}
            onChange={soundEffect => updateSection('audio', { soundEffect: soundEffect as any })}
            options={[
              { value: 'none', label: 'None' },
              { value: 'mechanical', label: 'Mechanical' },
              { value: 'typewriter', label: 'Typewriter' },
              { value: 'soft', label: 'Soft Click' },
            ]}
            label="Sound Effect"
            description="Choose typing sound effect"
          />

          <div className="py-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Volume
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.audio.volume}
              onChange={e => updateSection('audio', { volume: Number(e.target.value) })}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              {settings.audio.volume}
              %
            </p>
          </div>

          <SettingsToggle
            enabled={settings.audio.errorSound}
            onChange={errorSound => updateSection('audio', { errorSound })}
            label="Error Sound"
            description="Play sound when you make an error"
          />

          <SettingsToggle
            enabled={settings.audio.completionSound}
            onChange={completionSound => updateSection('audio', { completionSound })}
            label="Completion Sound"
            description="Play sound when you finish typing"
          />
        </div>
      </div>
    </div>
  );
}
