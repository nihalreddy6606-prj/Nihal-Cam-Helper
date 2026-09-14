import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver } from '@google/mediapipe-tasks-vision';
import { Heuristics, PhotographyStyle, RecommendedPose, SceneRecommendation, LightingGuidance } from '../lib/heuristics';
import { PhotographyStyle as StyleEnum } from '../lib/types';

export function useVisionPipeline(videoRef: React.RefObject<HTMLVideoElement>, style: PhotographyStyle) {
  const [results, setResults] = useState({
    boundingBox: null as { x: number, y: number, width: number, height: number } | null,
    pose: { message: "", type: 'none' as any },
    scene: { message: "", type: 'none' as any },
    lighting: { message: "", type: 'none' as any },
    guidance: ""
  });

  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    async function init() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1
      });
      startDetection();
    }
    init();
  }, []);

  const startDetection = () => {
    const detect = async () => {
      if (videoRef.current && landmarkerRef.current) {
        const video = videoRef.current;
        if (video.currentTime !== 0) {
          const result = landmarkerRef.current.detectForVideo(video, performance.now());
          processVisionResults(result);
        }
      }
      requestRef.current = requestAnimationFrame(detect);
    };
    requestRef.current = requestAnimationFrame(detect);
  };

  const processVisionResults = (result: any) => {
    if (result.landmarks && result.landmarks.length > 0) {
      const landmarks = result.landmarks[0];

      // 1. Calculate Bounding Box
      const xs = landmarks.map((l: any) => l.x);
      const ys = landmarks.map((l: any) => l.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const box = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      };

      // 2. Pose Heuristics
      const pose = Heuristics.evaluatePose(landmarks, style);

      // 3. Scene Heuristics
      const scene = Heuristics.evaluateScene(box, style);

      // 4. Lighting Analysis (Approximate)
      const lighting = analyzeLighting(videoRef.current);

      // 5. Framing Guidance
      let guidance = "";
      if (box.width < 0.3) guidance = "Move closer to the subject";
      else if (box.width > 0.8) guidance = "Move further back";
      else if (box.x + box.width/2 < 0.3) guidance = "Center the subject";
      else if (box.x + box.width/2 > 0.7) guidance = "Center the subject";
      else guidance = "Great framing!";

      setResults({
        boundingBox: box,
        pose,
        scene,
        lighting,
        guidance
      });
    }
  };

  const analyzeLighting = (video: HTMLVideoElement | null) => {
    if (!video) return { message: "", type: 'none' as any };

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { message: "", type: 'none' as any };

    canvas.width = 50;
    canvas.height = 50;
    ctx.drawImage(video, 0, 0, 50, 50);

    const data = ctx.getImageData(0, 0, 50, 50).data;
    let totalLum = 0;
    let minLum = 1;
    let maxLum = 0;

    for (let i = 0; i < data.length; i += 4) {
      const lum = (0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]) / 255;
      totalLum += lum;
      if (lum < minLum) minLum = lum;
      if (lum > maxLum) maxLum = lum;
    }

    const avgLum = totalLum / (50 * 50);
    const contrast = maxLum - minLum;

    return Heuristics.evaluateLighting(avgLum, contrast);
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return results;
}
