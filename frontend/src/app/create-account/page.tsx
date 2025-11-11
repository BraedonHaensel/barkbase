import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CreateAccountForm from '@/components/create-account-form';

// Create account page
export default function CreateAccountPage() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <Card className="w-[450px] px-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateAccountForm />
        </CardContent>
      </Card>
    </div>
  );
}
