import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Move, RotateCw } from "lucide-react";
import { useState } from "react";

const PanZoomTool = () => {
  const [zoom, setZoom] = useState([100]);
  const [rotation, setRotation] = useState([0]);
  const [positionX, setPositionX] = useState([0]);
  const [positionY, setPositionY] = useState([0]);

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm mb-3 block">Quick Actions</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm">
            <ZoomIn className="w-4 h-4 mr-2" />
            Zoom In
          </Button>
          <Button variant="outline" size="sm">
            <ZoomOut className="w-4 h-4 mr-2" />
            Zoom Out
          </Button>
          <Button variant="outline" size="sm">
            <Move className="w-4 h-4 mr-2" />
            Center
          </Button>
          <Button variant="outline" size="sm">
            <RotateCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm mb-2 block">Zoom Level</Label>
          <Slider
            value={zoom}
            onValueChange={setZoom}
            min={50}
            max={300}
            step={5}
            className="mb-2"
          />
          <span className="text-xs text-muted-foreground">{zoom}%</span>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Rotation</Label>
          <Slider
            value={rotation}
            onValueChange={setRotation}
            min={-180}
            max={180}
            step={1}
            className="mb-2"
          />
          <span className="text-xs text-muted-foreground">{rotation}°</span>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Position X</Label>
          <Slider
            value={positionX}
            onValueChange={setPositionX}
            min={-100}
            max={100}
            step={1}
            className="mb-2"
          />
          <span className="text-xs text-muted-foreground">{positionX}</span>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Position Y</Label>
          <Slider
            value={positionY}
            onValueChange={setPositionY}
            min={-100}
            max={100}
            step={1}
            className="mb-2"
          />
          <span className="text-xs text-muted-foreground">{positionY}</span>
        </div>

        <div className="pt-4 border-t border-border">
          <Label className="text-sm mb-2 block">Animation</Label>
          <select className="w-full px-3 py-2 rounded-md bg-[hsl(var(--editor-bg))] border border-border text-sm mb-2">
            <option>No Animation</option>
            <option>Zoom In (Start)</option>
            <option>Zoom Out (Start)</option>
            <option>Pan Right</option>
            <option>Pan Left</option>
            <option>Ken Burns Effect</option>
          </select>
          <Button className="w-full" variant="outline" size="sm">
            Apply Animation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PanZoomTool;