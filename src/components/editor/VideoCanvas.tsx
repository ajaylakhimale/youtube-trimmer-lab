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
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [draggedLayer, setDraggedLayer] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingLayer, setResizingLayer] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

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
        playsinline: 1,
        fs: 0, // Disable fullscreen button
      },
      events: {
        onReady: (event: any) => {
          // Ensure the iframe covers the container and doesn't intercept pointer events.
          // This allows overlays and text layers to receive mouse events while
          // the YouTube iframe visually sits behind them.
          try {
            // YT player exposes getIframe() on the player object in many builds
            const iframe = event.target.getIframe ? event.target.getIframe() : containerRef.current?.querySelector('iframe');
            if (iframe) {
              // Position the iframe absolutely within the container
              iframe.style.position = 'absolute';
              iframe.style.inset = '0';  // Shorthand for top/right/bottom/left = 0
              iframe.style.width = '100%';
              iframe.style.height = '100%';

              // Critical: Set proper scaling to fill 9:16 container
              iframe.style.objectFit = 'cover';
              iframe.style.transform = 'scale(1.01)'; // Slight scale to prevent hairline borders

              // Make sure iframe doesn't block interactions with overlays
              iframe.style.pointerEvents = 'none';

              // Additional styles for better preview
              iframe.style.backgroundColor = 'black';
              iframe.style.borderRadius = '8px'; // Match container radius
            }

            // Also style the container for proper iframe containment
            if (containerRef.current) {
              containerRef.current.style.position = 'relative';
              containerRef.current.style.overflow = 'hidden';
              containerRef.current.style.backgroundColor = 'black';
            }
          } catch (err) {
            // Non-critical; continue even if styling fails on some browsers
            console.warn('Could not style youtube iframe', err);
          }

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

  const handleTextDoubleClick = (layerId: string, currentText: string) => {
    setEditingTextId(layerId);
    setEditingText(currentText);
  };

  const handleTextEditComplete = () => {
    if (editingTextId && editingText.trim()) {
      updateTextLayer(editingTextId, { text: editingText });
    }
    setEditingTextId(null);
    setEditingText("");
  };

  const handleResizeMouseDown = (
    e: React.MouseEvent,
    layerId: string,
    currentWidth: number,
    currentHeight: number
  ) => {
    e.stopPropagation();
    setResizingLayer(layerId);
    setResizeStart({
      width: currentWidth,
      height: currentHeight,
      x: e.clientX,
      y: e.clientY,
    });
  };

  useEffect(() => {
    if (!draggedLayer && !resizingLayer) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = canvasContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();

      if (draggedLayer) {
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
      }

      if (resizingLayer) {
        const overlayLayer = overlayLayers.find((l) => l.id === resizingLayer);
        if (overlayLayer) {
          const deltaX = e.clientX - resizeStart.x;
          const deltaY = e.clientY - resizeStart.y;

          const newWidth = resizeStart.width + (deltaX / rect.width) * 100;
          const newHeight = resizeStart.height + (deltaY / rect.height) * 100;

          updateOverlayLayer(resizingLayer, {
            width: Math.max(5, Math.min(100, newWidth)),
            height: Math.max(5, Math.min(100, newHeight)),
          });
        }
      }
    };

    const handleMouseUp = () => {
      setDraggedLayer(null);
      setResizingLayer(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedLayer, resizingLayer, dragOffset, resizeStart, textLayers, overlayLayers, updateTextLayer, updateOverlayLayer]);

  const visibleTextLayers = textLayers.filter(
    (layer) => currentTime >= layer.startTime && currentTime <= layer.endTime
  );

  const visibleOverlayLayers = overlayLayers.filter(
    (layer) => currentTime >= layer.startTime && currentTime <= layer.endTime
  );

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
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Export area label */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-[hsl(var(--editor-panel))] px-3 py-1 rounded-full border border-primary/30 z-10">
        9:16 Reel Preview (Export Area)
      </div>

      {/* Reel-sized container - everything inside will be exported */}
      <div
        ref={canvasContainerRef}
        className="relative w-auto h-full max-h-full aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-primary/40"
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
            zIndex: 1,
          }}
        />

        {/* Frame Border */}
        {frameSettings.borderWidth > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              border: `${frameSettings.borderWidth}px solid ${frameSettings.borderColor}`,
              borderRadius: `${frameSettings.borderRadius}px`,
              zIndex: 2,
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
              zIndex: 10,
              pointerEvents: 'auto',
            }}
            onMouseDown={(e) => handleLayerMouseDown(e, layer.id, layer.x, layer.y)}
          >
            <img src={layer.imageUrl} alt="overlay" className="w-full h-full object-cover pointer-events-none" />
            {selectedLayerId === layer.id && (
              <>
                <button
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/90 z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOverlayLayer(layer.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                {/* Resize handle */}
                <div
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full cursor-se-resize z-20 border-2 border-white shadow-lg"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleResizeMouseDown(e, layer.id, layer.width, layer.height);
                  }}
                />
              </>
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
              zIndex: 10,
              pointerEvents: 'auto',
            }}
            onMouseDown={(e) => handleLayerMouseDown(e, layer.id, layer.x, layer.y)}
            onDoubleClick={() => handleTextDoubleClick(layer.id, layer.text)}
          >
            {editingTextId === layer.id ? (
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={handleTextEditComplete}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTextEditComplete();
                  if (e.key === 'Escape') {
                    setEditingTextId(null);
                    setEditingText("");
                  }
                }}
                autoFocus
                className="bg-transparent outline-none border-b-2 border-primary"
                style={{
                  fontSize: `${layer.fontSize}px`,
                  color: layer.color,
                  fontFamily: layer.fontFamily,
                  fontWeight: layer.bold ? "bold" : "normal",
                  fontStyle: layer.italic ? "italic" : "normal",
                  textDecoration: layer.underline ? "underline" : "none",
                  width: 'auto',
                  minWidth: '100px',
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              layer.text
            )}
            {selectedLayerId === layer.id && (
              <button
                className="absolute -top-6 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/90 z-20"
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