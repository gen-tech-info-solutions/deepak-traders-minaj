import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from '@tanstack/react-router';
import { Home, Search } from 'lucide-react';

export function NotFound() {
  return (
    <div className='flex min-h-screen w-full items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-muted'>
            <Search className='h-8 w-8 text-muted-foreground' />
          </div>
          <CardTitle className='text-2xl'>404 – Page Not Found</CardTitle>
          <CardDescription>
            We couldn’t find the page you’re looking for.
          </CardDescription>
        </CardHeader>
        <CardFooter className='justify-center'>
          <Button asChild>
            <Link to='/'>
              <Home className='mr-2 h-4 w-4' />
              Go home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
