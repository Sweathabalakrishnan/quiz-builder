const DASHBOARD_SESSION_KEY = 'quiz-builder-dashboard-access';

export const getDashboardPasscode = () => {
  return import.meta.env.VITE_DASHBOARD_PASSCODE?.trim() || '';
};

export const isDashboardProtectionEnabled = () => {
  return getDashboardPasscode().length > 0;
};

export const hasDashboardAccess = () => {
  if (!isDashboardProtectionEnabled()) {
    return true;
  }

  return sessionStorage.getItem(DASHBOARD_SESSION_KEY) === 'granted';
};

export const grantDashboardAccess = () => {
  sessionStorage.setItem(DASHBOARD_SESSION_KEY, 'granted');
};

export const clearDashboardAccess = () => {
  sessionStorage.removeItem(DASHBOARD_SESSION_KEY);
};
