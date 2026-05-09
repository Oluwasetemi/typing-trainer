import { useCallback, useState } from 'react';

import type { NotificationType } from '../components/common/notification';

type NotificationConfig = {
  title: string;
  message?: string;
  type?: NotificationType;
  autoClose?: boolean;
  autoCloseDuration?: number;
};

export function useNotification() {
  const [notification, setNotification] = useState<NotificationConfig & { show: boolean }>({
    show: false,
    title: '',
    message: '',
    type: 'success',
  });

  const showNotification = useCallback((config: NotificationConfig) => {
    setNotification({
      show: true,
      ...config,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }));
  }, []);

  const showSuccess = useCallback((title: string, message?: string) => {
    showNotification({ title, message, type: 'success' });
  }, [showNotification]);

  const showError = useCallback((title: string, message?: string) => {
    showNotification({ title, message, type: 'error' });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message?: string) => {
    showNotification({ title, message, type: 'info' });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message?: string) => {
    showNotification({ title, message, type: 'warning' });
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}
