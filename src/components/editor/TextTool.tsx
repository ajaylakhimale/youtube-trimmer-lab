import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Plus } from "lucide-react";
import { useState } from "react";

const TextTool = () => {
  const [fontSize, setFontSize] = useState([32]);
  const [textColor, setTextColor] = useState("#36D1DC");

  return (
    <div className="space-y-6">
      <div>
        <Button className="w-full gradient-primary" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Text Layer
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm mb-2 block">Text Content</Label>
          <Input
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
          <select className="w-full px-3 py-2 rounded-md bg-[hsl(var(--editor-bg))] border border-border text-sm">
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
          <Button variant="outline" size="sm" className="text-xs">
            <b>B</b>
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <i>I</i>
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <u>U</u>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TextTool;