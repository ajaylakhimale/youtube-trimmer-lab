import { useEffect, useRef, useState } from "react";

interface VideoCanvasProps {
  youtubeId?: string;
  startTime?: number;
  duration?: number;
  isPlaying?: boolean;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
}

const VideoCanvas = ({ 
  youtubeId, 
  startTime = 0, 
  duration = 30,
  isPlaying = false,
  currentTime = 0,
  onTimeUpdate 
}: VideoCanvasProps) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        setIsReady(true);
      };
    } else {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady || !youtubeId || !containerRef.current) return;

    // Create player
    playerRef.current = new (window as any).YT.Player(containerRef.current, {
      height: '100%',
      width: '100%',
      videoId: youtubeId,
      playerVars: {
        start: startTime,
        end: startTime + duration,
        controls: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event: any) => {
          event.target.seekTo(startTime);
        },
        onStateChange: (event: any) => {
          if (event.data === (window as any).YT.PlayerState.ENDED) {
            event.target.seekTo(startTime);
            if (isPlaying) {
              event.target.playVideo();
            }
          }
        },
      },
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [isReady, youtubeId, startTime, duration]);

  useEffect(() => {
    if (!playerRef.current || !playerRef.current.playVideo) return;

    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (error) {
      console.log('Player not ready yet');
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!playerRef.current || !playerRef.current.getCurrentTime) return;
    
    const interval = setInterval(() => {
      try {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const time = playerRef.current.getCurrentTime();
          if (time >= startTime + duration) {
            playerRef.current.seekTo(startTime);
          }
          if (onTimeUpdate) {
            onTimeUpdate(time - startTime);
          }
        }
      } catch (error) {
        // Player not ready yet
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, duration, onTimeUpdate]);

  if (!youtubeId) {
    return (
      <div className="relative w-full max-w-md aspect-[9/16] max-h-[70vh] bg-[hsl(var(--editor-bg))] rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">No video loaded</p>
          <p className="text-muted-foreground text-sm mt-2">Select a clip to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md aspect-[9/16] max-h-[70vh] bg-black rounded-lg overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
};

export default VideoCanvas;