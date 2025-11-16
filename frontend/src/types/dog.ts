import { DogSize } from '@/enums/dog-size';

// Dog data type
export interface Dog {
  name: string;
  birthDate: Date;
  size: DogSize;
  imageUrl: string;
  breeds: Array<string>;
}
