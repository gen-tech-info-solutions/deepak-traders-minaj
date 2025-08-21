import { api } from '@/_generated/api';
import { AddToCart } from '@/components/AddToCartButton';
import { ProductCard } from '@/components/ProductCard';
import { convexQuery } from '@convex-dev/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: async ({ context }) =>
    await context.queryClient.ensureQueryData(
      convexQuery(api.categories.listCategoriesWithPreview, {}),
    ),
});

import hero from '../assets/hero1.jpg';

function HomePage() {
  const categories = Route.useLoaderData();

  return (
    <>
      <div className='lg:h-[70vh] h-[45vh]'>
        <img src={hero} className='w-full h-full' />
      </div>

      <div className='px-6 py-8 max-w-7xl mx-auto'>
        {/* Optional Banner Area */}
        <div className='mb-8'>
          {/* You can insert a banner or hero image here */}
        </div>

        {categories.length === 0 ? (
          <p className='text-center text-muted-foreground'>
            No categories available.
          </p>
        ) : (
          categories.map((cat) => (
            <section key={cat._id} className='mb-10'>
              <header className='mb-4 flex items-center justify-between'>
                <h2 className='text-2xl font-bold text-foreground'>
                  {cat.name}
                </h2>
                <Link
                  to='/shop/$category'
                  params={{ category: cat.name }}
                  className='text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors'
                >
                  View All
                </Link>
              </header>

              {cat.previews.length > 0 ? (
                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8'>
                  {cat.previews.map((p) => (
                    <ProductCard
                      key={p._id}
                      id={p._id}
                      image={p.image ?? ''}
                      name={p.name}
                      price={p.price}
                    >
                      <AddToCart id={p._id} />
                    </ProductCard>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground'>No products found.</p>
              )}
            </section>
          ))
        )}
      </div>
    </>
  );
}
