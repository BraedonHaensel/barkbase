import CreateBookingCard from '@/components/owner/dashboard/create-booking-card';
import ManageDogsCard from '@/components/owner/dashboard/manage-dogs-card';
import PreviousBookingsCard from '@/components/owner/dashboard/previous-bookings-card';
import UpcomingBookingsCard from '@/components/owner/dashboard/upcoming-bookings-card';

// Owner dashboard layout
const OwnerDashboard = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <CreateBookingCard />
      <ManageDogsCard />
      <UpcomingBookingsCard />
      <PreviousBookingsCard />
    </div>
  );
};

export default OwnerDashboard;
