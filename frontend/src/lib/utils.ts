import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ShadCN and Tailwind CSS classname handler
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get an age from a given birth date in years or days
export function dateToAge(dateUtc: Date) {
  const now = new Date();

  // Convert milliseconds difference between the date and now into a number of years
  const secondsDiff = (now.getTime() - dateUtc.getTime()) / 1000;
  const years = Math.floor(secondsDiff / 60 / 60 / 24 / 365);

  // Display the age as years if it is at least 1 year old
  if (years > 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }

  // Convert the milliseconds difference into a number of days
  const days = Math.floor(secondsDiff / 60 / 60 / 24);
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

// Get an ISO string for a date with only the YYYY-MM-DD for the current day of the local timezone
export function dateToLocalYMD(date: Date) {
  return date.toLocaleDateString('en-CA');
}

// Get the YYYY-MM-DD component from an ISO string
export function getYMDFromIsoString(date: string) {
  return new Date(date).toLocaleDateString();
}

// Get the HH:MM component from an ISO string
export function getHMFromIsoString(date: string) {
  return date.split('T')[1].substring(0, 5);
}
