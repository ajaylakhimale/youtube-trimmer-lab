import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Scissors, Sparkles, Zap, Youtube, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to process videos");
      navigate("/auth");
      return;
    }

    if (!videoUrl.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    if (!videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be")) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('process-youtube-video', {
        body: { youtubeUrl: videoUrl }
      });

      if (error) throw error;

      toast.success(data.message || "Video processed successfully!");
      navigate("/clips");
    } catch (error: any) {
      console.error('Error processing video:', error);
      toast.error(error.message || "Failed to process video");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--editor-panel))] to-[hsl(var(--background))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(180_85%_55%_/_0.1),transparent_50%)]" />
      
      {/* Header with auth */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-4 flex justify-end">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          )}
        </div>
      </div>

      <div className="relative container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">AI-Powered Video Clipping</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Clip, Edit & Export
            </span>
            <br />
            <span className="text-foreground">YouTube Videos</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform any YouTube video into perfectly sized 30-second clips. 
            Add text, frames, and effects with our professional editor.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
            <Card className="bg-[hsl(var(--card))] border-border p-6 hover:border-primary transition-smooth">
              <Scissors className="w-8 h-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Auto-Clip</h3>
              <p className="text-sm text-muted-foreground">
                Automatically split videos into 30s clips
              </p>
            </Card>
            
            <Card className="bg-[hsl(var(--card))] border-border p-6 hover:border-primary transition-smooth">
              <Sparkles className="w-8 h-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Pro Editor</h3>
              <p className="text-sm text-muted-foreground">
                Add text, frames, pan & zoom effects
              </p>
            </Card>
            
            <Card className="bg-[hsl(var(--card))] border-border p-6 hover:border-primary transition-smooth">
              <Zap className="w-8 h-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Fast Export</h3>
              <p className="text-sm text-muted-foreground">
                Download your edited clips instantly
              </p>
            </Card>
          </div>
        </div>

        {/* Input Form */}
        <Card className="w-full max-w-2xl bg-[hsl(var(--card))] border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">
                YouTube Video URL
              </label>
              <div className="relative">
                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="pl-11 h-12 bg-[hsl(var(--editor-bg))] border-border text-base"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base gradient-primary glow-hover"
              disabled={isProcessing || !user}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Processing Video...
                </>
              ) : !user ? (
                "Sign In to Generate Clips"
              ) : (
                <>
                  <Scissors className="w-5 h-5 mr-2" />
                  Generate Clips
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              {user
                ? "Paste any YouTube URL to get started. We'll automatically create 30-second clips ready for editing."
                : "Sign in to start processing YouTube videos into clips."}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
