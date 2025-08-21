import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';
import { IndianRupee } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  className?: string;
  children?: React.ReactNode;
}


export function ProductCard({
  id,
  name,
  price,
  image,
  className,
  children,
}: ProductCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm',
        'transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-border',
        'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary',
        className,
      )}
    >

      {/* Image wrapper */}
      <div className='overflow-hidden rounded-t-2xl aspect-square bg-muted relative'>
        <Link
          to={`/products/${id}`}
          params={{ id }}
          className='block relative h-full w-full'
        >
          {!imgLoaded && (
            <Skeleton className='absolute inset-0 h-full w-full rounded-none pointer-events-none' />
          )}

          <img
            src={image}
            alt={name}
            loading='lazy'
            onLoad={() => setImgLoaded(true)}
            onError={() => console.error('Failed to load image:', image)}
            className={cn(
              'h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110',
              imgLoaded ? 'opacity-100' : 'opacity-0',
            )}
          />
        </Link>
      </div>

      {/* Content */}
      <div className='p-4 flex flex-col flex-1'>
        <h3 className='text-lg font-semibold leading-snug text-foreground line-clamp-2'>
          {name}
        </h3>

        <div className='flex items-center gap-1.5 mt-2 text-xl font-bold text-primary'>
          <IndianRupee size={18} strokeWidth={2.5} />
          <span>{price.toFixed(2)}</span>
        </div>
      </div>

      {/* Floating quick-add button (appears on hover) */}

        {children && (
          <div className='absolute bottom-3 right-3 mt-4 border-t pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
            {children}
          </div>
        )}
    </article>
  );
}

/* Skeleton parity */
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden',
        className,
      )}
    >
      <Skeleton className='aspect-square w-full' />
      <div className='p-4 space-y-3'>
        <Skeleton className='h-4 w-3/4 rounded-md' />
        <Skeleton className='h-5 w-2/5 rounded-md' />
        <Skeleton className='h-9 w-full rounded-lg mt-2' />
      </div>
    </div>
  );
}
