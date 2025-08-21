import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '@/_generated/api';
import { Doc } from '@/_generated/dataModel';
import { authClient } from '@/lib/auth-client';
import { useNavigate } from '@tanstack/react-router';

const CACHE_KEY = 'deepak_user';

type User = Doc<'users'>;

// Type guard to validate cached user data
function isValidUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    '_id' in data &&
    typeof (data as any)._id === 'string'
  );
}

// Safe localStorage operations
function getCachedUser(): User | null {
  if (typeof window === 'undefined') return null;

  try {
    const item = window.localStorage.getItem(CACHE_KEY);
    if (!item) return null;

    const parsed = JSON.parse(item);
    return isValidUser(parsed) ? parsed : null;
  } catch (error) {
    console.warn('Failed to parse cached user data:', error);
    // Clear corrupted cache
    try {
      window.localStorage.removeItem(CACHE_KEY);
    } catch {
      // Ignore cleanup errors
    }
    return null;
  }
}

function setCachedUser(user: User | null): void {
  if (typeof window === 'undefined') return;

  try {
    if (user) {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(CACHE_KEY);
    }
  } catch (error) {
    console.warn('Failed to cache user data:', error);
  }
}

export function useUserInfo() {
  const [cached, setCached] = useState<User | null>(getCachedUser);
  const navigate = useNavigate();

  const userQuery = useQuery(convexQuery(api.auth.getCurrentUser, {}));

  useEffect(() => {
    // Only update cache when we have a definitive result
    if (userQuery.data !== undefined) {
      const userData = userQuery.data as User | null;
      setCached(userData);
      setCachedUser(userData);
    }
  }, [userQuery.data]);

  const clearCache = async () => {
    try {
      await authClient.signOut();
      navigate({ to: '/' });
      setCached(null);
      setCachedUser(null);
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw error;
    }
  };

  return {
    user:
      userQuery.data === undefined ? cached : (userQuery.data as User | null),
    isLoading: userQuery.isLoading,
    isError: userQuery.isError,
    error: userQuery.error,
    clearCache,
  };
}
