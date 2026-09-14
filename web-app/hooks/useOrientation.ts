import { useState, useEffect } from 'react';

export interface OrientationState {
  roll: number;
  tilt: number;
}

export function useOrientation() {
  const [orientation, setOrientation] = useState<OrientationState>({ roll: 0, tilt: 0 });
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // roll: rotation around the Z axis (gamma)
      // tilt: rotation around the X axis (beta)
      setOrientation({
        roll: event.gamma || 0,
        tilt: event.beta || 0,
      });
    };

    // Check if the API exists
    if (window.DeviceOrientationEvent) {
      setIsSupported(true);
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        return permission === 'granted';
      } catch (e) {
        console.error('Orientation permission error:', e);
        return false;
      }
    }
    return true; // Not required on Android/Desktop
  };

  return { orientation, isSupported, requestPermission };
}
