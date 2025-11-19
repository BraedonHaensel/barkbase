import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CreateAccountForm from '@/components/create-account-form';
import CenteredPageContainer from '@/components/centered-page-container';

// Create account page
export default function CreateAccountPage() {
  return (
    <CenteredPageContainer>
      <Card className="w-[450px] px-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateAccountForm />
        </CardContent>
      </Card>
    </CenteredPageContainer>
  );
}
