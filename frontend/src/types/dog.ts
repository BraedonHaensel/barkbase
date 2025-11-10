import { DogSize } from '@/enums/dog-size';

export interface Dog {
  name: string;
  date: Date;
  size: DogSize;
  breeds: string;
}
