import FindBookingsCard from '@/components/service-provider/dashboard/find-bookings-card';
import MyReviewsCard from '@/components/service-provider/dashboard/my-reviews-card';
import PreviousBookingsCard from '@/components/service-provider/dashboard/previous-bookings-card';
import UpcomingBookingsCard from '@/components/service-provider/dashboard/upcoming-bookings-card';

const ServiceProviderDashboard = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <FindBookingsCard />
      <MyReviewsCard />
      <UpcomingBookingsCard />
      <PreviousBookingsCard />
    </div>
  );
};

export default ServiceProviderDashboard;
