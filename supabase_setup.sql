-- Enable Row Level Security (RLS)
-- profiles table
CREATE TYPE user_role AS ENUM ('GM', 'PLAYER');

CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  role user_role DEFAULT 'PLAYER' NOT NULL,
  total_points int DEFAULT 0 NOT NULL,
  avatar_url text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- games table
CREATE TABLE games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_name text NOT NULL,
  gm_id uuid REFERENCES profiles(id) NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- rounds table
CREATE TABLE rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  round_number int NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  prize_description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- dares table
CREATE TABLE dares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid REFERENCES rounds(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description_slang text NOT NULL,
  point_value int DEFAULT 10 NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  character_image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- submissions table
CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dare_id uuid REFERENCES dares(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  proof_url text NOT NULL,
  judge_status text DEFAULT 'pending' CHECK (judge_status IN ('pending', 'approved', 'rejected')),
  judge_feedback text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- RLS POLICIES

-- Profiles: Users can read all profiles (for leaderboard) but only update their own.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Games: Viewable by anyone in the game.
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Games are viewable by everyone" ON games FOR SELECT USING (true);
CREATE POLICY "Only GM can create games" ON games FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'GM')
);

-- Rounds: Viewable by anyone.
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rounds are viewable by everyone" ON rounds FOR SELECT USING (true);
CREATE POLICY "Only GM can manage rounds" ON rounds FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'GM')
);

-- Dares: Players can only see dares assigned to them. GM sees all.
ALTER TABLE dares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players can see their own dares" ON dares FOR SELECT USING (auth.uid() = player_id);
CREATE POLICY "GM can see all dares" ON dares FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'GM')
);
CREATE POLICY "Only GM can manage dares" ON dares FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'GM')
);

-- Submissions: Players can see/create their own. GM sees all.
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players can view own submissions" ON submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Players can create submissions" ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "GM can view all submissions" ON submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'GM')
);
CREATE POLICY "GM can update judge status" ON submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'GM')
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (new.id, new.raw_user_meta_data->>'username', 'PLAYER');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
