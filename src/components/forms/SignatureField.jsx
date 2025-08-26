import React, { useRef, useState, useEffect } from 'react';
import { Upload, Pen, Trash2, Download, RotateCcw } from 'lucide-react';
import Button from '../common/Button';

const SignatureField = ({ 
  label, 
  required = false, 
  value, 
  onChange, 
  placeholder = "Click to sign or upload signature",
  maxWidth = 400,
  maxHeight = 200,
  disabled = false 
}) => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureMode, setSignatureMode] = useState('draw'); // 'draw' or 'upload'
  const [uploadedImage, setUploadedImage] = useState(null);
  const [canvasInitialized, setCanvasInitialized] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !canvasInitialized) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Set canvas size
      canvas.width = maxWidth;
      canvas.height = maxHeight;
      
      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      setCanvasInitialized(true);
    }
  }, [maxWidth, maxHeight, canvasInitialized]);

  // Load existing signature if provided
  useEffect(() => {
    if (value && canvasInitialized) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = value;
    }
  }, [value, canvasInitialized]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const getTouchPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const touch = e.touches[0];
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    if (disabled || signatureMode !== 'draw') return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = e.type.includes('touch') ? getTouchPos(e) : getMousePos(e);
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    
    e.preventDefault();
  };

  const draw = (e) => {
    if (!isDrawing || disabled || signatureMode !== 'draw') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = e.type.includes('touch') ? getTouchPos(e) : getMousePos(e);
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    e.preventDefault();
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas || !canvasInitialized) return;
    
    const signatureData = canvas.toDataURL('image/png');
    
    if (onChange) {
      onChange(signatureData);
    }
    
    e.preventDefault();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasInitialized) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setUploadedImage(null);
    
    if (onChange) {
      onChange(null);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate scaling to fit image in canvas while maintaining aspect ratio
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;
        const x = (canvas.width - newWidth) / 2;
        const y = (canvas.height - newHeight) / 2;
        
        // Draw image
        ctx.drawImage(img, x, y, newWidth, newHeight);
        
        const signatureData = canvas.toDataURL('image/png');
        setUploadedImage(signatureData);
        
        if (onChange) {
          onChange(signatureData);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    e.target.value = '';
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasInitialized) return;
    
    const link = document.createElement('a');
    link.download = 'signature.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const isEmpty = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasInitialized) return true;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Check if canvas has any non-white pixels
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const a = imageData.data[i + 3];
      
      // If any pixel is not white or transparent, signature exists
      if (a > 0 && (r !== 255 || g !== 255 || b !== 255)) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="signature-field">
      {/* Label */}
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <Button
          variant={signatureMode === 'draw' ? 'primary' : 'outline'}
          size="sm"
          icon={Pen}
          onClick={() => setSignatureMode('draw')}
          disabled={disabled}
        >
          Draw
        </Button>
        <Button
          variant={signatureMode === 'upload' ? 'primary' : 'outline'}
          size="sm"
          icon={Upload}
          onClick={() => {
            setSignatureMode('upload');
            fileInputRef.current?.click();
          }}
          disabled={disabled}
        >
          Upload
        </Button>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className={`border-2 border-gray-300 rounded-lg bg-white cursor-crosshair ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${signatureMode === 'draw' ? 'cursor-crosshair' : 'cursor-pointer'}`}
          style={{ 
            width: '100%', 
            maxWidth: `${maxWidth}px`, 
            height: `${maxHeight}px` 
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onClick={() => {
            if (signatureMode === 'upload') {
              fileInputRef.current?.click();
            }
          }}
        />
        
        {/* Placeholder text */}
        {canvasInitialized && isEmpty() && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm text-center px-4">
              {signatureMode === 'draw' 
                ? 'Draw your signature here' 
                : 'Click to upload signature image'
              }
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          icon={RotateCcw}
          onClick={clearSignature}
          disabled={disabled || !canvasInitialized || isEmpty()}
        >
          Clear
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={Download}
          onClick={downloadSignature}
          disabled={disabled || !canvasInitialized || isEmpty()}
        >
          Download
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        disabled={disabled}
      />

      {/* Instructions */}
      <p className="mt-2 text-xs text-gray-500">
        {signatureMode === 'draw' 
          ? 'Use your mouse or finger to draw your signature'
          : 'Upload an image file (PNG, JPG, etc.) containing your signature'
        }
      </p>
    </div>
  );
};

export default SignatureField;