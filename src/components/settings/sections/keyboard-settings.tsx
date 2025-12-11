import { useSettings } from '../../../context/settings-context';
import SettingsSelect from '../settings-select';
import SettingsToggle from '../settings-toggle';

export default function KeyboardSettings() {
  const { settings, updateSection } = useSettings();

  return (
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900">
        Keyboard Settings
      </h2>
      <p className="mt-1 text-sm leading-6 text-gray-500">
        Configure the visual keyboard display and layout.
      </p>

      <div className="mt-6 border-t border-gray-200 divide-y divide-gray-200">
        <div className="space-y-4 py-6">
          <SettingsToggle
            enabled={settings.keyboard.enabled}
            onChange={enabled => updateSection('keyboard', { enabled })}
            label="Show Keyboard Display"
            description="Display visual keyboard showing current key"
          />

          <SettingsSelect
            value={settings.keyboard.layout}
            onChange={layout => updateSection('keyboard', { layout: layout as any })}
            options={[
              { value: 'qwerty', label: 'QWERTY' },
              { value: 'colemak', label: 'Colemak' },
              { value: 'dvorak', label: 'Dvorak' },
              { value: 'azerty', label: 'AZERTY' },
              { value: 'abcdef', label: 'ABCDEF' },
            ]}
            label="Keyboard Layout"
            description="Choose your keyboard layout"
          />

          <SettingsToggle
            enabled={settings.keyboard.showDuringTyping}
            onChange={showDuringTyping => updateSection('keyboard', { showDuringTyping })}
            label="Show During Active Typing"
            description="Keep keyboard visible while typing (vs only before starting)"
          />

          <SettingsSelect
            value={settings.keyboard.highlightStyle}
            onChange={highlightStyle => updateSection('keyboard', { highlightStyle: highlightStyle as any })}
            options={[
              { value: 'full', label: 'Full Keyboard' },
              { value: 'minimal', label: 'Minimal (Current Key Only)' },
            ]}
            label="Display Style"
            description="Choose between full keyboard or minimal view"
          />
        </div>
      </div>
    </div>
  );
}
