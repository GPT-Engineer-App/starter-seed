import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rnd } from "react-rnd";

const Index = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [tool, setTool] = useState("pencil");
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    if (tool === "pencil") {
      context.lineTo(offsetX, offsetY);
      context.stroke();
    } else if (tool === "eraser") {
      context.clearRect(offsetX, offsetY, 10, 10);
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
        const newElement = {
          type: "image",
          src: event.target.result,
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
          rotation: 0,
        };
        setElements([...elements, newElement]);
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

  useEffect(() => {
    initializeCanvas();
  }, []);

  const handleElementDragStop = (index, e, d) => {
    const newElements = [...elements];
    newElements[index].x = d.x;
    newElements[index].y = d.y;
    setElements(newElements);
  };

  const handleElementResize = (index, e, direction, ref, delta, position) => {
    const newElements = [...elements];
    newElements[index].width = ref.offsetWidth;
    newElements[index].height = ref.offsetHeight;
    newElements[index].x = position.x;
    newElements[index].y = position.y;
    setElements(newElements);
  };

  const handleElementRotate = (index, rotation) => {
    const newElements = [...elements];
    newElements[index].rotation = rotation;
    setElements(newElements);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-3xl">Canvas Board</h1>
      <div className="flex space-x-2">
        <Button onClick={() => setTool("pencil")}>Pencil</Button>
        <Button onClick={() => setTool("eraser")}>Eraser</Button>
        <Input type="file" onChange={handleImageUpload} />
      </div>
      <div className="relative">
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
        {elements.map((element, index) => (
          <Rnd
            key={index}
            size={{ width: element.width, height: element.height }}
            position={{ x: element.x, y: element.y }}
            onDragStop={(e, d) => handleElementDragStop(index, e, d)}
            onResize={(e, direction, ref, delta, position) =>
              handleElementResize(index, e, direction, ref, delta, position)
            }
            onRotate={(rotation) => handleElementRotate(index, rotation)}
            style={{
              transform: `rotate(${element.rotation}deg)`,
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {element.type === "image" && (
              <img src={element.src} alt="uploaded" style={{ width: "100%", height: "100%" }} />
            )}
          </Rnd>
        ))}
      </div>
    </div>
  );
};

export default Index;