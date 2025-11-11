import { DogSize } from '@/enums/dog-size';

// Dog data type
export interface Dog {
  name: string;
  date: Date;
  size: DogSize;
  breeds: string;
}
