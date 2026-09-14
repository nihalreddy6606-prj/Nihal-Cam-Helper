import { useState, useEffect } from 'react';

export function useProTips() {
  const [proTip, setProTip] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const mockTips = [
    "Use the Rule of Thirds to create more tension.",
    "Look for leading lines to draw the eye in.",
    "Try a lower angle to make the subject look powerful.",
    "Simplify the background to remove distractions.",
    "Wait for the 'Golden Hour' for softer, warmer light.",
    "Fill the frame to create a more intimate feel.",
    "Experiment with negative space for a minimalist look.",
    "Find a natural frame, like a window or branches.",
    "Center the subject for a strong, symmetrical impact.",
    "Shoot from a high angle to emphasize the environment.",
  ];

  const fetchProTip = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For now, we use mock tips.
      // To make this "real", you'd call: fetch('/api/pro-tip')
      const randomTip = mockTips[Math.floor(Math.random() * mockTips.length)];
      setProTip(randomTip);
    } catch (error) {
      console.error("AI Tip Error:", error);
      setProTip("Keep it simple and focus on the subject."); // Fallback tip
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchProTip, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return { proTip, isAnalyzing };
}
