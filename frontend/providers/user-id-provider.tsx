'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { setClientUserId } from '@/lib/api/client';

export function UserIdProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  useEffect(() => {
    if (user?.id) {
      setClientUserId(user.id);
    }
  }, [user?.id]);

  return <>{children}</>;
}
