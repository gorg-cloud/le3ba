'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, MessageSquare, LayoutDashboard, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PlayerDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [activeDare, setActiveDare] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Load profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(prof);

      // Load active dare
      const { data: dare } = await supabase
        .from('dares')
        .select('*')
        .eq('player_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      setActiveDare(dare);

      // Load leaderboard
      const { data: lb } = await supabase
        .from('profiles')
        .select('username, total_points')
        .order('total_points', { ascending: false })
        .limit(10);
      setLeaderboard(lb || []);
    }
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!profile) return <div className="min-h-screen bg-black text-white flex items-center justify-center">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center font-bold text-xl">
            {profile.username[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-lg">{profile.username}</h2>
            <p className="text-zinc-500 text-xs">اللاعب</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Points Card */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-600/20 rounded-lg text-red-600">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="text-zinc-500 text-xs font-medium">إجمالي النقاط</span>
          </div>
          <div className="text-5xl font-black text-white">{profile.total_points}</div>
        </div>

        {/* Active Dare Card */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 blur-3xl rounded-full"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span className="text-red-600 text-xs font-bold uppercase tracking-wider">تحدي نشط</span>
          </div>

          {activeDare ? (
            <div>
              <h3 className="text-xl font-bold mb-2 text-white">{activeDare.title}</h3>
              <p className="text-zinc-400 text-sm mb-6">عندك تحدي جديد من المدير. اضغط عشان تشوف التفاصيل.</p>
              <button
                onClick={() => router.push(`/dare/${activeDare.id}`)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
              >
                فتح التحدي
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-500 text-sm italic">مفيش تحديات دلوقتي. استنى أوامر المدير...</p>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <LayoutDashboard className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-bold">قائمة المتصدرين</h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 p-4 text-zinc-500 text-xs font-medium border-b border-zinc-800">
            <span>الترتيب</span>
            <span>اللاعب</span>
            <span className="text-right">النقاط</span>
          </div>
          <div className="divide-y divide-zinc-800">
            {leaderboard.map((user, index) => (
              <div key={user.username} className="grid grid-cols-3 p-4 items-center hover:bg-zinc-800/50 transition-colors">
                <span className={`font-bold ${index === 0 ? 'text-yellow-500' : 'text-zinc-500'}`}>#{index + 1}</span>
                <span className="font-medium text-white">{user.username}</span>
                <span className="text-right font-bold text-red-600">{user.total_points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
