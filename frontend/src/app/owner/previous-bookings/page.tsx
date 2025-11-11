'use client';

import OUpcomingBookingCard from '@/components/owner/upcoming-booking-card';
import OwnerUpcomingBookingCard from '@/components/owner/upcoming-booking-card';
import { SessionContext } from '@/context/session-context';
import { AccountType } from '@/enums/account-type';
import { Province } from '@/enums/province';
import { ServiceType } from '@/enums/service-type';
import { OUpcomingBooking } from '@/types/booking';
import { redirect } from 'next/navigation';
import { useContext, useEffect } from 'react';

// Upcoming bookings page
export default function PreviousBookingsPage() {
  const { session } = useContext(SessionContext);

  // A session is required
  useEffect(() => {
    if (!session || session.accountType !== AccountType.OWNER) {
      redirect('/login');
    }
  }, [session]);

  // TODO temporary booking, using the same layout as upcoming bookings for now...
  const bk1: OUpcomingBooking = {
    dogNames: ['Chico', 'Bear'],
    startDate: new Date(),
    startTime: '12:00',
    endDate: new Date(),
    endTime: '13:00',
    serviceType: ServiceType.WALKING,
    street: '234 Mt Norquay Pl SE',
    city: 'Calgary',
    province: Province.AB,
    price: '240',
    note: `Chico is a barker and likes to chase after squirrels.
Please keep him on a tight leash!
`,
  };

  const bookings = [bk1];

  return (
    <div className="flex flex-col gap-4">
      {/* Page title */}
      <p style={{ fontSize: '35px' }} className="text-center font-bold">
        Previous Bookings
      </p>
      <div
        className={
          bookings.length == 1
            ? 'mx-auto w-1/2'
            : 'grid min-w-[400px] gap-6 md:grid-cols-2'
        }
      >
        {/* Render a card for each upcoming booking */}
        {bookings.map((booking, id) => (
          <OUpcomingBookingCard key={id} booking={booking} />
        ))}
      </div>
    </div>
  );
}
