import { PhotographyStyle, RecommendedPose, SceneRecommendation, LightingGuidance } from './types';

export class Heuristics {
    static evaluatePose(keypoints: any, style: PhotographyStyle): RecommendedPose {
        // keypoints is expected to be an array of landmarks from MediaPipe
        // MediaPipe indices: 11: left shoulder, 12: right shoulder, 23: left hip, 24: right hip
        const leftShoulder = keypoints[11];
        const rightShoulder = keypoints[12];
        const leftHip = keypoints[23];
        const rightHip = keypoints[24];

        if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
            return { message: "", type: 'none' };
        }

        const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);

        // 1. Side Profile
        const profileThreshold = (style === PhotographyStyle.HighFashion) ? 0.15 : 0.1;
        if (shoulderWidth < profileThreshold) {
            return { message: "Try a side profile for more depth", type: 'sideProfile' };
        }

        // 2. Symmetry
        const shoulderSlope = (rightShoulder.y - leftShoulder.y) / (rightShoulder.x - leftShoulder.x);
        const symmetryThreshold = (style === PhotographyStyle.Cinematic) ? 0.3 : 0.2;
        if (Math.abs(shoulderSlope) > symmetryThreshold) {
            return { message: "Try to align your shoulders symmetrically", type: 'symmetrical' };
        }

        // 3. Power Pose
        if (shoulderWidth > 0.3 && Math.abs(leftHip.y - rightHip.y) < 0.05) {
            if (style === PhotographyStyle.Minimalist) {
                return { message: "Shift your weight to one leg for a more relaxed look", type: 'relaxed' };
            }
            return { message: "Stand with shoulders back for a power pose", type: 'powerPose' };
        }

        return { message: "Shift your weight to one leg for a more relaxed look", type: 'relaxed' };
    }

    static evaluateScene(boundingBox: { x: number, y: number, width: number, height: number }, style: PhotographyStyle): SceneRecommendation {
        const centerX = boundingBox.x + boundingBox.width / 2;
        const width = boundingBox.width;

        // 1. Rule of Thirds
        if ((centerX > 0.1 && centerX < 0.3) || (centerX > 0.7 && centerX < 0.9)) {
            return { message: "Perfectly centered! Great for symmetrical architecture", type: 'centered' };
        }

        // 2. Centered
        if (centerX > 0.4 && centerX < 0.6) {
            if (style === PhotographyStyle.HighFashion) {
                return { message: "Perfectly centered! Great for symmetrical architecture", type: 'centered' };
            }
            return { message: "Place the subject on the left or right third for a more dynamic shot", type: 'ruleOfThirds' };
        }

        // 3. Negative Space
        const negativeSpaceThreshold = (style === PhotographyStyle.Minimalist) ? 0.15 : 0.2;
        if (width < negativeSpaceThreshold) {
            return { message: "Increase the negative space around the subject for a minimalist look", type: 'negativeSpace' };
        }

        return { message: "", type: 'none' };
    }

    static evaluateLighting(luminance: number, contrast: number): LightingGuidance {
        if (luminance < 0.3) {
            return { message: "Increase lighting or use a flash", type: 'tooDark' };
        } else if (luminance > 0.8) {
            return { message: "Reduce exposure or move away from direct light", type: 'tooBright' };
        } else if (contrast > 0.7) {
            return { message: "Soften the light to reduce harsh shadows", type: 'harshShadows' };
        } else if (luminance > 0.4 && luminance < 0.7) {
            return { message: "Lighting looks great!", type: 'perfect' };
        }
        return { message: "", type: 'none' };
    }
}
