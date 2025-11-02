import { useRef, useEffect, useState } from "react";

interface TimelineProps {
  duration: number;
  currentTime: number;
  onTimeChange: (time: number) => void;
}

const Timeline = ({ duration, currentTime, onTimeChange }: TimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = Math.max(0, Math.min(duration, percentage * duration));
    onTimeChange(Math.floor(newTime));
  };

  const handleMouseDown = () => setIsDragging(true);
  
  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = Math.max(0, Math.min(duration, percentage * duration));
      onTimeChange(Math.floor(newTime));
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, duration, onTimeChange]);

  const progress = (currentTime / duration) * 100;

  return (
    <div className="space-y-2">
      <div
        ref={timelineRef}
        className="relative h-16 bg-[hsl(var(--editor-bg))] rounded-lg cursor-pointer overflow-hidden"
        onClick={handleTimelineClick}
      >
        {/* Timeline markers */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: Math.ceil(duration / 5) }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-l border-border first:border-l-0"
            >
              <span className="absolute top-1 left-1 text-xs text-muted-foreground">
                {i * 5}s
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div
          className="absolute inset-y-0 left-0 bg-primary/20 pointer-events-none"
          style={{ width: `${progress}%` }}
        />

        {/* Playhead */}
        <div
          className="absolute inset-y-0 w-0.5 bg-primary pointer-events-none shadow-[0_0_10px_hsl(var(--primary))]"
          style={{ left: `${progress}%` }}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full shadow-lg" />
        </div>

        {/* Video layer representation */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-[hsl(var(--editor-hover))] border-t border-border flex items-center px-2">
          <span className="text-xs text-muted-foreground">Video Layer</span>
        </div>
      </div>
    </div>
  );
};

export default Timeline;