import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Plus } from "lucide-react";
import { useState } from "react";
import { useEditor } from "@/contexts/EditorContext";
import { toast } from "sonner";

const OverlayTool = () => {
  const { addOverlayLayer } = useEditor();
  const [opacity, setOpacity] = useState([80]);
  const [blendMode, setBlendMode] = useState("normal");

  const presetOverlays = [
    { name: "Film Grain", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=356&fit=crop" },
    { name: "Vignette", url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=200&h=356&fit=crop" },
    { name: "Light Leak", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=200&h=356&fit=crop" },
    { name: "Bokeh", url: "https://images.unsplash.com/photo-1495954484750-af469f2f9be5?w=200&h=356&fit=crop" },
  ];

  const handleAddOverlay = (imageUrl: string, name: string) => {
    addOverlayLayer({
      imageUrl,
      x: 25,
      y: 25,
      width: 50,
      height: 50,
      opacity: opacity[0] / 100,
      blendMode,
      startTime: 0,
      endTime: 30,
    });
    toast.success(`${name} overlay added! Drag to reposition.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        addOverlayLayer({
          imageUrl,
          x: 25,
          y: 25,
          width: 50,
          height: 50,
          opacity: opacity[0] / 100,
          blendMode,
          startTime: 0,
          endTime: 30,
        });
        toast.success("Custom overlay added! Drag to reposition.");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="overlay-upload">
          <Button
            className="w-full gradient-primary"
            size="sm"
            onClick={() => document.getElementById("overlay-upload")?.click()}
            type="button"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Custom Overlay
          </Button>
        </label>
        <input
          id="overlay-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <div>
        <Label className="text-sm mb-3 block">Preset Overlays</Label>
        <div className="grid grid-cols-2 gap-2">
          {presetOverlays.map((overlay) => (
            <Button
              key={overlay.name}
              variant="outline"
              size="sm"
              className="h-24 flex flex-col items-center justify-center gap-2 p-2"
              onClick={() => handleAddOverlay(overlay.url, overlay.name)}
            >
              <img
                src={overlay.url}
                alt={overlay.name}
                className="w-full h-12 object-cover rounded"
              />
              <span className="text-xs">{overlay.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm mb-2 block">Opacity</Label>
          <Slider
            value={opacity}
            onValueChange={setOpacity}
            min={0}
            max={100}
            step={5}
            className="mb-2"
          />
          <span className="text-xs text-muted-foreground">{opacity}%</span>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Blend Mode</Label>
          <select 
            value={blendMode}
            onChange={(e) => setBlendMode(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-[hsl(var(--editor-bg))] border border-border text-sm"
          >
            <option value="normal">Normal</option>
            <option value="multiply">Multiply</option>
            <option value="screen">Screen</option>
            <option value="overlay">Overlay</option>
            <option value="darken">Darken</option>
            <option value="lighten">Lighten</option>
            <option value="color-dodge">Color Dodge</option>
            <option value="color-burn">Color Burn</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default OverlayTool;
