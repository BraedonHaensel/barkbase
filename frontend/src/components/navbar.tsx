import HomeButton from '@/components/home-button';
import ProvileNav from '@/components/profile-nav';

const Navbar = () => {
  return (
    <div className="flex h-full items-center justify-between gap-3">
      <div>
        <HomeButton />
      </div>

      <div className="aspect-square h-full">
        <ProvileNav
          user={{
            email: 'email@example.com',
            firstName: 'John',
            lastName: 'Doe',
          }}
        />
      </div>
    </div>
  );
};

export default Navbar;
