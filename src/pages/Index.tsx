import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Heart, LogOut } from "lucide-react";
import MoodEntryForm from "@/components/MoodEntryForm";
import AIInsightCard from "@/components/AIInsightCard";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [currentMood, setCurrentMood] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleMoodSubmit = async (data: {
    mood: string;
    note: string;
    moodTags: string[];
    theme: string;
  }) => {
    setLoading(true);
    setCurrentMood(data.mood);

    try {
      // Apply theme
      document.documentElement.setAttribute('data-theme', data.theme);

      // Map mood to rating
      const moodRating = {
        "Happy": 5,
        "Calm": 4,
        "Excited": 5,
        "Sad": 2,
        "Anxious": 2,
        "Tired": 3,
      }[data.mood] || 3;

      // Save mood entry
      const { data: entry, error: entryError } = await supabase
        .from("mood_entries")
        .insert({
          user_id: user.id,
          mood_rating: moodRating,
          mood_tags: data.moodTags,
          note: data.note,
        })
        .select()
        .single();

      if (entryError) throw entryError;

      // Get AI insights
      const { data: insightData, error: insightError } = await supabase.functions.invoke(
        "mood-insights",
        {
          body: {
            mood: data.mood,
            note: data.note,
            moodTags: data.moodTags,
          },
        }
      );

      if (insightError) throw insightError;

      setAiInsight(insightData.insight);

      // Save AI insight
      await supabase.from("ai_insights").insert({
        entry_id: entry.id,
        insight_type: "mood_analysis",
        insight_text: insightData.insight,
      });

      toast({
        title: "Mood logged successfully! 💖",
        description: "Your AI insights are ready",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process your mood entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    document.documentElement.removeAttribute('data-theme');
    navigate("/auth");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-soft">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-colors duration-700">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full mood-gradient animate-float">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome to MoodCare
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Your AI-powered mental wellness companion
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="transition-all duration-300 hover:scale-105"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              View Journal
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="transition-all duration-300 hover:scale-105"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Daily Affirmation */}
        <Card className="glass-effect border-primary/20 animate-fade-in">
          <CardContent className="pt-6">
            <p className="text-center text-lg italic text-foreground/80">
              "Every day is a new opportunity to nurture your mental wellness. You're doing great! 💖"
            </p>
          </CardContent>
        </Card>

        {/* Mood Entry Form */}
        <Card className="glass-effect animate-scale-in">
          <CardHeader>
            <CardTitle className="text-2xl">Today's Check-In</CardTitle>
          </CardHeader>
          <CardContent>
            <MoodEntryForm onSubmit={handleMoodSubmit} loading={loading} />
          </CardContent>
        </Card>

        {/* AI Insights */}
        {aiInsight && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Your Personalized Insights</h2>
            <AIInsightCard insight={aiInsight} mood={currentMood} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
