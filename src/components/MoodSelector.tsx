import { useState } from "react";
import { Card } from "@/components/ui/card";

interface MoodOption {
  emoji: string;
  label: string;
  theme: string;
}

const moodOptions: MoodOption[] = [
  { emoji: "😊", label: "Happy", theme: "happy" },
  { emoji: "😌", label: "Calm", theme: "calm" },
  { emoji: "😢", label: "Sad", theme: "sad" },
  { emoji: "😰", label: "Anxious", theme: "anxious" },
  { emoji: "😴", label: "Tired", theme: "tired" },
  { emoji: "🤩", label: "Excited", theme: "excited" },
];

interface MoodSelectorProps {
  onMoodSelect: (mood: string, theme: string) => void;
  selectedMood: string;
}

const MoodSelector = ({ onMoodSelect, selectedMood }: MoodSelectorProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {moodOptions.map((mood) => (
        <Card
          key={mood.label}
          onClick={() => onMoodSelect(mood.label, mood.theme)}
          className={`
            p-6 cursor-pointer transition-all duration-300
            hover:scale-105 hover:shadow-lg
            ${selectedMood === mood.label
              ? "ring-2 ring-primary shadow-lg scale-105"
              : "hover:ring-1 hover:ring-primary/50"
            }
          `}
        >
          <div className="text-center space-y-2">
            <div className="text-5xl animate-float">{mood.emoji}</div>
            <p className="font-medium text-sm">{mood.label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MoodSelector;