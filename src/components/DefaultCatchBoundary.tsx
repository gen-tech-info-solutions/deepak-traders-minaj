import { ErrorComponentProps } from '@tanstack/react-router';
import { AlertTriangle, RotateCcw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter, Link, rootRouteId, useMatch } from '@tanstack/react-router';

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (s) => s.id === rootRouteId,
  });

  return (
    <div className='flex min-h-screen w-full items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-destructive/10'>
            <AlertTriangle className='h-8 w-8 text-destructive' />
          </div>
          <CardTitle className='text-xl'>Something went wrong</CardTitle>
          <CardDescription className='mt-2'>
            An unexpected error occurred on our end.
          </CardDescription>
        </CardHeader>

        {import.meta.env.DEV && (
          <CardContent>
            <details className='text-xs'>
              <summary className='cursor-pointer font-medium'>
                Technical details
              </summary>
              <pre className='mt-2 max-h-32 overflow-auto rounded-sm bg-muted p-2 text-muted-foreground'>
                {error.message}
              </pre>
            </details>
          </CardContent>
        )}

        <CardFooter className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-center'>
          <Button variant='outline' onClick={() => router.invalidate()}>
            <RotateCcw className='mr-2 h-4 w-4' />
            Try again
          </Button>

          {isRoot ? (
            <Button asChild>
              <Link to='/'>
                <Home className='mr-2 h-4 w-4' />
                Home
              </Link>
            </Button>
          ) : (
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Go back
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
