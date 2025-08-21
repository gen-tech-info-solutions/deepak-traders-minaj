import { useMemo, useCallback } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react';
import { Home, Search, ShoppingBag, User, Loader2Icon } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { AuthDialogTrigger } from './AuthCard';
import { ProfilePopover } from './ProfileDropdown';
import { cn } from '@/lib/utils';
import React from 'react';

import logo from '../assets/dt_logo.png'

// Separate Search Component - this will re-render independently
const SearchInput = React.memo(() => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');

  const handleSearch = useCallback(() => {
    const query = search.trim();
    if (query) {
      navigate({ to: '/search', search: { q: query } });
      setSearch('');
    }
  }, [search, navigate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    [],
  );

  return (
    <div className='flex-1 max-w-sm mx-6'>
      <div className='relative'>
        <input
          type='search'
          placeholder='Search products…'
          value={search}
          aria-label='Search products'
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10'
          autoComplete='off'
        />
        <Button
          variant='ghost'
          size='sm'
          className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0'
          onClick={handleSearch}
          disabled={!search.trim()}
          aria-label='Search'
          type='button'
        >
          <Search size={16} />
        </Button>
      </div>
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

// Separate Cart Badge Component
const CartBadge = React.memo(
  ({ totalItemCount }: { totalItemCount: number }) =>
    totalItemCount > 0 ? (
      <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]'>
        {totalItemCount > 99 ? '99+' : totalItemCount}
      </span>
    ) : null,
);

CartBadge.displayName = 'CartBadge';

// Separate Mobile Search Component
const MobileSearch = React.memo(() => {
  const navigate = useNavigate();

  const openMobileSearch = useCallback(() => {
    const q = window.prompt('Search products…');
    if (q?.trim()) {
      navigate({ to: '/search', search: { q: q.trim() } });
    }
  }, [navigate]);

  return (
    <button
      onClick={openMobileSearch}
      className='flex flex-col items-center gap-0.5 hover:text-foreground transition-colors'
      aria-label='Search products'
      type='button'
    >
      <Search size={20} />
      <span>Search</span>
    </button>
  );
});

MobileSearch.displayName = 'MobileSearch';

// Auth Section Component
const AuthSection = React.memo(() => (
  <>
    <AuthLoading>
      <Button variant='ghost' size='icon' disabled>
        <Loader2Icon className='size-6 animate-spin' />
        <span className='sr-only'>Loading authentication</span>
      </Button>
    </AuthLoading>

    <Unauthenticated>
      <AuthDialogTrigger />
    </Unauthenticated>

    <Authenticated>
      <ProfilePopover />
    </Authenticated>
  </>
));

AuthSection.displayName = 'AuthSection';

// Mobile Auth Section Component
const MobileAuthSection = React.memo(() => (
  <>
    <AuthLoading>
      <div className='flex flex-col items-center gap-0.5'>
        <Loader2Icon className='size-5 animate-spin' />
        <span>Auth</span>
        <span className='sr-only'>Loading authentication</span>
      </div>
    </AuthLoading>

    <Unauthenticated>
      <div className='flex flex-col items-center gap-0.5'>
        <AuthDialogTrigger>
          <User size={20} />
          <span>Login</span>
        </AuthDialogTrigger>
      </div>
    </Unauthenticated>

    <Authenticated>
      <Link
        to='/'
        className='flex flex-col items-center gap-0.5 hover:text-foreground transition-colors'
        aria-label='Profile'
      >
        <User size={20} />
        <span>Profile</span>
      </Link>
    </Authenticated>
  </>
));

MobileAuthSection.displayName = 'MobileAuthSection';

// Main Header Component - now only re-renders when cart items change
const HeaderComponent = () => {
  const { items } = useCart();

  const totalItemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items],
  );

  // Desktop Header - memoized and won't re-render unless totalItemCount changes
  const DesktopHeader = useMemo(
    () => (
  <header
  className={cn(
    'hidden md:block sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60',
  )}
>
  <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:py-4'>
    <div className='flex items-center justify-between h-16'>
      <Link to='/' className='flex items-center h-16'>
        <img src={logo} className='h-20 w-auto' />
      </Link>

      <SearchInput />

      <div className='flex items-center gap-2'>
        <Button variant='ghost' className='relative' asChild>
          <Link
            to='/cart'
            aria-label={`Cart with ${totalItemCount} items`}
          >
            <ShoppingBag size={20} />
            <CartBadge totalItemCount={totalItemCount} />
          </Link>
        </Button>

        <AuthSection />
      </div>
    </div>
  </div>
</header>

    ),
    [totalItemCount],
  );

  // Mobile Navigation - memoized and won't re-render unless totalItemCount changes
  const MobileBottomNav = useMemo(
    () => (
      <nav
        className='md:hidden fixed bottom-0 left-0 right-0 h-16 z-50 border-t bg-background/90 backdrop-blur-lg'
        role='navigation'
        aria-label='Mobile navigation'
      >
        <div className='grid grid-cols-4 h-full items-center text-xs font-medium text-muted-foreground'>
          <Link
            to='/'
            className='flex flex-col items-center gap-0.5 hover:text-foreground transition-colors'
            aria-label='Home'
          >
            <Home size={20} />
            <span>Home</span>
          </Link>

          <MobileSearch />

          <Link
            to='/cart'
            className='relative flex flex-col items-center gap-0.5 hover:text-foreground transition-colors'
            aria-label={`Cart with ${totalItemCount} items`}
          >
            <ShoppingBag size={20} />
            <span>Cart</span>
            <CartBadge totalItemCount={totalItemCount} />
          </Link>

          <MobileAuthSection />
        </div>
      </nav>
    ),
    [totalItemCount],
  );

  return (
    <>
      {DesktopHeader}
      {MobileBottomNav}
      <div className='pb-20 md:pb-0' />
    </>
  );
};

export const Header = React.memo(HeaderComponent);
