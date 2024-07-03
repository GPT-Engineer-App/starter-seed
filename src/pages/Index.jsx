import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, RotateCw, Trash2 } from "lucide-react";

const Index = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [tool, setTool] = useState("pencil");
  const [text, setText] = useState("");
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (tool === "text") {
      const newText = {
        type: "text",
        x: offsetX,
        y: offsetY,
        text,
      };
      setElements([...elements, newText]);
      setText("");
    } else {
      context.beginPath();
      context.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    if (tool === "pencil") {
      context.lineTo(offsetX, offsetY);
      context.stroke();
    } else if (tool === "eraser") {
      context.clearRect(offsetX, offsetY, 10, 10);
    } else if (tool === "rectangle") {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      context.strokeRect(offsetX, offsetY, 100, 50);
    } else if (tool === "circle") {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      context.beginPath();
      context.arc(offsetX, offsetY, 50, 0, 2 * Math.PI);
      context.stroke();
    } else if (tool === "line") {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      context.beginPath();
      context.moveTo(offsetX, offsetY);
      context.lineTo(offsetX + 100, offsetY + 100);
      context.stroke();
    }
  };

  const stopDrawing = () => {
    context.closePath();
    setIsDrawing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    setContext(ctx);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleElementClick = (index) => {
    setSelectedElement(index);
  };

  const handleElementDelete = () => {
    if (selectedElement !== null) {
      const newElements = elements.filter((_, index) => index !== selectedElement);
      setElements(newElements);
      setSelectedElement(null);
    }
  };

  const handleElementRotate = (direction) => {
    if (selectedElement !== null) {
      const newElements = elements.map((element, index) => {
        if (index === selectedElement && element.type === "image") {
          const newAngle = direction === "cw" ? element.angle + 90 : element.angle - 90;
          return { ...element, angle: newAngle };
        }
        return element;
      });
      setElements(newElements);
    }
  };

  useEffect(() => {
    initializeCanvas();
  }, []);

  useEffect(() => {
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    elements.forEach((element) => {
      if (element.type === "text") {
        context.fillText(element.text, element.x, element.y);
      } else if (element.type === "image") {
        const img = new Image();
        img.src = element.src;
        context.save();
        context.translate(element.x + img.width / 2, element.y + img.height / 2);
        context.rotate((element.angle * Math.PI) / 180);
        context.drawImage(img, -img.width / 2, -img.height / 2);
        context.restore();
      }
    });
  }, [elements, context]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-3xl">Canvas Board</h1>
      <div className="flex space-x-2">
        <Button onClick={() => setTool("pencil")}>Pencil</Button>
        <Button onClick={() => setTool("eraser")}>Eraser</Button>
        <Button onClick={() => setTool("rectangle")}>Rectangle</Button>
        <Button onClick={() => setTool("circle")}>Circle</Button>
        <Button onClick={() => setTool("line")}>Line</Button>
        <Button onClick={() => setTool("text")}>Text</Button>
        <Input type="file" onChange={handleImageUpload} />
        <Input type="text" value={text} onChange={handleTextChange} placeholder="Enter text" />
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      {selectedElement !== null && (
        <div className="flex space-x-2">
          <Button onClick={() => handleElementRotate("ccw")}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button onClick={() => handleElementRotate("cw")}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleElementDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;