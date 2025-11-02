import { useEffect, useRef, useState } from "react";
import { useEditor } from "@/contexts/EditorContext";
import { Trash2 } from "lucide-react";

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

  const {
    textLayers,
    updateTextLayer,
    removeTextLayer,
    frameSettings,
    panZoomSettings,
    overlayLayers,
    updateOverlayLayer,
    removeOverlayLayer,
    selectedLayerId,
    setSelectedLayerId,
  } = useEditor();

  const [draggedLayer, setDraggedLayer] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleLayerMouseDown = (
    e: React.MouseEvent,
    layerId: string,
    layerX: number,
    layerY: number
  ) => {
    e.stopPropagation();
    setSelectedLayerId(layerId);
    setDraggedLayer(layerId);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    if (!draggedLayer) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current?.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
      const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;

      const textLayer = textLayers.find((l) => l.id === draggedLayer);
      if (textLayer) {
        updateTextLayer(draggedLayer, { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
      }

      const overlayLayer = overlayLayers.find((l) => l.id === draggedLayer);
      if (overlayLayer) {
        updateOverlayLayer(draggedLayer, { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
      }
    };

    const handleMouseUp = () => {
      setDraggedLayer(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedLayer, dragOffset, textLayers, overlayLayers, updateTextLayer, updateOverlayLayer]);

  const visibleTextLayers = textLayers.filter(
    (layer) => currentTime >= layer.startTime && currentTime <= layer.endTime
  );

  const visibleOverlayLayers = overlayLayers.filter(
    (layer) => currentTime >= layer.startTime && currentTime <= layer.endTime
  );

  return (
    <div 
      className="relative w-full max-w-md aspect-[9/16] max-h-[70vh] bg-black rounded-lg overflow-hidden"
      style={{
        transform: `scale(${panZoomSettings.zoom}) rotate(${panZoomSettings.rotation}deg) translate(${panZoomSettings.x}px, ${panZoomSettings.y}px)`,
        transition: draggedLayer ? "none" : "transform 0.2s ease",
      }}
    >
      {/* YouTube Video */}
      <div 
        ref={containerRef} 
        className="absolute inset-0"
        style={{
          borderRadius: `${frameSettings.borderRadius}px`,
          boxShadow: frameSettings.shadow !== "none" ? getShadowStyle(frameSettings.shadow) : "none",
        }}
      />
      
      {/* Frame Border */}
      {frameSettings.borderWidth > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            border: `${frameSettings.borderWidth}px solid ${frameSettings.borderColor}`,
            borderRadius: `${frameSettings.borderRadius}px`,
          }}
        />
      )}

      {/* Overlay Layers */}
      {visibleOverlayLayers.map((layer) => (
        <div
          key={layer.id}
          className={`absolute cursor-move ${selectedLayerId === layer.id ? "ring-2 ring-primary" : ""}`}
          style={{
            left: `${layer.x}%`,
            top: `${layer.y}%`,
            width: `${layer.width}%`,
            height: `${layer.height}%`,
            opacity: layer.opacity,
            mixBlendMode: layer.blendMode as any,
          }}
          onMouseDown={(e) => handleLayerMouseDown(e, layer.id, layer.x, layer.y)}
        >
          <img src={layer.imageUrl} alt="overlay" className="w-full h-full object-cover" />
          {selectedLayerId === layer.id && (
            <button
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/90"
              onClick={(e) => {
                e.stopPropagation();
                removeOverlayLayer(layer.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}

      {/* Text Layers */}
      {visibleTextLayers.map((layer) => (
        <div
          key={layer.id}
          className={`absolute cursor-move select-none ${selectedLayerId === layer.id ? "ring-2 ring-primary" : ""}`}
          style={{
            left: `${layer.x}%`,
            top: `${layer.y}%`,
            fontSize: `${layer.fontSize}px`,
            color: layer.color,
            fontFamily: layer.fontFamily,
            fontWeight: layer.bold ? "bold" : "normal",
            fontStyle: layer.italic ? "italic" : "normal",
            textDecoration: layer.underline ? "underline" : "none",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            whiteSpace: "nowrap",
          }}
          onMouseDown={(e) => handleLayerMouseDown(e, layer.id, layer.x, layer.y)}
        >
          {layer.text}
          {selectedLayerId === layer.id && (
            <button
              className="absolute -top-6 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/90"
              onClick={(e) => {
                e.stopPropagation();
                removeTextLayer(layer.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

function getShadowStyle(shadow: string): string {
  switch (shadow) {
    case "small":
      return "0 2px 8px rgba(0,0,0,0.3)";
    case "medium":
      return "0 4px 16px rgba(0,0,0,0.4)";
    case "large":
      return "0 8px 32px rgba(0,0,0,0.5)";
    case "glow":
      return "0 0 20px rgba(54, 209, 220, 0.6)";
    default:
      return "none";
  }
}

export default VideoCanvas;