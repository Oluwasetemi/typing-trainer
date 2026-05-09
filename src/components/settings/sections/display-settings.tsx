import { useSettings } from '../../../context/settings-context';
import SettingsSelect from '../settings-select';
import SettingsToggle from '../settings-toggle';

export default function DisplaySettings() {
  const { settings, updateSection } = useSettings();

  return (
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900">
        Display Settings
      </h2>
      <p className="mt-1 text-sm leading-6 text-gray-500">
        Customize how text and errors are displayed during typing.
      </p>

      <div className="mt-6 border-t border-gray-200 divide-y divide-gray-200">
        {/* Error Feedback */}
        <div className="space-y-4 py-6">
          <h3 className="text-sm font-medium text-gray-900">Error Feedback</h3>

          <SettingsToggle
            enabled={settings.errorFeedback.enabled}
            onChange={enabled =>
              updateSection('errorFeedback', { enabled })}
            label="Show Error Feedback"
            description="Display detailed information about typing errors"
          />

          <SettingsSelect
            value={settings.errorFeedback.timing}
            onChange={timing =>
              updateSection('errorFeedback', { timing: timing as 'during' | 'after' })}
            options={[
              { value: 'during', label: 'During Typing' },
              { value: 'after', label: 'After Completion Only' },
            ]}
            label="When to Show Errors"
            description="Choose when error details are displayed"
          />

          <SettingsToggle
            enabled={settings.errorFeedback.expandByDefault}
            onChange={expandByDefault =>
              updateSection('errorFeedback', { expandByDefault })}
            label="Expand Errors by Default"
            description="Start with error details expanded instead of collapsed"
          />
        </div>

        {/* Text Display */}
        <div className="space-y-4 py-6">
          <h3 className="text-sm font-medium text-gray-900">Text Display</h3>

          <SettingsSelect
            value={settings.textDisplay.fontSize}
            onChange={fontSize =>
              updateSection('textDisplay', { fontSize: fontSize as any })}
            options={[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
              { value: 'xlarge', label: 'Extra Large' },
            ]}
            label="Text Size"
            description="Adjust the size of the typing text"
          />

          <SettingsToggle
            enabled={settings.textDisplay.highlightCurrentWord}
            onChange={highlightCurrentWord =>
              updateSection('textDisplay', { highlightCurrentWord })}
            label="Highlight Current Word"
            description="Highlight the word you're currently typing"
          />

          <SettingsToggle
            enabled={settings.textDisplay.showCursor}
            onChange={showCursor =>
              updateSection('textDisplay', { showCursor })}
            label="Show Cursor"
            description="Display animated cursor under current character"
          />

          <SettingsToggle
            enabled={settings.textDisplay.autoScroll}
            onChange={autoScroll =>
              updateSection('textDisplay', { autoScroll })}
            label="Auto Scroll"
            description="Automatically scroll to keep current position visible"
          />
        </div>
      </div>
    </div>
  );
}
