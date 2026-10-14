'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardRouter() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'GM') {
        router.push('/gm/dashboard');
      } else {
        router.push('/player/dashboard');
      }
      setLoading(false);
    }
    checkRole();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return null;
}
