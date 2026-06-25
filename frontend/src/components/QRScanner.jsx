import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Image, RefreshCw, Upload, Sparkles } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onScanFailure }) => {
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'file'
  const [errorMsg, setErrorMsg] = useState('');
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize html5QrCode once on mount
  useEffect(() => {
    html5QrCodeRef.current = new Html5Qrcode('qr-reader-viewport');
    
    // Get cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          setSelectedCameraId(devices[0].id);
        } else {
          setErrorMsg('No cameras detected. You can still scan using ticket files!');
        }
      })
      .catch((err) => {
        console.error('Error getting cameras', err);
        setErrorMsg('Camera access error. Please use file upload fallback.');
      });

    return () => {
      // Clean up scanner on unmount
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch((e) => console.error('Stop error on unmount', e));
      }
    };
  }, []);

  const startScanning = async () => {
    if (!selectedCameraId) {
      setErrorMsg('Please select a camera first.');
      return;
    }
    setErrorMsg('');
    setIsScanning(true);

    try {
      await html5QrCodeRef.current.start(
        selectedCameraId,
        {
          fps: 10,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          }
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          // Stop scanning after success
          stopScanning();
        },
        (errorMessage) => {
          if (onScanFailure) onScanFailure(errorMessage);
        }
      );
    } catch (err) {
      console.error('Failed to start scanning', err);
      setErrorMsg('Failed to start camera. Please verify permissions.');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Failed to stop scanning', err);
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg('');
    try {
      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      onScanSuccess(decodedText);
    } catch (err) {
      console.error('File scan error', err);
      setErrorMsg('Could not detect a valid QR code in this image. Please try another file.');
    }
  };

  const handleCameraChange = async (e) => {
    const newCameraId = e.target.value;
    setSelectedCameraId(newCameraId);
    if (isScanning) {
      await stopScanning();
      // Small timeout to allow stop to finish
      setTimeout(async () => {
        setSelectedCameraId(newCameraId);
        setIsScanning(true);
        try {
          await html5QrCodeRef.current.start(
            newCameraId,
            {
              fps: 10,
              qrbox: (width, height) => {
                const size = Math.min(width, height) * 0.7;
                return { width: size, height: size };
              }
            },
            (decodedText) => {
              onScanSuccess(decodedText);
              stopScanning();
            },
            (errorMessage) => {
              if (onScanFailure) onScanFailure(errorMessage);
            }
          );
        } catch (err) {
          console.error(err);
          setIsScanning(false);
        }
      }, 300);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Mode Switcher */}
      <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => { stopScanning(); setScanMode('camera'); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            scanMode === 'camera'
              ? 'bg-white dark:bg-slate-900 shadow-sm text-teal-600 dark:text-teal-400'
              : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
          }`}
        >
          <Camera className="h-3.5 w-3.5" /> Live Camera
        </button>
        <button
          type="button"
          onClick={() => { stopScanning(); setScanMode('file'); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            scanMode === 'file'
              ? 'bg-white dark:bg-slate-900 shadow-sm text-teal-650 dark:text-teal-400'
              : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
          }`}
        >
          <Image className="h-3.5 w-3.5" /> Upload Image
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/50 text-red-600 dark:text-red-450 rounded-xl text-xs text-center font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      {scanMode === 'camera' ? (
        <div className="space-y-4 flex flex-col items-center">
          {/* Viewport container */}
          <div className="relative w-full aspect-square max-w-[340px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/95 shadow-2xl flex flex-col items-center justify-center">
            {/* Real Reader target */}
            <div id="qr-reader-viewport" className="absolute inset-0 w-full h-full object-cover [&>video]:object-cover [&>video]:w-full [&>video]:h-full"></div>

            {/* Simulated overlays shown when not scanning */}
            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-[2px] z-10 space-y-3 p-4">
                <span className="p-4 rounded-full bg-white/5 border border-white/10 text-white/50 text-2xl">
                  🎥
                </span>
                <p className="text-xs font-bold text-slate-350">Camera scanner is inactive</p>
                <button
                  type="button"
                  onClick={startScanning}
                  className="px-5 py-2.5 bg-gradient-brand text-white font-bold rounded-xl shadow-md transition-all uppercase tracking-wider text-[10px]"
                >
                  Start Scanning
                </button>
              </div>
            )}

            {/* Corner Targets for scanning */}
            {isScanning && (
              <>
                <div className="absolute inset-6 border border-white/20 rounded-2xl pointer-events-none z-10"></div>
                <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl z-10"></div>
                <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr z-10"></div>
                <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl z-10"></div>
                <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-white rounded-br z-10"></div>
                <div className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-teal-500/30 via-teal-400 to-teal-500/30 shadow-[0_0_8px_rgba(45,212,191,0.8)] animate-scan pointer-events-none z-10"></div>
              </>
            )}
          </div>

          {/* Camera Selection & Controls */}
          {cameras.length > 1 && (
            <div className="w-full max-w-[340px] space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" /> Select Camera:
              </label>
              <select
                value={selectedCameraId}
                onChange={handleCameraChange}
                className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-bold"
              >
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isScanning && (
            <button
              type="button"
              onClick={stopScanning}
              className="w-full max-w-[340px] py-2.5 bg-red-500 hover:bg-red-650 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all"
            >
              Stop Camera
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Upload viewport */}
          <div
            onClick={() => fileInputRef.current.click()}
            className="w-full max-w-[340px] mx-auto aspect-square rounded-3xl border-2 border-dashed border-slate-250 dark:border-slate-850 hover:border-teal-500/50 bg-slate-50/50 dark:bg-slate-950/20 cursor-pointer flex flex-col items-center justify-center text-center p-6 space-y-3 transition-all hover:scale-[1.01] hover:shadow-lg"
          >
            <Upload className="h-10 w-10 text-slate-400" />
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-350">Upload Ticket QR Image</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                Drag and drop or click to upload a screenshot or image of the Ticket QR code.
              </p>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default QRScanner;
