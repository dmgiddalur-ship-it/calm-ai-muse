import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import MoodSelector from "./MoodSelector";

interface MoodEntryFormProps {
  onSubmit: (data: {
    mood: string;
    note: string;
    moodTags: string[];
    theme: string;
  }) => Promise<void>;
  loading: boolean;
}

const suggestedTags = [
  "work", "family", "health", "relationships", "self-care",
  "stress", "gratitude", "achievement", "rest", "social"
];

const MoodEntryForm = ({ onSubmit, loading }: MoodEntryFormProps) => {
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [note, setNote] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleMoodSelect = (mood: string, theme: string) => {
    setSelectedMood(mood);
    setSelectedTheme(theme);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    await onSubmit({
      mood: selectedMood,
      note,
      moodTags: selectedTags,
      theme: selectedTheme,
    });

    // Reset form
    setSelectedMood("");
    setSelectedTheme("");
    setNote("");
    setSelectedTags([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label className="text-lg font-semibold">How are you feeling today?</Label>
        <MoodSelector
          onMoodSelect={handleMoodSelect}
          selectedMood={selectedMood}
        />
      </div>

      {selectedMood && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-3">
            <Label className="text-lg font-semibold">What's on your mind? (Optional)</Label>
            <Textarea
              placeholder="Share your thoughts, feelings, or what happened today..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[120px] resize-none transition-all duration-300 focus:scale-[1.01]"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-lg font-semibold">Tags (Optional)</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer transition-all duration-300 hover:scale-105"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full mood-gradient text-white hover:opacity-90 transition-all duration-300 hover:scale-[1.02]"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Getting AI Insights...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Get AI Insights & Support
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
};

export default MoodEntryForm;