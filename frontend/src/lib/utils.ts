import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ShadCN and Tailwind CSS classname handler
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get an age from a given birth date in years or days
export function dateToAge(date: Date) {
  const now = new Date();

  // Convert milliseconds difference between the date and now into a number of years
  const secondsDiff = (now.getTime() - date.getTime()) / 1000;
  const years = Math.floor(secondsDiff / 60 / 60 / 24 / 365);

  // Display the age as years if it is at least 1 year old
  if (years > 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }

  // Convert the milliseconds difference into a number of days
  const days = Math.floor(secondsDiff / 60 / 60 / 24);
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}
