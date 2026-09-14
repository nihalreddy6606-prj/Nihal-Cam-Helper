"use client";

import React, { useState, useRef } from 'react';
import { useCamera } from '../hooks/useCamera';
import { useOrientation } from '../hooks/useOrientation';
import { useVisionPipeline } from '../hooks/useVisionPipeline';
import { GuidanceArrow, ArrowDirection } from '../components/GuidanceArrow';
import { PhotographyStyle } from '../lib/types';
import { clsx } from 'clsx';

export default function CameraPage() {
  const [style, setStyle] = useState<PhotographyStyle>(PhotographyStyle.Standard);
  const [isStarted, setIsStarted] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const { videoRef, stream, startCamera, error } = useCamera();
  const { orientation, requestPermission } = useOrientation();
  const vision = useVisionPipeline(videoRef, style);

  const handleStart = async () => {
    const motionGranted = await requestPermission();
    const cameraGranted = await startCamera();
    if (motionGranted && cameraGranted) {
      setIsStarted(true);
    }
  };

  const triggerCapture = () => {
    setIsCapturing(true);
    setTimeout(() => setIsCapturing(false), 150);
    // In a real app, we would snap a photo from the canvas here
    alert("📸 Photo captured successfully!");
  };

  const getArrowDirection = (): ArrowDirection => {
    if (Math.abs(orientation.roll) > 5) {
      return orientation.roll > 0 ? 'left' : 'right';
    }
    if (Math.abs(orientation.tilt) > 5) {
      return orientation.tilt > 0 ? 'down' : 'up';
    }
    if (vision.guidance === "Center the subject") {
      if (vision.boundingBox) {
        if (vision.boundingBox.x + vision.boundingBox.width/2 < 0.3) return 'right';
        if (vision.boundingBox.x + vision.boundingBox.width/2 > 0.7) return 'left';
      }
    }
    return 'none';
  };

  const combinedGuidance = () => {
    if (vision.lighting.type !== 'perfect' && vision.lighting.type !== 'none') {
      return vision.lighting.message;
    }
    if (vision.guidance) return vision.guidance;
    if (vision.pose.message) return vision.pose.message;
    if (vision.scene.message) return vision.scene.message;
    if (Math.abs(orientation.roll) > 5) return orientation.roll > 0 ? "Tilt Left" : "Tilt Right";
    if (Math.abs(orientation.tilt) > 5) return orientation.tilt > 0 ? "Tilt Up" : "Tilt Down";
    return "Perfectly Level!";
  };

  if (!isStarted) {
    return (
      <div className="camera-container flex items-center justify-center">
        <button
          onClick={handleStart}
          className="bg-white text-black px-8 py-4 rounded-full font-bold text-xl shadow-lg active:scale-95 transition-transform"
        >
          Start Experience
        </button>
        {error && <p className="absolute bottom-20 text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="camera-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="video-feed"
      />

      {isCapturing && (
        <div className="absolute inset-0 bg-white opacity-70 z-50 transition-opacity duration-150" />
      )}

      {vision.boundingBox && (
        <div
          className="absolute border-4 border-blue-500 transition-all duration-200"
          style={{
            left: `${vision.boundingBox.x * 100}%`,
            top: `${vision.boundingBox.y * 100}%`,
            width: `${vision.boundingBox.width * 100}%`,
            height: `${vision.boundingBox.height * 100}%`,
          }}
        />
      )}

      <div className="absolute inset-0 flex flex-col items-center pointer-events-none">
        <div className="mt-16 flex gap-2 pointer-events-auto">
          {Object.values(PhotographyStyle).map(s => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={clsx(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                style === s ? "bg-blue-600 text-white" : "bg-black/50 text-white"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-10">
          <GuidanceArrow direction={getArrowDirection()} />
        </div>

        <div className="mt-5 px-4 py-2 bg-black/60 rounded-xl text-white font-medium text-center max-w-[80%]">
          {combinedGuidance()}
        </div>
      </div>

      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-8">
        <button
          onClick={triggerCapture}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform"
        >
          <div className="w-16 h-16 bg-white rounded-full" />
        </button>
      </div>
    </div>
  );
}
