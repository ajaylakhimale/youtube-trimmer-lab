import { createContext, useContext, useState, ReactNode } from "react";

export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  textCase?: 'uppercase' | 'lowercase' | 'none';
  startTime: number;
  endTime: number;
}

export interface FrameSettings {
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  shadow: string;
}

export interface PanZoomSettings {
  zoom: number;
  rotation: number;
  x: number;
  y: number;
}

export interface OverlayLayer {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  blendMode: string;
  startTime: number;
  endTime: number;
}

interface EditorContextType {
  textLayers: TextLayer[];
  addTextLayer: (layer: Omit<TextLayer, "id">) => void;
  updateTextLayer: (id: string, updates: Partial<TextLayer>) => void;
  removeTextLayer: (id: string) => void;

  frameSettings: FrameSettings;
  updateFrameSettings: (settings: Partial<FrameSettings>) => void;

  panZoomSettings: PanZoomSettings;
  updatePanZoomSettings: (settings: Partial<PanZoomSettings>) => void;

  overlayLayers: OverlayLayer[];
  addOverlayLayer: (layer: Omit<OverlayLayer, "id">) => void;
  updateOverlayLayer: (id: string, updates: Partial<OverlayLayer>) => void;
  removeOverlayLayer: (id: string) => void;

  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [overlayLayers, setOverlayLayers] = useState<OverlayLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const [frameSettings, setFrameSettings] = useState<FrameSettings>({
    borderWidth: 0,
    borderColor: "#36D1DC",
    borderRadius: 0,
    shadow: "none",
  });

  const [panZoomSettings, setPanZoomSettings] = useState<PanZoomSettings>({
    zoom: 1,
    rotation: 0,
    x: 0,
    y: 0,
  });

  const addTextLayer = (layer: Omit<TextLayer, "id">) => {
    const newLayer = { ...layer, id: `text-${Date.now()}` };
    setTextLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const updateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    setTextLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer))
    );
  };

  const removeTextLayer = (id: string) => {
    setTextLayers((prev) => prev.filter((layer) => layer.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const updateFrameSettings = (settings: Partial<FrameSettings>) => {
    setFrameSettings((prev) => ({ ...prev, ...settings }));
  };

  const updatePanZoomSettings = (settings: Partial<PanZoomSettings>) => {
    setPanZoomSettings((prev) => ({ ...prev, ...settings }));
  };

  const addOverlayLayer = (layer: Omit<OverlayLayer, "id">) => {
    const newLayer = { ...layer, id: `overlay-${Date.now()}` };
    setOverlayLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const updateOverlayLayer = (id: string, updates: Partial<OverlayLayer>) => {
    setOverlayLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer))
    );
  };

  const removeOverlayLayer = (id: string) => {
    setOverlayLayers((prev) => prev.filter((layer) => layer.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  return (
    <EditorContext.Provider
      value={{
        textLayers,
        addTextLayer,
        updateTextLayer,
        removeTextLayer,
        frameSettings,
        updateFrameSettings,
        panZoomSettings,
        updatePanZoomSettings,
        overlayLayers,
        addOverlayLayer,
        updateOverlayLayer,
        removeOverlayLayer,
        selectedLayerId,
        setSelectedLayerId,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within EditorProvider");
  }
  return context;
};
