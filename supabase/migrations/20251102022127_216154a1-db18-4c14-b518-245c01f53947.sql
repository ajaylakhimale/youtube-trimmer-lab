-- Create videos table to store YouTube video metadata
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  title TEXT,
  duration INTEGER, -- in seconds
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'processing', -- processing, completed, failed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create clips table to store generated video clips
CREATE TABLE public.clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  clip_number INTEGER NOT NULL,
  start_time INTEGER NOT NULL, -- in seconds
  end_time INTEGER NOT NULL, -- in seconds
  duration INTEGER NOT NULL, -- in seconds (should be 30)
  file_path TEXT,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, ready, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(video_id, clip_number)
);

-- Create storage buckets for video clips and thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('video-clips', 'video-clips', true, 524288000, ARRAY['video/mp4', 'video/webm']), -- 500MB limit
  ('clip-thumbnails', 'clip-thumbnails', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']); -- 10MB limit

-- Enable RLS on tables
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for videos table
CREATE POLICY "Users can view their own videos"
  ON public.videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos"
  ON public.videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON public.videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON public.videos FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for clips table
CREATE POLICY "Users can view clips of their videos"
  ON public.clips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.videos
      WHERE videos.id = clips.video_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert clips for their videos"
  ON public.clips FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.videos
      WHERE videos.id = clips.video_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update clips of their videos"
  ON public.clips FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.videos
      WHERE videos.id = clips.video_id
      AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete clips of their videos"
  ON public.clips FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.videos
      WHERE videos.id = clips.video_id
      AND videos.user_id = auth.uid()
    )
  );

-- Storage RLS Policies for video-clips bucket
CREATE POLICY "Users can view their own video clips"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'video-clips' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own video clips"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'video-clips' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own video clips"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'video-clips' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own video clips"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'video-clips' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS Policies for clip-thumbnails bucket
CREATE POLICY "Users can view their own clip thumbnails"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'clip-thumbnails' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own clip thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'clip-thumbnails' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own clip thumbnails"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'clip-thumbnails' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own clip thumbnails"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'clip-thumbnails' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER clips_updated_at
  BEFORE UPDATE ON public.clips
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_videos_user_id ON public.videos(user_id);
CREATE INDEX idx_videos_status ON public.videos(status);
CREATE INDEX idx_clips_video_id ON public.clips(video_id);
CREATE INDEX idx_clips_status ON public.clips(status);