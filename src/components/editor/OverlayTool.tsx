import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Plus, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

const OverlayTool = () => {
  const [opacity, setOpacity] = useState([100]);

  const presetOverlays = [
    { name: "Film Grain", type: "texture" },
    { name: "Vignette", type: "effect" },
    { name: "Light Leak", type: "effect" },
    { name: "Glitch", type: "effect" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Button className="w-full gradient-primary" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Upload Custom Overlay
        </Button>
      </div>

      <div>
        <Label className="text-sm mb-3 block">Preset Overlays</Label>
        <div className="grid grid-cols-2 gap-2">
          {presetOverlays.map((overlay) => (
            <Button
              key={overlay.name}
              variant="outline"
              size="sm"
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <ImageIcon className="w-6 h-6 text-primary" />
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
            step={1}
            className="mb-2"
          />
          <span className="text-xs text-muted-foreground">{opacity}%</span>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Blend Mode</Label>
          <select className="w-full px-3 py-2 rounded-md bg-[hsl(var(--editor-bg))] border border-border text-sm">
            <option>Normal</option>
            <option>Multiply</option>
            <option>Screen</option>
            <option>Overlay</option>
            <option>Soft Light</option>
            <option>Hard Light</option>
            <option>Color Dodge</option>
            <option>Color Burn</option>
          </select>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Position</Label>
          <div className="grid grid-cols-3 gap-2">
            {["Top Left", "Top Center", "Top Right", "Center Left", "Center", "Center Right", "Bottom Left", "Bottom Center", "Bottom Right"].map((pos) => (
              <Button
                key={pos}
                variant="outline"
                size="sm"
                className="text-xs h-12"
              >
                {pos.split(" ")[0]}<br/>{pos.split(" ")[1] || ""}
              </Button>
            ))}
          </div>
        </div>

        <Button className="w-full" variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add to Canvas
        </Button>
      </div>
    </div>
  );
};

export default OverlayTool;