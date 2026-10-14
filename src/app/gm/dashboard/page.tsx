'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Users, Image as ImageIcon, Trophy, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GMDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [dares, setDares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(prof);

      const { data: d } = await supabase
        .from('dares')
        .select('*')
        .order('created_at', { ascending: false });
      setDares(d || []);

      setLoading(false);
    }
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            {profile?.username[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-lg">لوحة المدير</h2>
            <p className="text-zinc-500 text-xs">التحكم الكامل في اللعبة</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-red-600/20 rounded-xl text-red-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs">اللاعبين</p>
            <p className="text-2xl font-bold">12</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 rounded-xl text-blue-600">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs">تحديات نشطة</p>
            <p className="text-2xl font-bold">{dares.filter(d => d.status === 'active').length}</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-green-600/20 rounded-xl text-green-600">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs">إثباتات وصلت</p>
            <p className="text-2xl font-bold">24</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">إدارة التحديات</h3>
        <button
          onClick={() => router.push('/gm/create-dare')}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          تحدي جديد
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="divide-y divide-zinc-800">
          {dares.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 italic">مفيش تحديات لسه. ابدأ اللعب!</div>
          ) : (
            dares.map((dare) => (
              <div key={dare.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                <div>
                  <h4 className="font-bold text-white">{dare.title}</h4>
                  <p className="text-zinc-500 text-xs truncate max-w-xs">{dare.description_slang}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                    dare.status === 'active' ? 'bg-green-600/20 text-green-600' : 'bg-zinc-700 text-zinc-400'
                  }`}>
                    {dare.status === 'active' ? 'نشط' : 'مكتمل'}
                  </span>
                  <button
                    onClick={() => router.push(`/gm/dare/${dare.id}`)}
                    className="text-zinc-400 hover:text-white text-sm font-medium"
                  >
                    تفاصيل
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
