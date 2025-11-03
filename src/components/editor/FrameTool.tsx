import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useEditor } from "@/contexts/EditorContext";
import { toast } from "sonner";

const FrameTool = () => {
  const { frameSettings, updateFrameSettings } = useEditor();

  const [borderWidth, setBorderWidth] = useState([frameSettings.borderWidth]);
  const [borderRadius, setBorderRadius] = useState([frameSettings.borderRadius]);
  const [borderColor, setBorderColor] = useState(frameSettings.borderColor);
  const [shadow, setShadow] = useState(frameSettings.shadow);
  const [showAllGradients, setShowAllGradients] = useState(false);

  // Live update frame settings
  useEffect(() => {
    updateFrameSettings({
      borderWidth: borderWidth[0],
      borderRadius: borderRadius[0],
      borderColor,
      shadow,
    });
  }, [borderWidth, borderRadius, borderColor, shadow]);

  const gradientPresets = [
    { name: "Ocean", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { name: "Sunset", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { name: "Mint", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { name: "Fire", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { name: "Purple", gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
    { name: "Gold", gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
  ];

  const moreGradients = [
    { name: "Neon", gradient: "linear-gradient(135deg, #00f260 0%, #0575e6 100%)" },
    { name: "Berry", gradient: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)" },
    { name: "Peachy", gradient: "linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)" },
    { name: "Crystal", gradient: "linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)" },
    { name: "Rose", gradient: "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)" },
    { name: "Sky", gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
    { name: "Emerald", gradient: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)" },
    { name: "Lavender", gradient: "linear-gradient(135deg, #868f96 0%, #596164 100%)" },
    { name: "Coral", gradient: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)" },
    { name: "Arctic", gradient: "linear-gradient(135deg, #e3ffe7 0%, #d9e7ff 100%)" },
    { name: "Ruby", gradient: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)" },
    { name: "Aqua", gradient: "linear-gradient(135deg, #13547a 0%, #80d0c7 100%)" },
  ];

  const presetFrames = [
    { name: "None", borderWidth: 0, shadow: "none" },
    { name: "Thin", borderWidth: 2, shadow: "none" },
    { name: "Medium", borderWidth: 4, shadow: "medium" },
    { name: "Thick", borderWidth: 8, shadow: "large" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm mb-3 block font-semibold">Gradient Borders</Label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {gradientPresets.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              className="h-16 flex flex-col items-center justify-center gap-1 p-2"
              onClick={() => {
                setBorderColor(preset.gradient);
                setBorderWidth([6]);
                setBorderRadius([20]);
                setShadow("glow");
                toast.success(`${preset.name} gradient applied!`);
              }}
            >
              <div
                className="w-full h-6 rounded"
                style={{
                  background: preset.gradient,
                }}
              />
              <span className="text-xs">{preset.name}</span>
            </Button>
          ))}
        </div>

        <Collapsible open={showAllGradients} onOpenChange={setShowAllGradients}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full text-xs">
              <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${showAllGradients ? 'rotate-180' : ''}`} />
              {showAllGradients ? 'Show Less' : 'Show More Gradients'}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="grid grid-cols-3 gap-2">
              {moreGradients.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  className="h-16 flex flex-col items-center justify-center gap-1 p-2"
                  onClick={() => {
                    setBorderColor(preset.gradient);
                    setBorderWidth([6]);
                    setBorderRadius([20]);
                    setShadow("glow");
                    toast.success(`${preset.name} gradient applied!`);
                  }}
                >
                  <div
                    className="w-full h-6 rounded"
                    style={{
                      background: preset.gradient,
                    }}
                  />
                  <span className="text-xs">{preset.name}</span>
                </Button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div>
        <Label className="text-sm mb-3 block font-semibold">Preset Frames</Label>
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
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm font-semibold">Border Width</Label>
            <span className="text-sm font-bold text-primary">{borderWidth[0]}px</span>
          </div>
          <Slider
            value={borderWidth}
            onValueChange={setBorderWidth}
            min={0}
            max={50}
            step={1}
            className="mb-1"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0px</span>
            <span>50px</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm font-semibold">Corner Radius</Label>
            <span className="text-sm font-bold text-primary">{borderRadius[0]}px</span>
          </div>
          <Slider
            value={borderRadius}
            onValueChange={setBorderRadius}
            min={0}
            max={100}
            step={1}
            className="mb-1"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0px (Sharp)</span>
            <span>100px (Round)</span>
          </div>
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

        <p className="text-xs text-center text-muted-foreground pt-2">
          Changes apply instantly
        </p>
      </div>
    </div>
  );
};

export default FrameTool;