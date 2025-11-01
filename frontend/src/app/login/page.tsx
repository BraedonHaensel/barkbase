import LoginForm from '@/components/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            🐶 Welcome to BarkBase! 🐶
          </CardTitle>
        </CardHeader>
        <CardDescription className="text-foreground px-6 text-center text-lg">
          BarkBase is a brand new platform for dog walking and sitting services!
          Log in below to get started!
        </CardDescription>
        <CardContent className="flex flex-col items-center gap-2">
          <div className="w-full px-6">
            <LoginForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
