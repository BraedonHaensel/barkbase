import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dateToAge(date: Date) {
  const now = new Date();

  const secondsDiff = (now.getTime() - date.getTime()) / 1000;
  const years = Math.floor(secondsDiff / 60 / 60 / 24 / 365);
  if (years > 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }
  const days = Math.floor(secondsDiff / 60 / 60 / 24);
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}
