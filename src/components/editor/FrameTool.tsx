import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const FrameTool = () => {
  const [borderWidth, setBorderWidth] = useState([4]);
  const [borderRadius, setBorderRadius] = useState([0]);
  const [borderColor, setBorderColor] = useState("#36D1DC");

  const presetFrames = [
    { name: "None", style: "border-0" },
    { name: "Thin", style: "border-2" },
    { name: "Medium", style: "border-4" },
    { name: "Thick", style: "border-8" },
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
            >
              <div
                className={`w-12 h-8 bg-[hsl(var(--editor-bg))] ${frame.style} border-primary rounded`}
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
          <select className="w-full px-3 py-2 rounded-md bg-[hsl(var(--editor-bg))] border border-border text-sm">
            <option>None</option>
            <option>Small Shadow</option>
            <option>Medium Shadow</option>
            <option>Large Shadow</option>
            <option>Glow Effect</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FrameTool;