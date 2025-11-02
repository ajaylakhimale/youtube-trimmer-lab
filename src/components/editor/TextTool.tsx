import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useEditor } from "@/contexts/EditorContext";
import { toast } from "sonner";

const TextTool = () => {
  const { addTextLayer, selectedLayerId, textLayers, updateTextLayer } = useEditor();
  const selectedLayer = textLayers.find((l) => l.id === selectedLayerId);
  
  const [text, setText] = useState(selectedLayer?.text || "Your Text Here");
  const [fontSize, setFontSize] = useState([selectedLayer?.fontSize || 32]);
  const [textColor, setTextColor] = useState(selectedLayer?.color || "#36D1DC");
  const [fontFamily, setFontFamily] = useState(selectedLayer?.fontFamily || "Arial");
  const [bold, setBold] = useState(selectedLayer?.bold || false);
  const [italic, setItalic] = useState(selectedLayer?.italic || false);
  const [underline, setUnderline] = useState(selectedLayer?.underline || false);

  const handleAddText = () => {
    addTextLayer({
      text,
      x: 50,
      y: 50,
      fontSize: fontSize[0],
      color: textColor,
      fontFamily,
      bold,
      italic,
      underline,
      startTime: 0,
      endTime: 30,
    });
    toast.success("Text layer added! Drag to reposition.");
  };

  const handleUpdateSelected = () => {
    if (!selectedLayerId) return;
    updateTextLayer(selectedLayerId, {
      text,
      fontSize: fontSize[0],
      color: textColor,
      fontFamily,
      bold,
      italic,
      underline,
    });
    toast.success("Text layer updated!");
  };

  return (
    <div className="space-y-6">
      <div>
        <Button 
          className="w-full gradient-primary" 
          size="sm"
          onClick={handleAddText}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Text Layer
        </Button>
        {selectedLayerId && (
          <Button 
            className="w-full mt-2" 
            size="sm"
            variant="outline"
            onClick={handleUpdateSelected}
          >
            Update Selected
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm mb-2 block">Text Content</Label>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text..."
            className="bg-[hsl(var(--editor-bg))] border-border"
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block">Font Size</Label>
          <Slider
            value={fontSize}
            onValueChange={setFontSize}
            min={12}
            max={120}
            step={1}
            className="mb-2"
          />
          <span className="text-xs text-muted-foreground">{fontSize}px</span>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Text Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-16 h-10 p-1 bg-[hsl(var(--editor-bg))] border-border cursor-pointer"
            />
            <Input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="flex-1 bg-[hsl(var(--editor-bg))] border-border"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Font Family</Label>
          <select 
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-[hsl(var(--editor-bg))] border border-border text-sm"
          >
            <option>Arial</option>
            <option>Helvetica</option>
            <option>Times New Roman</option>
            <option>Georgia</option>
            <option>Courier New</option>
            <option>Verdana</option>
            <option>Impact</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant={bold ? "default" : "outline"}
            size="sm" 
            className="text-xs"
            onClick={() => setBold(!bold)}
          >
            <b>B</b>
          </Button>
          <Button 
            variant={italic ? "default" : "outline"}
            size="sm" 
            className="text-xs"
            onClick={() => setItalic(!italic)}
          >
            <i>I</i>
          </Button>
          <Button 
            variant={underline ? "default" : "outline"}
            size="sm" 
            className="text-xs"
            onClick={() => setUnderline(!underline)}
          >
            <u>U</u>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TextTool;