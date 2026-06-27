import { AdminDashboard } from './AdminDashboard';
import { AdminDashboardRuntimeTweaks } from './AdminDashboardRuntimeTweaks';

export function AdminDashboardWithTweaks() {
  return (
    <>
      <AdminDashboardRuntimeTweaks />
      <AdminDashboard />
    </>
  );
}
