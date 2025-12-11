import { useSettings } from '../../../context/settings-context';
import SettingsToggle from '../settings-toggle';

export default function AccessibilitySettings() {
  const { settings, updateSection } = useSettings();

  return (
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-settingsHeadingDark">Accessibility</h2>
      <p className="mt-1 text-sm leading-6 text-gray-500">
        Make the typing trainer more accessible and comfortable to use.
      </p>

      <div className="mt-6 border-t border-gray-200 divide-y divide-gray-200">
        <div className="space-y-4 py-6">
          <SettingsToggle
            enabled={settings.accessibility.highContrast}
            onChange={highContrast => updateSection('accessibility', { highContrast })}
            label="High Contrast Mode"
            description="Increase contrast for better visibility (coming soon)"
          />

          <SettingsToggle
            enabled={settings.accessibility.reducedMotion}
            onChange={reducedMotion => updateSection('accessibility', { reducedMotion })}
            label="Reduced Motion"
            description="Minimize animations and transitions (coming soon)"
          />

          <SettingsToggle
            enabled={settings.accessibility.screenReaderFriendly}
            onChange={screenReaderFriendly => updateSection('accessibility', { screenReaderFriendly })}
            label="Screen Reader Optimizations"
            description="Enhance compatibility with screen readers (coming soon)"
          />

          <SettingsToggle
            enabled={settings.accessibility.largerClickTargets}
            onChange={largerClickTargets => updateSection('accessibility', { largerClickTargets })}
            label="Larger Click Targets"
            description="Make buttons and controls easier to click (coming soon)"
          />
        </div>
      </div>
    </div>
  );
}
