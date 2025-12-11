type SettingsToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
};

export default function SettingsToggle({
  enabled,
  onChange,
  label,
  description,
}: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-900 dark:text-settingsHeadingDark">
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
          enabled ? 'bg-indigo-600' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
