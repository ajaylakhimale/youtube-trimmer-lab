import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, ChevronDown, CaseSensitive } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [showGradients, setShowGradients] = useState(false);
  const [textCase, setTextCase] = useState<'uppercase' | 'lowercase' | 'none'>('none');

  const textGradients = [
    { name: "Ocean", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { name: "Sunset", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { name: "Mint", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { name: "Fire", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { name: "Purple", gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
    { name: "Gold", gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
  ];

  const moreTextGradients = [
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

  // Sync form with selected layer
  useEffect(() => {
    if (selectedLayer) {
      setText(selectedLayer.text);
      setFontSize([selectedLayer.fontSize]);
      setTextColor(selectedLayer.color);
      setFontFamily(selectedLayer.fontFamily);
      setBold(selectedLayer.bold);
      setItalic(selectedLayer.italic);
      setUnderline(selectedLayer.underline);
      setTextCase(selectedLayer.textCase || 'none');
    } else {
      // Reset to defaults when nothing is selected
      setText("Your Text Here");
      setFontSize([32]);
      setTextColor("#36D1DC");
      setFontFamily("Arial");
      setBold(false);
      setItalic(false);
      setUnderline(false);
      setTextCase('none');
    }
  }, [selectedLayerId, selectedLayer]);

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
      textCase,
      startTime: 0,
      endTime: 30,
    });
    toast.success("Text layer added! Drag to reposition.");
  };

  // Live update selected layer when form changes
  useEffect(() => {
    if (selectedLayerId && selectedLayer) {
      updateTextLayer(selectedLayerId, {
        text,
        fontSize: fontSize[0],
        color: textColor,
        fontFamily,
        bold,
        italic,
        underline,
        textCase,
      });
    }
  }, [text, fontSize, textColor, fontFamily, bold, italic, underline, textCase]);

  const handleToggleCase = () => {
    const cases: ('uppercase' | 'lowercase' | 'none')[] = ['uppercase', 'lowercase', 'none'];
    const currentIndex = cases.indexOf(textCase);
    const nextIndex = (currentIndex + 1) % cases.length;
    setTextCase(cases[nextIndex]);
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
          <p className="text-xs text-center text-muted-foreground mt-2">
            Editing selected text layer
          </p>
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
            style={{ textTransform: textCase !== 'none' ? textCase : 'none' }}
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
          <Label className="text-sm mb-2 block font-semibold">Text Color</Label>
          <div className="flex gap-2 mb-3">
            <Input
              type="color"
              value={textColor.startsWith('linear-gradient') ? '#36D1DC' : textColor}
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

          <Label className="text-sm mb-3 block font-semibold">Text Gradients</Label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {textGradients.map((gradient) => (
              <Button
                key={gradient.name}
                variant="outline"
                size="sm"
                className="h-14 flex flex-col items-center justify-center gap-1 p-1"
                onClick={() => {
                  setTextColor(gradient.gradient);
                  toast.success(`${gradient.name} gradient applied!`);
                }}
              >
                <div
                  className="w-full h-5 rounded"
                  style={{
                    background: gradient.gradient,
                  }}
                />
                <span className="text-xs">{gradient.name}</span>
              </Button>
            ))}
          </div>

          <Collapsible open={showGradients} onOpenChange={setShowGradients}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full text-xs">
                <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${showGradients ? 'rotate-180' : ''}`} />
                {showGradients ? 'Hide' : 'Show'} More Gradients
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="grid grid-cols-3 gap-2">
                {moreTextGradients.map((gradient) => (
                  <Button
                    key={gradient.name}
                    variant="outline"
                    size="sm"
                    className="h-14 flex flex-col items-center justify-center gap-1 p-1"
                    onClick={() => {
                      setTextColor(gradient.gradient);
                      toast.success(`${gradient.name} gradient applied!`);
                    }}
                  >
                    <div
                      className="w-full h-5 rounded"
                      style={{
                        background: gradient.gradient,
                      }}
                    />
                    <span className="text-xs">{gradient.name}</span>
                  </Button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
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

        <div className="grid grid-cols-4 gap-2">
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
          <Button
            variant={textCase !== 'none' ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={handleToggleCase}
          >
            <CaseSensitive className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TextTool;