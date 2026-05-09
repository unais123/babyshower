-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    vote TEXT NOT NULL CHECK (vote IN ('boy', 'girl')),
    device_id TEXT NOT NULL,
    boy_name_suggestion TEXT,
    girl_name_suggestion TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anonymous inserts" ON public.votes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous selection" ON public.votes
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous deletes (for admin/demo)" ON public.votes
    FOR DELETE USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
