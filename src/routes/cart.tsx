// src/routes/cart.tsx
import { api } from '@/_generated/api';
import { Id } from '@/_generated/dataModel';
import { AuthDialogTrigger } from '@/components/AuthCard';
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
import { useCart } from '@/hooks/useCart';
import { useRazorpay } from '@/hooks/useRazorpay';
import { convexQuery } from '@convex-dev/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Authenticated, Unauthenticated } from 'convex/react';
import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const Route = createFileRoute('/cart')({
  component: RouteComponent,
});

/* ----------  cart row type ---------- */
type CartRow = {
  _id: Id<'products'>;
  name: string;
  price: number;
  image: string;
  qty: number;
};

/* ----------  address schema ---------- */
const addressSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.email('Invalid email'),
  phone: z.string().min(10, 'At least 10 digits'),
  address: z.string().min(5, 'Required'),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  zip: z.string().min(5, 'Required'),
});
type Address = z.infer<typeof addressSchema>;

function RouteComponent() {
  const { items, changeQty, removeItem } = useCart();
  const [open, setOpen] = useState(false);
  const { openCheckout } = useRazorpay();

  /* ----------  product data ---------- */
  const productIds = items.map((i) => i.productId);
  const products = useQuery({
    ...convexQuery(api.products.getByIds, { ids: productIds }),
    enabled: productIds.length > 0,
  });

  const rows: CartRow[] = items
    .map((i) => {
      const p = products.data?.find((p) => p?._id === i.productId);
      return p ? { ...p, qty: i.qty } : null;
    })
    .filter((r): r is CartRow => Boolean(r));

  const total = rows.reduce((sum, r) => sum + r.price * r.qty, 0);

  /* ----------  form ---------- */
  const form = useForm<Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
    },
  });

  const onSubmit = (values: Address) => {
    openCheckout(
      items.map((i) => ({ productId: i.productId, qty: i.qty })),
      values,
    );
    setOpen(false);
    form.reset();
  };

  /* ----------  UI ---------- */
  return (
    <div className='max-w-7xl mx-auto p-4 md:p-8 grid md:grid-cols-3 gap-8'>
      {/* main list */}
      <main className='md:col-span-2'>
        <h1 className='text-3xl font-bold mb-6'>Your Cart</h1>

        {rows.length === 0 ? (
          <p className='text-muted-foreground'>
            Empty cart.{' '}
            <Link to='/' className='underline'>
              Continue shopping
            </Link>
          </p>
        ) : (
          <div className='space-y-4'>
            {rows.map((row) => (
              <div
                key={row._id}
                className='flex flex-col sm:flex-row gap-4 border p-4 rounded'
              >
                <img
                  src={row.image}
                  alt={row.name}
                  className='h-20 w-20 object-cover rounded mx-auto sm:mx-0'
                />
                <div className='flex-1 text-center sm:text-left'>
                  <p className='font-semibold'>{row.name}</p>
                  <p className='text-sm text-muted-foreground'>
                    ₹{row.price.toFixed(2)}
                  </p>
                </div>

                <div className='flex items-center gap-2 justify-center sm:justify-start'>
                  <Input
                    type='number'
                    min={1}
                    className='w-20 text-center'
                    value={row.qty}
                    onChange={(e) =>
                      changeQty(
                        row._id,
                        Math.max(1, parseInt(e.target.value, 10) || 1),
                      )
                    }
                  />
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => removeItem(row._id)}
                  >
                    <Trash2Icon className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* sidebar */}
      <aside className='md:col-span-1 md:sticky md:top-8 h-fit bg-white border rounded p-6 space-y-4'>
        <h2 className='text-2xl font-bold'>Summary</h2>
        <p className='text-3xl font-semibold'>₹{total.toFixed(2)}</p>
        <Authenticated>
          <Button
            onClick={() => setOpen(true)}
            className='w-full'
            disabled={rows.length === 0}
          >
            Checkout
          </Button>
        </Authenticated>
        <Unauthenticated>
          <AuthDialogTrigger defaultTab='signin'>Log In</AuthDialogTrigger>
        </Unauthenticated>
      </aside>

      {/* address dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Delivery Address</DialogTitle>
            <DialogDescription>
              Please fill in your details to complete the order.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder='John Doe' {...field} />
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
                      <Input
                        type='email'
                        placeholder='john@example.com'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type='tel' placeholder='9876543210' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder='123 Street, City' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder='Mumbai' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='state'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder='Maharashtra' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='zip'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP</FormLabel>
                    <FormControl>
                      <Input placeholder='400001' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' className='w-full'>
                Pay ₹{total.toFixed(2)}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
