import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useEditor } from "@/contexts/EditorContext";
import { toast } from "sonner";

const FrameTool = () => {
  const { frameSettings, updateFrameSettings } = useEditor();
  
  const [borderWidth, setBorderWidth] = useState([frameSettings.borderWidth]);
  const [borderRadius, setBorderRadius] = useState([frameSettings.borderRadius]);
  const [borderColor, setBorderColor] = useState(frameSettings.borderColor);
  const [shadow, setShadow] = useState(frameSettings.shadow);

  const applyFrameSettings = () => {
    updateFrameSettings({
      borderWidth: borderWidth[0],
      borderRadius: borderRadius[0],
      borderColor,
      shadow,
    });
    toast.success("Frame settings applied!");
  };

  const presetFrames = [
    { name: "None", borderWidth: 0, shadow: "none" },
    { name: "Thin", borderWidth: 2, shadow: "none" },
    { name: "Medium", borderWidth: 4, shadow: "medium" },
    { name: "Thick", borderWidth: 8, shadow: "large" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm mb-3 block">Preset Frames</Label>
        <div className="grid grid-cols-2 gap-2">
          {presetFrames.map((frame) => (
            <Button
              key={frame.name}
              variant="outline"
              size="sm"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => {
                setBorderWidth([frame.borderWidth]);
                setShadow(frame.shadow);
                updateFrameSettings({
                  borderWidth: frame.borderWidth,
                  shadow: frame.shadow,
                });
                toast.success(`${frame.name} frame applied!`);
              }}
            >
              <div
                className={`w-12 h-8 bg-[hsl(var(--editor-bg))] rounded`}
                style={{
                  border: `${frame.borderWidth}px solid ${borderColor}`,
                }}
              />
              <span className="text-xs">{frame.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm mb-2 block">Border Width</Label>
          <Slider
            value={borderWidth}
            onValueChange={setBorderWidth}
            min={0}
            max={50}
            step={1}
            className="mb-2"
          />
          <span className="text-xs text-muted-foreground">{borderWidth}px</span>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Border Radius</Label>
          <Slider
            value={borderRadius}
            onValueChange={setBorderRadius}
            min={0}
            max={100}
            step={1}
            className="mb-2"
          />
          <span className="text-xs text-muted-foreground">{borderRadius}px</span>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Border Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
              className="w-16 h-10 p-1 bg-[hsl(var(--editor-bg))] border-border cursor-pointer"
            />
            <Input
              type="text"
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
              className="flex-1 bg-[hsl(var(--editor-bg))] border-border"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Shadow Effect</Label>
          <select 
            value={shadow}
            onChange={(e) => setShadow(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-[hsl(var(--editor-bg))] border border-border text-sm"
          >
            <option value="none">None</option>
            <option value="small">Small Shadow</option>
            <option value="medium">Medium Shadow</option>
            <option value="large">Large Shadow</option>
            <option value="glow">Glow Effect</option>
          </select>
        </div>

        <Button 
          className="w-full gradient-primary" 
          size="sm"
          onClick={applyFrameSettings}
        >
          Apply Frame Settings
        </Button>
      </div>
    </div>
  );
};

export default FrameTool;