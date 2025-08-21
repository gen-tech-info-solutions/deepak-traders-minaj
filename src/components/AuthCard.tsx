import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon, Loader2Icon, UserIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { authClient } from '@/lib/auth-client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const signInSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Minimum 6 characters'),
});

const signUpSchema = signInSchema.extend({
  name: z.string().min(2, 'Minimum 2 characters'),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

export function AuthDialog({
  open,
  onOpenChange,
  defaultTab = 'signin',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'signin' | 'signup';
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-sm'>
        <DialogHeader>
          <DialogTitle>Welcome</DialogTitle>
          <DialogDescription>
            {defaultTab === 'signin'
              ? 'Enter your credentials to continue.'
              : 'Create your account in seconds.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue={defaultTab}
          className='w-full'
          onValueChange={() => {
            /* keeps controlled state */
          }}
        >
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='signin'>Sign In</TabsTrigger>
            <TabsTrigger value='signup'>Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value='signin'>
            <SignInForm onSuccess={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value='signup'>
            <SignUpForm onSuccess={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export function AuthDialogTrigger({
  defaultTab = 'signin',
  children,
}: {
  defaultTab?: 'signin' | 'signup';
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant='ghost'
        size={children ? 'default' : 'icon'}
      >
        {children || <UserIcon className='size-5' />}
      </Button>
      <AuthDialog open={open} onOpenChange={setOpen} defaultTab={defaultTab} />
    </>
  );
}

function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const [show, setShow] = useState(false);

  async function onSubmit(values: SignInValues) {
    try {
      const data = await authClient.signIn.email(values);
      console.log('data auth', data);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type='email' autoComplete='email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    type={show ? 'text' : 'password'}
                    autoComplete='current-password'
                    {...field}
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 flex items-center px-2'
                    onClick={() => setShow(!show)}
                  >
                    {show ? (
                      <EyeOffIcon className='h-4 w-4' />
                    ) : (
                      <EyeIcon className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          disabled={form.formState.isSubmitting}
          className='w-full'
        >
          {form.formState.isSubmitting && (
            <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />
          )}
          Sign in
        </Button>
      </form>
    </Form>
  );
}

function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const [show, setShow] = useState(false);

  async function onSubmit(values: SignUpValues) {
    await authClient.signUp.email(
      {
        ...values,
      },
      {
        onSuccess: async () => {
          toast.success('Account created');
          onSuccess();
        },
        onError: async (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input autoComplete='name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type='email' autoComplete='email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    type={show ? 'text' : 'password'}
                    autoComplete='new-password'
                    {...field}
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 flex items-center px-2'
                    onClick={() => setShow(!show)}
                  >
                    {show ? (
                      <EyeOffIcon className='h-4 w-4' />
                    ) : (
                      <EyeIcon className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          disabled={form.formState.isSubmitting}
          className='w-full'
        >
          {form.formState.isSubmitting && (
            <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />
          )}
          Create account
        </Button>
      </form>
    </Form>
  );
}
