import { getDriverBookings, getDriverTrips } from "@/lib/data";
import { AppShell } from "@/components/app-shell";
import { DriverDashboard } from "@/components/driver-dashboard";

export default async function DriverPage() {
  const [trips, bookings] = await Promise.all([
    getDriverTrips(),
    getDriverBookings(),
  ]);

  return (
    <AppShell>
      <DriverDashboard initialTrips={trips} bookings={bookings} />
    </AppShell>
  );
}
