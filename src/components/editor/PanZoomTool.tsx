import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { useState } from "react";
import { useEditor } from "@/contexts/EditorContext";
import { toast } from "sonner";

const PanZoomTool = () => {
  const { panZoomSettings, updatePanZoomSettings } = useEditor();
  
  const [zoom, setZoom] = useState([panZoomSettings.zoom * 100]);
  const [rotation, setRotation] = useState([panZoomSettings.rotation]);
  const [x, setX] = useState([panZoomSettings.x]);
  const [y, setY] = useState([panZoomSettings.y]);

  const applySettings = () => {
    updatePanZoomSettings({
      zoom: zoom[0] / 100,
      rotation: rotation[0],
      x: x[0],
      y: y[0],
    });
    toast.success("Pan/Zoom applied!");
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(200, zoom[0] + 10);
    setZoom([newZoom]);
    updatePanZoomSettings({ zoom: newZoom / 100 });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(50, zoom[0] - 10);
    setZoom([newZoom]);
    updatePanZoomSettings({ zoom: newZoom / 100 });
  };

  const handleReset = () => {
    setZoom([100]);
    setRotation([0]);
    setX([0]);
    setY([0]);
    updatePanZoomSettings({ zoom: 1, rotation: 0, x: 0, y: 0 });
    toast.success("Reset to default!");
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm mb-3 block">Quick Actions</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm mb-2 block">Zoom</Label>
          <Slider
            value={zoom}
            onValueChange={setZoom}
            min={50}
            max={200}
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
            value={x}
            onValueChange={setX}
            min={-200}
            max={200}
            step={5}
            className="mb-2"
          />
          <span className="text-xs text-muted-foreground">{x}px</span>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Position Y</Label>
          <Slider
            value={y}
            onValueChange={setY}
            min={-200}
            max={200}
            step={5}
            className="mb-2"
          />
          <span className="text-xs text-muted-foreground">{y}px</span>
        </div>

        <Button 
          className="w-full gradient-primary" 
          size="sm"
          onClick={applySettings}
        >
          Apply Pan/Zoom
        </Button>
      </div>
    </div>
  );
};

export default PanZoomTool;
