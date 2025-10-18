import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Calendar, TrendingUp, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface MoodEntry {
  id: string;
  mood_rating: number;
  mood_tags: string[];
  note: string;
  entry_date: string;
  created_at: string;
}

const moodEmojis: { [key: number]: string } = {
  1: "😢",
  2: "😔",
  3: "😐",
  4: "😊",
  5: "🤩",
};

const Dashboard = () => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
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
      fetchEntries();
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

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .order("entry_date", { ascending: false })
        .limit(30);

      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      console.error("Error fetching entries:", error);
      toast({
        title: "Error",
        description: "Failed to load your mood history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const calculateAverageMood = () => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, entry) => acc + entry.mood_rating, 0);
    return (sum / entries.length).toFixed(1);
  };

  const getStreakDays = () => {
    // Simple streak calculation based on consecutive days
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].entry_date);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-soft">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Your Mood Journal
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your emotional wellness journey
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="transition-all duration-300 hover:scale-105"
            >
              <Heart className="w-4 h-4 mr-2" />
              New Entry
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{entries.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Days tracked
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{calculateAverageMood()}/5</div>
              <p className="text-xs text-muted-foreground mt-1">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Heart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{getStreakDays()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Consecutive days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mood History */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No entries yet. Start tracking your mood today!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.01]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">
                          {moodEmojis[entry.mood_rating] || "😐"}
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {format(new Date(entry.entry_date), "EEEE, MMMM d, yyyy")}
                          </p>
                          {entry.note && (
                            <p className="text-sm text-muted-foreground">
                              {entry.note}
                            </p>
                          )}
                          {entry.mood_tags && entry.mood_tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {entry.mood_tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(entry.created_at), "h:mm a")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;