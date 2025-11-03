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

    // Fetch video metadata using Google YouTube Data API v3
    let videoDuration = 0;
    let videoTitle = '';
    let thumbnailUrl = '';

    try {
      const YOUTUBE_API_KEY = 'AIzaSyBfUGxzLr7csZkHltt2kcDIjfbNIli_ljo';
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${youtubeId}&key=${YOUTUBE_API_KEY}&part=snippet,contentDetails`;

      console.log('Fetching video data from YouTube Data API...');
      const apiResponse = await fetch(apiUrl);

      if (!apiResponse.ok) {
        throw new Error(`YouTube API returned status ${apiResponse.status}`);
      }

      const data = await apiResponse.json();

      if (!data.items || data.items.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Video not found or unavailable' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const videoInfo = data.items[0];
      videoTitle = videoInfo.snippet?.title || 'Untitled Video';
      thumbnailUrl = videoInfo.snippet?.thumbnails?.maxres?.url ||
        videoInfo.snippet?.thumbnails?.high?.url ||
        `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

      // Parse ISO 8601 duration (e.g., "PT1H2M30S" = 1 hour, 2 minutes, 30 seconds)
      const duration = videoInfo.contentDetails?.duration || '';
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

      if (match) {
        const hours = parseInt(match[1] || '0', 10);
        const minutes = parseInt(match[2] || '0', 10);
        const seconds = parseInt(match[3] || '0', 10);
        videoDuration = hours * 3600 + minutes * 60 + seconds;
        console.log('Successfully fetched video metadata:', {
          title: videoTitle,
          duration: videoDuration,
          formatted: `${hours}h ${minutes}m ${seconds}s`
        });
      } else {
        throw new Error('Could not parse video duration');
      }
    } catch (error) {
      console.error('Error fetching video data from YouTube API:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch video information from YouTube' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (videoDuration <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid video duration' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create video record in database
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .insert({
        user_id: user.id,
        youtube_url: youtubeUrl,
        youtube_id: youtubeId,
        title: videoTitle,
        duration: videoDuration,
        thumbnail_url: thumbnailUrl,
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

    // Generate 30-second clips metadata based on actual video duration
    const clipDuration = 30;
    const maxClips = 20;
    const maxDuration = 7200; // 2 hours in seconds

    if (videoDuration > maxDuration) {
      return new Response(
        JSON.stringify({ error: `Video is longer than 2 hours. Please select a shorter video.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const numClips = Math.min(maxClips, Math.floor(videoDuration / clipDuration));
    console.log(`Generating ${numClips} clips from ${videoDuration}s video`);

    // Optimized algorithm: Divide video into segments and randomly pick from each
    const clips = [];

    if (numClips > 0) {
      const segmentSize = Math.floor(videoDuration / numClips);

      for (let i = 0; i < numClips; i++) {
        const segmentStart = i * segmentSize;
        const segmentEnd = Math.min((i + 1) * segmentSize, videoDuration - clipDuration);

        // Pick a random start time within this segment
        const startTime = segmentStart + Math.floor(Math.random() * Math.max(1, segmentEnd - segmentStart));
        const endTime = Math.min(startTime + clipDuration, videoDuration);

        clips.push({
          video_id: video.id,
          clip_number: i + 1,
          start_time: startTime,
          end_time: endTime,
          duration: endTime - startTime,
          thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
          status: 'ready',
        });
      }

      console.log(`Generated ${clips.length} clips successfully`);
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