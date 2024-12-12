import React, { useState, useRef, useEffect } from 'react';
import 'fabric'; 
const fabric = window.fabric; 

const MAX_CANVAS_WIDTH = 800;
const MAX_CANVAS_HEIGHT = 600;


const BRUSH_TYPES = [
  { name: 'Pen', type: 'PencilBrush' },
  { name: 'Spray', type: 'SprayBrush' },
  { name: 'Circle', type: 'CircleBrush' },
];

const PRESET_COLORS = [
  '#FFFFFF', // White
  '#000000', // Black
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
];

const App = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [canvasWidth, setCanvasWidth] = useState(MAX_CANVAS_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(MAX_CANVAS_HEIGHT);
  const [brushSize, setBrushSize] = useState(20);
  const [brushColor, setBrushColor] = useState('#FFFFFF');
  const [brushType, setBrushType] = useState('PencilBrush');
  const [customColor, setCustomColor] = useState('#FFFFFF');
  const [isCustomColorMode, setIsCustomColorMode] = useState(false);
  const fabricCanvasRef = useRef(null);
  const canvasContainerRef = useRef(null);

  const calculateCanvasSize = (imgWidth, imgHeight) => {
    // Calculate scaling to fit within max dimensions while maintaining aspect ratio
    const scaleX = MAX_CANVAS_WIDTH / imgWidth;
    const scaleY = MAX_CANVAS_HEIGHT / imgHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Use 1 to prevent upscaling

    const newWidth = Math.round(imgWidth * scale);
    const newHeight = Math.round(imgHeight * scale);

    return { width: newWidth, height: newHeight };
  };

  useEffect(() => {
    const canvasElement = document.getElementById('canvas');
    if (!canvasElement) return;

    try {
      fabricCanvasRef.current = new fabric.Canvas(canvasElement, {
        isDrawingMode: true,
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: 'black',
      });

      updateBrushSettings();
      clearCanvas();
    } catch (error) {
      console.error('Error initializing canvas:', error);
    }

    return () => {
      fabricCanvasRef.current?.dispose();
    };
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    updateBrushSettings();
  }, [brushSize, brushColor, brushType]);

  const updateBrushSettings = () => {
    if (!fabricCanvasRef.current) return;

    fabricCanvasRef.current.isDrawingMode = true;

    let brushInstance;
    switch (brushType) {
      case 'PencilBrush':
        brushInstance = new fabric.PencilBrush(fabricCanvasRef.current);
        break;
      case 'CircleBrush':
        brushInstance = new fabric.CircleBrush(fabricCanvasRef.current);
        break;
      case 'SprayBrush':
        brushInstance = new fabric.SprayBrush(fabricCanvasRef.current);
        break;
      default:
        brushInstance = new fabric.PencilBrush(fabricCanvasRef.current);
    }

    brushInstance.width = brushSize;
    brushInstance.color = brushColor;

    fabricCanvasRef.current.freeDrawingBrush = brushInstance;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgSrc = event.target.result;

      const imageElement = new Image();
      imageElement.onload = () => {
        // Calculate new canvas dimensions
        const { width: newWidth, height: newHeight } = calculateCanvasSize(
          imageElement.width, 
          imageElement.height
        );

        // Update canvas size
        setCanvasWidth(newWidth);
        setCanvasHeight(newHeight);

        setOriginalImage(imgSrc);

        fabric.Image.fromURL(imgSrc, (img) => {
          if (!fabricCanvasRef.current) return;

          const scale = Math.min(
            newWidth / img.width,
            newHeight / img.height
          );

          img.scale(scale);

          fabricCanvasRef.current.setBackgroundImage(
            img,
            fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current),
            {
              scaleX: scale,
              scaleY: scale,
              originX: 'left',
              originY: 'top',
            }
          );
        });
      };
      imageElement.src = imgSrc;
    };
    reader.readAsDataURL(file);
  };

  const generateMask = () => {
    if (!fabricCanvasRef.current) return;

    try {
      const maskDataUrl = fabricCanvasRef.current.toDataURL({
        format: 'png',
        backgroundColor: 'black',
      });
      setMaskImage(maskDataUrl);
    } catch (error) {
      console.error('Error generating mask:', error);
    }
  };

  const downloadMask = () => {
    if (!maskImage) {
      alert('Please generate a mask first.');
      return;
    }

    const link = document.createElement('a');
    link.href = maskImage;
    link.download = 'mask.png';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearCanvas = () => {
    if (!fabricCanvasRef.current) return;

    fabricCanvasRef.current.clear();
    if (originalImage) {
      fabric.Image.fromURL(originalImage, (img) => {
        const scale = Math.min(
          canvasWidth / img.width,
          canvasHeight / img.height
        );

        fabricCanvasRef.current.setBackgroundImage(
          img,
          fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current),
          {
            scaleX: scale,
            scaleY: scale,
            originX: 'left',
            originY: 'top',
          }
        );
      });
    }
    setMaskImage(null);
  };

  const handleColorChange = (color) => {
    if (color === 'custom') {
      setIsCustomColorMode(true);
      document.getElementById('custom-color-picker').click();
    } else {
      setIsCustomColorMode(false);
      setBrushColor(color);
    }
  };

  const handleCustomColorChange = (e) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    setBrushColor(newColor);
    setIsCustomColorMode(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 py-10 px-4 flex flex-col items-center justify-center w-[100%]" >
      <div className="max-w-4xl bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden ">
        <div className="p-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-center mb-8">
            Image Masking Studio
          </h1>

          <div className="mb-6">
            <div className="relative border-2 border-dashed border-purple-300 rounded-lg p-4 text-center hover:border-purple-500 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 font-semibold">
                  Click to upload or drag and drop an image
                </p>
                <span className="text-sm text-gray-500">
                  PNG, JPG up to 10MB
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brush Size: 
                <span className="ml-2 text-purple-600 font-bold">{brushSize}px</span>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brush Type
              </label>
              <select
                value={brushType}
                onChange={(e) => setBrushType(e.target.value)}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {BRUSH_TYPES.map((brush) => (
                  <option key={brush.type} value={brush.type}>
                    {brush.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brush Color
            </label>
            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      style={{ backgroundColor: color }}
                      className={`w-8 h-8 rounded-full border-2 ${
                        !isCustomColorMode && brushColor === color 
                          ? 'border-purple-500 shadow-lg scale-110' 
                          : 'border-gray-300'
                      } transform transition-all`}
                    />
                  ))}
                  <button
                    onClick={() => handleColorChange('custom')}
                    className={`w-8 h-8 rounded-full border-2 bg-gradient-to-br from-purple-500 to-pink-500 ${
                      isCustomColorMode 
                        ? 'border-purple-500 shadow-lg scale-110' 
                        : 'border-gray-300'
                    } transform transition-all flex items-center justify-center text-white text-xs`}
                  >
                    +
                  </button>
                </div>
                <input
                  id="custom-color-picker"
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="absolute opacity-0 pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div className="mb-6 relative">
            <canvas
              id="canvas"
              className="border-4 border-purple-200 rounded-xl shadow-lg"
              width={canvasWidth}
              height={canvasHeight}
            />
            
          </div>

          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={generateMask}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105 hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Generate Mask</span>
            </button>
            <button
              onClick={clearCanvas}
              className="flex items-center space-x-2 bg-white text-purple-600 border-2 border-purple-300 hover:bg-purple-50 font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105 hover:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear Canvas</span>
            </button>
          </div>

          {originalImage && maskImage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 shadow-lg transform transition-all hover:scale-[1.02]">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                  Original Image
                </h3>
                <img
                  src={originalImage}
                  alt="Uploaded original"
                  className="w-full rounded-xl shadow-md border-4 border-white"
                />
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 shadow-lg transform transition-all hover:scale-[1.02]">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                  Generated Mask
                </h3>
                <div className="space-y-4">
                  <img
                    src={maskImage}
                    alt="Generated mask"
                    className="w-full rounded-xl shadow-md border-4 border-white"
                  />
                  <button
                    onClick={downloadMask}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105 hover:shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Mask</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="text-center text-white mt-6 text-sm opacity-70">
        Image Masking Studio. Created with love by rishi💙.
      </div>
    </div>
  );
};

export default App;