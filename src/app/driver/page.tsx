import { getDriverBookings, getDriverTrips } from "@/lib/data";
import { requireRole } from "@/lib/session";
import { AppShell } from "@/components/app-shell";
import { DriverDashboard } from "@/components/driver-dashboard";

export default async function DriverPage() {
  // Middleware already gates this route; requireRole gives us the session user.
  const session = await requireRole("DRIVER", "/driver");
  const [trips, bookings] = await Promise.all([
    getDriverTrips(session.userId),
    getDriverBookings(session.userId),
  ]);

  return (
    <AppShell>
      <DriverDashboard initialTrips={trips} bookings={bookings} />
    </AppShell>
  );
}
