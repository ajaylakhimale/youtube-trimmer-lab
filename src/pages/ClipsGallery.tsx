import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Play, Edit, Download, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AuthGuard from "@/components/auth/AuthGuard";

interface Clip {
  id: string;
  clip_number: number;
  start_time: number;
  duration: number;
  thumbnail_url: string;
  status: string;
}

const ClipsGallery = () => {
  const navigate = useNavigate();
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClips();
  }, []);

  const loadClips = async () => {
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      setClips(data || []);
    } catch (error: any) {
      console.error('Error loading clips:', error);
      toast.error("Failed to load clips");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[hsl(var(--editor-bg))] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your clips...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[hsl(var(--editor-bg))]">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Your Video Clips
            </h1>
            <p className="text-muted-foreground">
              {clips.length} {clips.length === 1 ? 'clip' : 'clips'} ready to edit
            </p>
          </div>

          {clips.length === 0 ? (
            <Card className="bg-[hsl(var(--card))] border-border p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No clips yet. Process a YouTube video to get started!
              </p>
              <Button onClick={() => navigate("/")} className="gradient-primary">
                Process Your First Video
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {clips.map((clip) => (
                <Card
                  key={clip.id}
                  className="bg-[hsl(var(--card))] border-border overflow-hidden group cursor-pointer hover:border-primary transition-smooth"
                >
                  <div className="relative aspect-[9/16] bg-[hsl(var(--editor-panel))]">
                    <img
                      src={clip.thumbnail_url || "/placeholder.svg"}
                      alt={`Clip ${clip.clip_number}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
                      <Play className="w-12 h-12 text-primary" />
                    </div>
                    <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs">
                      {formatTime(30)}
                    </div>
                    <div className="absolute top-2 left-2 bg-primary/80 px-2 py-1 rounded text-xs font-semibold">
                      #{clip.clip_number}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-xs">
                      Instagram Reels
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">
                        Starts at {formatTime(clip.start_time)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        clip.status === 'ready' 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {clip.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 gradient-primary"
                        onClick={() => navigate(`/editor?clipId=${clip.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => toast.info("Export feature coming soon!")}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default ClipsGallery;