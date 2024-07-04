import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fabric } from "fabric";

const Index = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [tool, setTool] = useState("pencil");

  useEffect(() => {
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
    });
    initCanvas.freeDrawingBrush.width = 2;
    setCanvas(initCanvas);
  }, []);

  const handleToolChange = (tool) => {
    setTool(tool);
    if (tool === "pencil") {
      canvas.isDrawingMode = true;
    } else if (tool === "eraser") {
      canvas.isDrawingMode = false;
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        img.set({
          left: 0,
          top: 0,
        });
        canvas.add(img);
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-3xl">Canvas Board</h1>
      <div className="flex space-x-2">
        <Button onClick={() => handleToolChange("pencil")}>Pencil</Button>
        <Button onClick={() => handleToolChange("eraser")}>Eraser</Button>
        <Input type="file" onChange={handleImageUpload} />
      </div>
      <canvas ref={canvasRef} width={800} height={600} className="border" />
    </div>
  );
};

export default Index;