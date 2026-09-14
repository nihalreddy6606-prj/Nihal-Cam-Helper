export enum PhotographyStyle {
    Standard = "Standard",
    Cinematic = "Cinematic",
    Minimalist = "Minimalist",
    HighFashion = "High Fashion"
}

export interface LightingGuidance {
    message: string;
    type: 'tooDark' | 'tooBright' | 'harshShadows' | 'perfect' | 'none';
}

export interface RecommendedPose {
    message: string;
    type: 'sideProfile' | 'powerPose' | 'relaxed' | 'symmetrical' | 'none';
}

export interface SceneRecommendation {
    message: string;
    type: 'ruleOfThirds' | 'leadLines' | 'negativeSpace' | 'goldenRatio' | 'centered' | 'none';
}

export const StyleParams = {
    [PhotographyStyle.Standard]: {
        framingTolerance: 0.2,
        preferredScale: { min: 0.3, max: 0.7 }
    },
    [PhotographyStyle.Cinematic]: {
        framingTolerance: 0.3,
        preferredScale: { min: 0.2, max: 0.5 }
    },
    [PhotographyStyle.Minimalist]: {
        framingTolerance: 0.1,
        preferredScale: { min: 0.1, max: 0.4 }
    },
    [PhotographyStyle.HighFashion]: {
        framingTolerance: 0.15,
        preferredScale: { min: 0.5, max: 0.9 }
    },
};
