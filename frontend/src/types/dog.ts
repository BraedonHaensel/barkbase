import { DogSize } from '@/enums/dog-size';

// Dog data type
export interface Dog {
  name: string;
  birth_date: Date;
  size: DogSize;
  breeds: Array<string>;
}
