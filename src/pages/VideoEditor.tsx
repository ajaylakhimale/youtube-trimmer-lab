import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearchParams } from "react-router-dom";
import html2canvas from 'html2canvas';
import {
  Type,
  Frame,
  Move,
  Image as ImageIcon,
  Download,
  ArrowLeft,
  Play,
  Pause
} from "lucide-react";
import VideoCanvas from "@/components/editor/VideoCanvas";
import TextTool from "@/components/editor/TextTool";
import FrameTool from "@/components/editor/FrameTool";
import PanZoomTool from "@/components/editor/PanZoomTool";
import OverlayTool from "@/components/editor/OverlayTool";
import Timeline from "@/components/editor/Timeline";
import AuthGuard from "@/components/auth/AuthGuard";
import { EditorProvider } from "@/contexts/EditorContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClipData {
  id: string;
  clip_number: number;
  start_time: number;
  duration: number;
  video_id: string;
  videos: {
    youtube_id: string;
    title: string;
  };
}

const VideoEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clipId = searchParams.get("clipId");

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [clipData, setClipData] = useState<ClipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const exportToastId = 'export-progress';

  useEffect(() => {
    if (clipId) {
      loadClip();
    } else {
      setLoading(false);
    }
  }, [clipId]);

  const loadClip = async () => {
    try {
      const { data, error } = await supabase
        .from('clips')
        .select(`
          *,
          videos (
            youtube_id,
            title
          )
        `)
        .eq('id', clipId)
        .single();

      if (error) throw error;
      setClipData(data);
    } catch (error) {
      console.error('Error loading clip:', error);
      toast.error("Failed to load clip");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (newTime: number) => {
    setCurrentTime(newTime);
  };

  const handleExport = async () => {
    if (!clipData || isExporting) return;
    
    try {
      setIsExporting(true);
      setExportProgress(0);
      toast.loading("Preparing video for export...", { id: exportToastId });

      // Reset playback to start
      setCurrentTime(0);
      setIsPlaying(false);
      
      // Small delay to ensure video is reset
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const container = document.querySelector(".export-container") as HTMLElement;
      if (!container) {
        throw new Error("Could not find video container");
      }

      // Create a temporary canvas element
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      // Set canvas size to match container size
      const rect = container.getBoundingClientRect();
      tempCanvas.width = rect.width;
      tempCanvas.height = rect.height;

      // Function to capture a frame
      const captureFrame = async () => {
        const canvas = await html2canvas(container, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          scale: 2, // Higher quality
          logging: false
        });
        ctx?.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
      };

      // Create a MediaRecorder from the canvas stream
      const stream = tempCanvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 8000000 // 8 Mbps for high quality
      });

      const chunks: Blob[] = [];
      const startTime = Date.now();
      const duration = clipData.duration * 1000; // Convert to milliseconds

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      // Update progress and capture frames
      const frameInterval = 1000 / 30; // 30 FPS
      const captureInterval = setInterval(async () => {
        await captureFrame();
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 99.9);
        setExportProgress(progress);
        toast.loading(`Exporting video: ${Math.round(progress)}%`, { id: exportToastId });
      }, frameInterval);

      mediaRecorder.onstop = () => {
        clearInterval(captureInterval);
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `clip-${clipData.clip_number}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportProgress(100);
        toast.success("Video exported successfully!", { id: exportToastId });
        setIsExporting(false);
      };

      // Start recording
      setIsPlaying(true);
      mediaRecorder.start(1000); // Capture in 1-second chunks for smoother progress

      // Stop recording after the duration
      setTimeout(() => {
        clearInterval(captureInterval);
        setIsPlaying(false);
        mediaRecorder.stop();
      }, duration);

    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export video. Please try again.", { id: exportToastId });
      setIsExporting(false);
      setExportProgress(0);
      setIsPlaying(false);
    } finally {
      // Ensure we clean up even if there's an error
      const videoElement = document.querySelector('.export-container iframe') as HTMLIFrameElement;
      if (videoElement) {
        videoElement.style.opacity = '1';
      }
    }
  };

  return (
    <AuthGuard>
      <EditorProvider>
        <div className="min-h-screen bg-[hsl(var(--editor-bg))]">
          {/* Header */}
          <div className="bg-[hsl(var(--editor-panel))] border-b border-border px-4 py-3">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/clips")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Clips
                </Button>
                <div>
                  <h1 className="text-lg font-semibold">Video Editor</h1>
                  <p className="text-xs text-muted-foreground">
                    {clipData ? `${clipData.videos.title} • Clip ${clipData.clip_number}` : 'No clip selected'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  className="gradient-primary relative" 
                  size="sm"
                  onClick={handleExport}
                  disabled={!clipData || isExporting}
                >
                  {isExporting ? (
                    <>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin" />
                        Exporting {Math.round(exportProgress)}%
                      </div>
                      <div 
                        className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300 rounded-full" 
                        style={{ width: `${exportProgress}%` }} 
                      />
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export Video
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
              {/* Left Panel - Tools */}
              <Card className="lg:col-span-3 bg-[hsl(var(--editor-panel))] border-border p-4 overflow-y-auto">
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid grid-cols-2 gap-1 bg-[hsl(var(--editor-bg))]">
                    <TabsTrigger value="text" className="text-xs">
                      <Type className="w-4 h-4 mr-1" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger value="frame" className="text-xs">
                      <Frame className="w-4 h-4 mr-1" />
                      Frame
                    </TabsTrigger>
                  </TabsList>
                  <TabsList className="grid grid-cols-2 gap-1 bg-[hsl(var(--editor-bg))] mt-2">
                    <TabsTrigger value="panzoom" className="text-xs">
                      <Move className="w-4 h-4 mr-1" />
                      Pan/Zoom
                    </TabsTrigger>
                    <TabsTrigger value="overlay" className="text-xs">
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Overlay
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-4">
                    <TabsContent value="text">
                      <TextTool />
                    </TabsContent>
                    <TabsContent value="frame">
                      <FrameTool />
                    </TabsContent>
                    <TabsContent value="panzoom">
                      <PanZoomTool />
                    </TabsContent>
                    <TabsContent value="overlay">
                      <OverlayTool />
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>

              {/* Center - Canvas */}
              <div className="lg:col-span-9 space-y-4">
                <Card className="bg-[hsl(var(--editor-panel))] border-border p-6 pt-12 flex justify-center items-center h-[calc(100vh-20rem)] overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    {loading ? (
                      <div className="flex items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <VideoCanvas
                        youtubeId={clipData?.videos.youtube_id}
                        startTime={clipData?.start_time || 0}
                        duration={clipData?.duration || 30}
                        isPlaying={isPlaying}
                        currentTime={currentTime}
                        onTimeUpdate={setCurrentTime}
                      />
                    )}
                  </div>
                </Card>

                {/* Timeline */}
                <Card className="bg-[hsl(var(--timeline-bg))] border-border p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {clipData?.duration || 30}s
                    </span>
                  </div>
                  <Timeline
                    duration={clipData?.duration || 30}
                    currentTime={currentTime}
                    onTimeChange={handleTimeChange}
                  />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </EditorProvider>
    </AuthGuard>
  );
};

export default VideoEditor;