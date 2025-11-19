export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Passthrough layout to preserve existing dashboard UI.
  // We keep the route group structure but do not impose a new shell.
  return <>{children}</>; 
}
