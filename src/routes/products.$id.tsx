import { api } from '@/_generated/api';
import { Id } from '@/_generated/dataModel';
import { AddToCart } from '@/components/AddToCartButton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound, Link } from '@tanstack/react-router';
import { ChevronLeft, IndianRupeeIcon } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/products/$id')({
  loader: async ({ params: { id }, context }) => {
    const product = await context.queryClient.ensureQueryData(
      convexQuery(api.products.getById, { id: id as Id<'products'> }),
    );
    if (!product) throw notFound();
    return product;
  },
  component: ProductPage,
  pendingComponent: ProductSkeleton,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data: p } = useSuspenseQuery(
    convexQuery(api.products.getById, { id: id as Id<'products'> }),
  );

  const [qty, setQty] = useState(1);

  if (!p) throw notFound();

  return (
    <>
      {/* Breadcrumbs */}
      <nav className='max-w-7xl mx-auto px-4 py-3 text-sm'>
        <Link
          to='/'
          className='flex items-center gap-1 text-muted-foreground hover:text-primary transition'
        >
          <ChevronLeft size={16} /> Back to shop
        </Link>
      </nav>

      <div className='max-w-7xl mx-auto px-4 pb-24 grid grid-cols-1 lg:grid-cols-5 gap-8'>
        {/* Left: Gallery */}
        <div className='lg:col-span-3'>
          <div className='size-72 rounded-2xl overflow-hidden bg-muted'>
            <img
              src={p.image ?? ''}
              alt={p.name}
              className='w-full h-full object-cover'
            />
          </div>
        </div>

        {/* Right: Details */}
        <div className='lg:col-span-2 flex flex-col'>
          <h1 className='text-3xl md:text-4xl font-bold tracking-tight'>
            {p.name}
          </h1>

          <div className='flex items-center gap-2 mt-2'>
            <span className='inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary'>
              In Stock
            </span>
          </div>

          <p className='text-3xl font-bold text-primary items-center mt-4 flex gap-1'>
            <IndianRupeeIcon />
            {p.price.toFixed(2)}
          </p>

          <Separator className='my-6' />

          {/* Quantity selector */}
          <div className='flex items-center gap-4 mb-6'>
            <span className='text-sm font-medium'>Quantity</span>
            <div className='flex items-center border rounded-md'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                −
              </Button>
              <span className='px-4 font-semibold min-w-[2rem] text-center'>
                {qty}
              </span>
              <Button variant='ghost' size='sm' onClick={() => setQty(qty + 1)}>
                +
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className='space-y-3'>
            <AddToCart id={p._id} qty={qty} />
          </div>
        </div>
      </div>
    </>
  );
}

/* Skeleton while pending */
function ProductSkeleton() {
  return (
    <div className='max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8'>
      <div className='lg:col-span-3'>
        <Skeleton className='aspect-square rounded-2xl' />
        <Skeleton className='h-16 w-full mt-4 rounded-md' />
      </div>
      <div className='lg:col-span-2 space-y-6'>
        <Skeleton className='h-10 w-3/4' />
        <Skeleton className='h-8 w-1/3' />
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-12 w-full' />
      </div>
    </div>
  );
}
