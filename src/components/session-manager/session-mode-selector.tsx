import { Icons } from '../../utils/icons';

type SessionModeSelectorProps = {
  onSelectMode: (mode: 'session' | 'solo' | 'competition') => void;
};

export default function SessionModeSelector({
  onSelectMode,
}: SessionModeSelectorProps) {
  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Choose Your Mode
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select how you'd like to practice typing today
        </p>
      </header>

      <div className="space-y-4">
        {/* Session Mode */}
        <button
          type="button"
          onClick={() => onSelectMode('session')}
          className="w-full p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icons.Eye className="text-white" size={24} />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Real-time Session Mode
              </h2>
              <p className="text-blue-600 dark:text-blue-400 text-sm">
                Create a typing session or watch someone else type in real-time
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-full">
                  Live Spectators
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-full">
                  Share Sessions
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Icons.Add className="text-blue-400 dark:text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" size={24} />
            </div>
          </div>
        </button>

        {/* Solo Practice */}
        <button
          type="button"
          onClick={() => onSelectMode('solo')}
          className="w-full p-6 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-zinc-900 dark:to-zinc-800 rounded-lg border-2 border-gray-200 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-600 transition-all text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-500 dark:bg-zinc-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icons.Person className="text-white" size={24} />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Solo Practice
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Practice typing on your own without real-time features
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-full">
                  Offline Mode
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-full">
                  No Distractions
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Icons.Add className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400" size={24} />
            </div>
          </div>
        </button>

        {/* Competition Mode */}
        <button
          type="button"
          onClick={() => onSelectMode('competition')}
          className="w-full p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 transition-all text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icons.Flag className="text-white" size={24} />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-orange-800 dark:text-orange-300 mb-2">
                Competition Mode
              </h2>
              <p className="text-orange-600 dark:text-orange-400 text-sm">
                Race against friends in real-time typing competitions
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 rounded-full">
                  Multiplayer
                </span>
                <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 rounded-full">
                  Leaderboards
                </span>
                <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 rounded-full">
                  Live Racing
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Icons.Add className="text-orange-400 dark:text-orange-500 group-hover:text-orange-600 dark:group-hover:text-orange-400" size={24} />
            </div>
          </div>
        </button>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
        <p className="text-sm text-purple-800 dark:text-purple-300 text-center">
          <Icons.Target size={16} className="inline mr-1" />
          Choose your practice mode and start improving your typing skills today!
        </p>
      </div>
    </div>
  );
}
