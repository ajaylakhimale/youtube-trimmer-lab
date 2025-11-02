import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Play, Edit, Download } from "lucide-react";

interface Clip {
  id: string;
  thumbnail: string;
  duration: string;
  startTime: string;
}

const ClipsGallery = () => {
  const navigate = useNavigate();

  // Mock data for demonstration
  const clips: Clip[] = Array.from({ length: 12 }, (_, i) => ({
    id: `clip-${i + 1}`,
    thumbnail: "/placeholder.svg",
    duration: "0:30",
    startTime: `${Math.floor(i * 0.5)}:${(i * 30) % 60}`,
  }));

  return (
    <div className="min-h-screen bg-[hsl(var(--editor-bg))]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            ← Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Your Video Clips
          </h1>
          <p className="text-muted-foreground">
            Select a clip to edit or download
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clips.map((clip) => (
            <Card
              key={clip.id}
              className="bg-[hsl(var(--card))] border-border overflow-hidden group cursor-pointer hover:border-primary transition-smooth"
            >
              <div className="relative aspect-video bg-[hsl(var(--editor-panel))]">
                <img
                  src={clip.thumbnail}
                  alt={`Clip ${clip.id}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
                  <Play className="w-12 h-12 text-primary" />
                </div>
                <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs">
                  {clip.duration}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">
                    Starts at {clip.startTime}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gradient-primary"
                    onClick={() => navigate("/editor")}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClipsGallery;