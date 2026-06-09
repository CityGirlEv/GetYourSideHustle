import { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Eraser, Type as TypeIcon, PenLine } from "lucide-react";
import { Input } from "./ui/input";

export function SignaturePad({ onSign }: { onSign: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typed, setTyped] = useState("");
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * ratio;
    c.height = rect.height * ratio;
    const ctx = c.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#1E1B4B";
  }, [mode]);

  const start = (x: number, y: number) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawing.current = true;
  };
  const move = (x: number, y: number) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasInk(true);
  };
  const end = () => (drawing.current = false);

  const point = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const clear = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setHasInk(false);
  };

  const submit = () => {
    if (mode === "draw") {
      if (!hasInk) return;
      onSign(canvasRef.current!.toDataURL());
    } else {
      if (!typed.trim()) return;
      onSign(typed.trim());
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" variant={mode === "draw" ? "default" : "outline"} onClick={() => setMode("draw")}><PenLine className="h-4 w-4 mr-1"/>Draw</Button>
        <Button type="button" size="sm" variant={mode === "type" ? "default" : "outline"} onClick={() => setMode("type")}><TypeIcon className="h-4 w-4 mr-1"/>Type</Button>
        {mode === "draw" && <Button type="button" size="sm" variant="ghost" onClick={clear}><Eraser className="h-4 w-4 mr-1"/>Clear</Button>}
      </div>
      {mode === "draw" ? (
        <canvas
          ref={canvasRef}
          className="w-full h-44 rounded-xl bg-white border-2 border-dashed border-border touch-none"
          onPointerDown={(e) => { const p = point(e); start(p.x, p.y); }}
          onPointerMove={(e) => { const p = point(e); move(p.x, p.y); }}
          onPointerUp={end}
          onPointerLeave={end}
        />
      ) : (
        <div className="rounded-xl bg-white border-2 border-dashed border-border p-6">
          <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type your full legal name" />
          {typed && <div className="script text-4xl mt-3 text-primary">{typed}</div>}
        </div>
      )}
      <Button onClick={submit} className="w-full grad-indigo">Sign &amp; lock signature</Button>
    </div>
  );
}
