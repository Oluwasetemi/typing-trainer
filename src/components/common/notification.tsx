import { Transition } from '@headlessui/react';
import { useEffect } from 'react';

import { Icons } from '../../utils/icons';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

type NotificationProps = {
  show: boolean;
  title: string;
  message?: string;
  type?: NotificationType;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
};

export default function Notification({
  show,
  title,
  message,
  type = 'success',
  onClose,
  autoClose = true,
  autoCloseDuration = 5000,
}: NotificationProps) {
  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [show, autoClose, autoCloseDuration, onClose]);

  const notificationStyles = {
    success: {
      icon: Icons.Check,
      iconColor: 'text-green-400',
    },
    error: {
      icon: Icons.Close,
      iconColor: 'text-red-400',
    },
    info: {
      icon: Icons.Eye,
      iconColor: 'text-blue-400',
    },
    warning: {
      icon: Icons.Target,
      iconColor: 'text-yellow-400',
    },
  };

  const style = notificationStyles[type];
  const IconComponent = style.icon;

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        <Transition show={show}>
          <div className="pointer-events-auto w-full max-w-sm rounded-lg bg-white shadow-lg outline-1 outline-black/5 transition data-closed:opacity-0 data-enter:transform data-enter:duration-300 data-enter:ease-out data-closed:data-enter:translate-y-2 data-leave:duration-100 data-leave:ease-in data-closed:data-enter:sm:translate-x-2 data-closed:data-enter:sm:translate-y-0 dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/10">
            <div className="p-4">
              <div className="flex items-start">
                <div className="shrink-0">
                  <IconComponent aria-hidden="true" className={`size-6 ${style.iconColor}`} />
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
                  {message && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {message}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-purple-600 dark:hover:text-white dark:focus:outline-purple-500"
                  >
                    <span className="sr-only">Close</span>
                    <Icons.CloseMenu aria-hidden="true" className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
}
