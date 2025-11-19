import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

// Container to center its contents within the page
const CenteredPageContainer = ({ children, className = '' }: Props) => {
  // The height of this parent div is calculated as "<screen height> - <2 * header height> - <body padding>",
  // resulting in a container that will be evenly centered in the middle of the screen
  return (
    <div
      className={`flex min-h-[calc(100vh-140px-64px)] items-center justify-center ${className}`}
    >
      {children}
    </div>
  );
};

export default CenteredPageContainer;
