import { useState } from 'react';
import { Layout } from './Layout';
import { DashboardAccess } from '../pages/DashboardAccess';
import { hasDashboardAccess, isDashboardProtectionEnabled } from '../utils/dashboard-access';

export function OwnerLayout() {
  const [isUnlocked, setIsUnlocked] = useState(() => hasDashboardAccess());

  if (isDashboardProtectionEnabled() && !isUnlocked) {
    return <DashboardAccess onUnlock={() => setIsUnlocked(true)} />;
  }

  return <Layout />;
}
