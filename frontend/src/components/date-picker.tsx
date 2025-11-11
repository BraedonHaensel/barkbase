// CITATION This component is based on:
// * Shadcn. (n.d.). Date picker. Shadcn/Ui. Retrieved November 3, 2025, from https://ui.shadcn.com/docs/components/date-picker

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from './ui/button';
import { ChevronDown } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
  value: Date;
  onChange: any;
  blockPast?: boolean;
  blockFuture?: boolean;
};

const DatePicker = ({
  value,
  onChange,
  blockPast = false,
  blockFuture = false,
}: Props) => {
  const [open, setOpen] = useState(false);

  const todayDate = new Date();
  const startOfToday = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth(),
    todayDate.getDate()
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date"
          className="w-48 justify-between font-normal"
        >
          {value ? value.toLocaleDateString() : 'Select date'}
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          captionLayout="dropdown"
          onSelect={(date) => {
            if (date) {
              // Block invalid dates
              if (blockPast && date < startOfToday) {
                toast.error("Date can't be in the past!");
              } else if (blockFuture && date > todayDate) {
                toast.error("Date can't be in the future!");
              } else {
                onChange(date);
                setOpen(false);
              }
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
