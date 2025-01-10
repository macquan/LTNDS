import React, { useRef, useState } from 'react';

const Sketchpad = ({ onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('draw'); // draw, fill, shape
  const [color, setColor] = useState('black');
  const [lineWidth, setLineWidth] = useState(2);
  const [startPos, setStartPos] = useState(null); // For shape tools

  const getCanvasContext = () => canvasRef.current.getContext('2d');

  const startDrawing = e => {
    if (currentTool === 'draw' || currentTool === 'shape') {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ctx = getCanvasContext();
      ctx.beginPath();
      ctx.moveTo(x, y);

      if (currentTool === 'shape') {
        setStartPos({ x, y });
      } else {
        setIsDrawing(true);
      }
    }
  };

  const draw = e => {
    if (!isDrawing && currentTool !== 'shape') return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'draw') {
      const ctx = getCanvasContext();
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  };

  const stopDrawing = e => {
    if (currentTool === 'draw') {
      setIsDrawing(false);
    } else if (currentTool === 'shape') {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (startPos) {
        const ctx = getCanvasContext();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;

        const width = x - startPos.x;
        const height = y - startPos.y;

        if (currentTool === 'shape') {
          // Example: Draw Rectangle
          ctx.strokeRect(startPos.x, startPos.y, width, height);
        }
      }
      setStartPos(null);
    }
  };

  const fillCanvas = e => {
    if (currentTool !== 'fill') return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = getCanvasContext();
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Simple full-canvas fill
  };

  const clearCanvas = () => {
    const ctx = getCanvasContext();
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleSave = () => {
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Tool Selector */}
      <div style={{ marginBottom: '10px' }}>
        <label>
          Tool:
          <select
            value={currentTool}
            onChange={e => setCurrentTool(e.target.value)}
            style={{ marginLeft: '5px' }}
          >
            <option value='draw'>Draw</option>
            <option value='fill'>Fill</option>
            <option value='shape'>Rectangle</option>
          </select>
        </label>
        <label style={{ marginLeft: '20px' }}>
          Color:
          <input
            type='color'
            value={color}
            onChange={e => setColor(e.target.value)}
            style={{ marginLeft: '5px' }}
          />
        </label>
        <label style={{ marginLeft: '20px' }}>
          Line Width:
          <input
            type='number'
            value={lineWidth}
            min='1'
            max='10'
            onChange={e => setLineWidth(Number(e.target.value))}
            style={{ marginLeft: '5px', width: '50px' }}
          />
        </label>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        style={{
          border: '1px solid #ddd',
          cursor: 'crosshair'
        }}
        onMouseDown={e =>
          currentTool === 'fill' ? fillCanvas(e) : startDrawing(e)
        }
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />
      <div style={{ marginTop: '10px' }}>
        <button className='btn btn-danger' onClick={clearCanvas}>
          Clear
        </button>
        <button className='btn btn-success ml-2' onClick={handleSave}>
          Save Sketch
        </button>
      </div>
    </div>
  );
};

export default Sketchpad;
