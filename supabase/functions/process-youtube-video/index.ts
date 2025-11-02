import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { youtubeUrl } = await req.json();

    if (!youtubeUrl) {
      return new Response(
        JSON.stringify({ error: 'YouTube URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract YouTube video ID
    let youtubeId = '';
    try {
      const url = new URL(youtubeUrl);
      if (url.hostname.includes('youtube.com')) {
        youtubeId = url.searchParams.get('v') || '';
      } else if (url.hostname.includes('youtu.be')) {
        youtubeId = url.pathname.slice(1);
      }
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!youtubeId) {
      return new Response(
        JSON.stringify({ error: 'Could not extract YouTube video ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing YouTube video:', youtubeId);

    // Fetch video metadata from YouTube API (using oEmbed - no API key needed)
    let videoData;
    try {
      const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`;
      const response = await fetch(oEmbedUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch video metadata');
      }
      
      videoData = await response.json();
    } catch (error) {
      console.error('Error fetching video metadata:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch video information from YouTube' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For demo purposes, assume video is 5 minutes (300 seconds)
    // In production, you'd use YouTube Data API v3 to get actual duration
    const assumedDuration = 300;
    
    // Create video record in database
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .insert({
        user_id: user.id,
        youtube_url: youtubeUrl,
        youtube_id: youtubeId,
        title: videoData.title,
        duration: assumedDuration,
        thumbnail_url: videoData.thumbnail_url || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
        status: 'processing',
      })
      .select()
      .single();

    if (videoError) {
      console.error('Error creating video record:', videoError);
      return new Response(
        JSON.stringify({ error: 'Failed to create video record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Created video record:', video.id);

    // Generate 30-second clips metadata
    const clipDuration = 30;
    const numClips = Math.floor(assumedDuration / clipDuration);
    
    const clips = [];
    for (let i = 0; i < numClips; i++) {
      const startTime = i * clipDuration;
      const endTime = Math.min(startTime + clipDuration, assumedDuration);
      
      clips.push({
        video_id: video.id,
        clip_number: i + 1,
        start_time: startTime,
        end_time: endTime,
        duration: clipDuration,
        // For demo, use YouTube thumbnail with time parameter
        thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
        status: 'ready', // In production, this would be 'pending' until actually processed
      });
    }

    // Insert clips
    const { error: clipsError } = await supabase
      .from('clips')
      .insert(clips);

    if (clipsError) {
      console.error('Error creating clips:', clipsError);
      // Update video status to failed
      await supabase
        .from('videos')
        .update({ status: 'failed', error_message: 'Failed to generate clips' })
        .eq('id', video.id);
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate clips' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update video status to completed
    await supabase
      .from('videos')
      .update({ status: 'completed' })
      .eq('id', video.id);

    console.log(`Successfully created ${clips.length} clips for video ${video.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        videoId: video.id,
        clipCount: clips.length,
        message: `Successfully generated ${clips.length} clips`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-youtube-video:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});