import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

import { Button } from '../button';
import { Icons } from '../../utils/icons';

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'info' | 'warning' | 'danger' | 'success';
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
}: ConfirmModalProps) {
  const variantStyles = {
    info: {
      bg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonColor: 'blue' as const,
      icon: Icons.Check,
    },
    success: {
      bg: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonColor: 'green' as const,
      icon: Icons.Check,
    },
    warning: {
      bg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonColor: 'yellow' as const,
      icon: Icons.Target,
    },
    danger: {
      bg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonColor: 'red' as const,
      icon: Icons.Close,
    },
  };

  const style = variantStyles[variant];
  const IconComponent = style.icon;

  return (
    <Dialog open={isOpen} onClose={onCancel} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div>
              <div className={`mx-auto flex size-12 items-center justify-center rounded-full ${style.bg}`}>
                <IconComponent aria-hidden="true" className={`size-6 ${style.iconColor}`} />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                  {title}
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <Button
                type="button"
                onClick={onConfirm}
                color={style.buttonColor}
                className="sm:col-start-2"
              >
                {confirmText}
              </Button>
              <Button
                type="button"
                onClick={onCancel}
                outline
                className="mt-3 sm:col-start-1 sm:mt-0"
              >
                {cancelText}
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
