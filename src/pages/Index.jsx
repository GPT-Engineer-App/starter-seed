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
  const [isDragging, setIsDragging] = useState(false);

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
    newElements[index].x = Math.max(0, Math.min(d.x, canvasRef.current.width - newElements[index].width));
    newElements[index].y = Math.max(0, Math.min(d.y, canvasRef.current.height - newElements[index].height));
    setElements(newElements);
    setIsDragging(false);
  };

  const handleElementResize = (index, e, direction, ref, delta, position) => {
    const newElements = [...elements];
    newElements[index].width = Math.min(ref.offsetWidth, canvasRef.current.width - position.x);
    newElements[index].height = Math.min(ref.offsetHeight, canvasRef.current.height - position.y);
    newElements[index].x = Math.max(0, Math.min(position.x, canvasRef.current.width - newElements[index].width));
    newElements[index].y = Math.max(0, Math.min(position.y, canvasRef.current.height - newElements[index].height));
    setElements(newElements);
  };

  const handleElementRotate = (index, rotation) => {
    const newElements = [...elements];
    newElements[index].rotation = rotation;
    setElements(newElements);
  };

  const handleElementClick = (index) => {
    setSelectedElement(index);
  };

  const handleCanvasClick = () => {
    setSelectedElement(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Delete" && selectedElement !== null) {
      const newElements = elements.filter((_, i) => i !== selectedElement);
      setElements(newElements);
      setSelectedElement(null);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedElement, elements]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-3xl">Canvas Board</h1>
      <div className="flex space-x-2">
        <Button onClick={() => setTool("pencil")}>Pencil</Button>
        <Button onClick={() => setTool("eraser")}>Eraser</Button>
        <Input type="file" onChange={handleImageUpload} />
      </div>
      <div className="relative" onClick={handleCanvasClick}>
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
            onDragStart={() => setIsDragging(true)}
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
              border: selectedElement === index && isDragging ? "2px dashed blue" : "none",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleElementClick(index);
            }}
          >
            {element.type === "image" && (
              <img src={element.src} alt="uploaded" style={{ width: "100%", height: "100%" }} />
            )}
            {selectedElement === index && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 10,
                    height: 10,
                    backgroundColor: "red",
                    cursor: "pointer",
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    // Implement rotation logic here
                  }}
                />
                {["top-left", "top-right", "bottom-left", "bottom-right"].map((corner) => (
                  <div
                    key={corner}
                    style={{
                      position: "absolute",
                      [corner.split("-")[0]]: -5,
                      [corner.split("-")[1]]: -5,
                      width: 10,
                      height: 10,
                      backgroundColor: "blue",
                      cursor: `${corner.split("-")[0]}-${corner.split("-")[1]}-resize`,
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      // Implement resize logic here
                    }}
                  />
                ))}
              </>
            )}
          </Rnd>
        ))}
      </div>
    </div>
  );
};

export default Index;