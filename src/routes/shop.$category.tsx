import { api } from '@/_generated/api';
import { AddToCart } from '@/components/AddToCartButton';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';

export const Route = createFileRoute('/shop/$category')({
  loader: async ({ params: { category }, context }) => {
    const products = await context.queryClient.ensureQueryData(
      convexQuery(api.products.getByCategory, { categoryName: category }),
    );
    if (!products?.length) throw notFound();
    return products;
  },
  component: RouteComponent,
  pendingComponent: CategorySkeleton,
});

function RouteComponent() {
  const { category } = Route.useParams();
  const { data: products } = useSuspenseQuery(
    convexQuery(api.products.getByCategory, { categoryName: category }),
  );

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold capitalize mb-6'>{category}</h1>

      {products.length === 0 ? (
        <p className='text-muted-foreground'>No products found.</p>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5'>
          {products.map((p) => (
            <ProductCard
              key={p._id}
              id={p._id}
              name={p.name}
              price={p.price}
              image={p.image ?? ''}
            >
              <AddToCart id={p._id} />
            </ProductCard>
          ))}
        </div>
      )}
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <Skeleton className='h-8 w-40 mb-6' />
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5'>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
