// src/routes/orders.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@/_generated/api';
import { format } from 'date-fns';
import { IndianRupee } from 'lucide-react';
import { Id } from '@/_generated/dataModel';

export const Route = createFileRoute('/orders')({
  beforeLoad: async ({ context }) => {
    if (!context.userId) throw redirect({ to: '/' });
  },
  loader: async ({ context }) =>
    context.queryClient.ensureQueryData(
      convexQuery(api.orders.listUserOrders, {
        userId: context.userId as Id<'users'>,
      }),
    ),
  component: OrdersPage,
});

function OrdersPage() {
  const { userId } = Route.useRouteContext();
  const { data: orders } = useSuspenseQuery(
    convexQuery(api.orders.listUserOrders, { userId: userId as Id<'users'> }),
  );

  if (!orders.length) {
    return (
      <div className='max-w-4xl mx-auto px-4 py-16 text-center'>
        <h1 className='text-2xl font-bold mb-2'>No orders yet</h1>
        <p className='text-muted-foreground'>
          <a href='/' className='underline'>
            Continue shopping
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto px-4 py-8 space-y-10'>
      <h1 className='text-3xl font-bold'>Your Orders</h1>

      {orders.map((order) => (
        <div key={order._id} className='border rounded-xl p-4 space-y-4'>
          {/* Header */}
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-sm text-muted-foreground'>
                Ordered on {format(new Date(order.createdAt), 'dd MMM yyyy')}
              </p>
              <p className='font-semibold'>
                Order #
                <span className='text-primary'>
                  {order._id.toString().slice(-8)}
                </span>
              </p>
            </div>
            <span
              className={`px-2 py-1 text-xs rounded-full font-medium
                ${order.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${order.status === 'failed' ? 'bg-red-100 text-red-800' : ''}`}
            >
              {order.status}
            </span>
          </div>

          {/* Line items */}
          <div className='space-y-3'>
            {order.items.map((item) => (
              <div key={item._id} className='flex gap-3'>
                <img
                  src={item.image ?? ''}
                  alt={item.name}
                  className='w-16 h-16 rounded-md object-cover'
                />
                <div className='flex-1'>
                  <p className='font-medium'>{item.name}</p>
                  <p className='text-sm text-muted-foreground'>
                    Qty: {item.quantity}
                  </p>
                  <p className='text-sm font-semibold'>
                    <IndianRupee size={14} className='inline' />
                    {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className='border-t pt-3 flex justify-between items-center'>
            <span className='text-sm text-muted-foreground'>Total</span>
            <span className='text-lg font-bold'>
              <IndianRupee size={16} className='inline' />
              {order.amount.toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
