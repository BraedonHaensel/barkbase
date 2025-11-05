import CreateBookingCard from '@/components/owner/create-booking-card';
import ManageDogsCard from '@/components/owner/manage-dogs-card';
import PreviousBookingsCard from '@/components/owner/previous-bookings-card';
import UpcomingBookingsCard from '@/components/owner/upcoming-bookings-card';

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
