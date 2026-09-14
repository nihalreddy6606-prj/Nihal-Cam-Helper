"use client";

import React, { useState } from 'react';
import { useCamera } from '../hooks/useCamera';
import { useOrientation } from '../hooks/useOrientation';
import { useVisionPipeline } from '../hooks/useVisionPipeline';
import { useProTips } from '../hooks/useProTips';
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
  const { proTip } = useProTips();

  const handleStart = async () => {
    const motionGranted = await requestPermission();
    const cameraGranted = await startCamera();
    if (motionGranted && cameraGranted) {
      setIsStarted(true);
    }
  };

  const triggerCapture = async () => {
    setIsCapturing(true);
    try {
      if (videoRef.current) {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg');
          const link = document.createElement('a');
          link.download = `capture-${Date.now()}.jpg`;
          link.href = dataUrl;
          link.click();
        }
      }
    } catch (err) {
      console.error("Capture failed:", err);
    } finally {
      setTimeout(() => setIsCapturing(false), 150);
    }
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
    return "Perfectly Level";
  };

  if (!isStarted) {
    return (
      <div className="camera-container flex flex-col items-center justify-center p-6 text-center fade-in">
        <h1 className="text-white text-2xl font-light tracking-widest uppercase mb-12">Nihal's Cam Helper</h1>
        <button
          onClick={handleStart}
          className="border border-white/30 text-white px-10 py-3 rounded-full text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500"
        >
          Begin
        </button>
        {error && <p className="absolute bottom-20 text-red-400 text-xs font-mono">{error}</p>}
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
        <div className="absolute inset-0 bg-white z-50 transition-opacity duration-150 opacity-80" />
      )}

      {vision.boundingBox && (
        <div
          className="absolute border border-white/30 transition-all duration-300 pointer-events-none"
          style={{
            left: `${vision.boundingBox.x * 100}%`,
            top: `${vision.boundingBox.y * 100}%`,
            width: `${vision.boundingBox.width * 100}%`,
            height: `${vision.boundingBox.height * 100}%`,
          }}
        />
      )}

      <div className="absolute inset-0 flex flex-col items-center pointer-events-none">
        <div className="mt-12 flex gap-4 pointer-events-auto">
          {Object.values(PhotographyStyle).map(s => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={clsx(
                "text-[10px] tracking-widest uppercase transition-all duration-300",
                style === s ? "text-white opacity-100" : "text-white/40 opacity-60 hover:opacity-100"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-20">
          <GuidanceArrow direction={getArrowDirection()} />
        </div>

        <div className="mt-4 text-white/70 font-light text-sm tracking-wide text-center max-w-[80%] transition-all duration-500">
          {combinedGuidance()}
        </div>

        {proTip && (
          <div className="mt-4 px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white/50 text-[11px] italic text-center max-w-[80%] transition-all duration-1000">
            {proTip}
          </div>
        )}
      </div>

      <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center">
        <button
          onClick={triggerCapture}
          className="w-16 h-16 rounded-full border border-white/40 flex items-center justify-center active:scale-90 transition-all duration-300 pointer-events-auto"
        >
          <div className="w-12 h-12 rounded-full border border-white/20" />
        </button>
      </div>
    </div>
  );
}
