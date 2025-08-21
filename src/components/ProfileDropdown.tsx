import { Button } from '@/components/ui/button';
import { useUserInfo } from '@/hooks/useUserInfo';
import { Link } from '@tanstack/react-router';
import { LogOut, MoonIcon, Package, SunIcon, User } from 'lucide-react';
import { useTheme } from './theme-provider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';

export function ProfilePopover() {
  const { clearCache, user } = useUserInfo();
  const { theme, setTheme } = useTheme();

  if (!user) return null; // or loading state

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full'
          aria-label='User profile'
        >
          <Avatar className='h-8 w-8'>
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>

      <PopoverContent align='end' className='w-64 p-0'>
        {/* Header */}
        <div className='p-4'>
          <p className='font-semibold'>{user.name}</p>
          <p className='text-xs text-muted-foreground'>{user.email}</p>
        </div>

        <Separator />

        {/* Actions */}
        <div className='p-2 space-y-1'>
          <Link
            to='/'
            className='flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent'
          >
            <User className='h-4 w-4' /> Profile
          </Link>

          <Link
            to='/orders'
            className='flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent'
          >
            <Package className='h-4 w-4' /> My Orders
          </Link>
        </div>

        <Separator />

        {/* Theme toggle + logout */}
        <div className='p-2 space-y-1'>
          <Button
            variant='ghost'
            size='sm'
            className='w-full justify-start'
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? (
              <MoonIcon className='h-4 w-4 mr-2' />
            ) : (
              <SunIcon className='h-4 w-4 mr-2' />
            )}
            Switch to {theme === 'light' ? 'dark' : 'light'} mode
          </Button>

          <Button
            variant='ghost'
            size='sm'
            className='w-full justify-start text-destructive hover:text-destructive'
            onClick={clearCache}
          >
            <LogOut className='h-4 w-4 mr-2' /> Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
