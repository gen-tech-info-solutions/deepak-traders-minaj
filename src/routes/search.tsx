import { api } from '@/_generated/api';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { convexQuery } from '@convex-dev/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { Search } from 'lucide-react';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().default(''),
});

export const Route = createFileRoute('/search')({
  validateSearch: zodValidator(searchSchema),
  component: SearchPage,
});

function SearchPage() {
  const { q } = useSearch({ from: Route.id });
  const navigate = useNavigate({ from: Route.fullPath });

  const { data, isFetching } = useSuspenseQuery(
    convexQuery(api.products.searchProducts, {
      searchTerm: q.trim(),
      paginationOpts: { numItems: 50, cursor: null },
    }),
  );

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      {q.trim() === '' && (
        <div className='text-center text-muted-foreground'>
          <Search size={48} className='mx-auto mb-2' />
          <p>Start typing to search.</p>
        </div>
      )}

      {isFetching && (
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5'>
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isFetching && data?.page.length === 0 && (
        <div className='text-center text-muted-foreground'>
          <p>No results for “{q}”.</p>
          <Button
            variant='link'
            onClick={() => navigate({ search: { q: '' } })}
          >
            Clear search
          </Button>
        </div>
      )}

      {!isFetching && data?.page.length ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5'>
          {data.page.map((p) => (
            <ProductCard
              key={p._id}
              id={p._id}
              name={p.name}
              price={p.price}
              image={p.image ?? ''}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
