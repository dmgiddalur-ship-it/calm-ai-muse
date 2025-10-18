import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Music, Heart } from "lucide-react";

interface AIInsightCardProps {
  insight: string;
  mood: string;
}

const AIInsightCard = ({ insight, mood }: AIInsightCardProps) => {
  // Parse the AI response to extract structured sections
  const parseInsight = (text: string) => {
    const sections = {
      message: '',
      activities: [] as string[],
      songs: [] as string[],
    };

    // Split by section headers
    const messagePart = text.match(/MESSAGE:(.*?)(?=ACTIVITIES:|$)/s);
    const activitiesPart = text.match(/ACTIVITIES:(.*?)(?=SONGS:|$)/s);
    const songsPart = text.match(/SONGS:(.*?)$/s);

    if (messagePart) {
      sections.message = messagePart[1].trim();
    }

    if (activitiesPart) {
      const activityText = activitiesPart[1].trim();
      // Split by numbered list items or bullet points
      const activityMatches = activityText.split(/\n(?=\d+\.|\*|-)/);
      sections.activities = activityMatches
        .map(a => a.trim())
        .filter(a => a.length > 0);
    }

    if (songsPart) {
      const songText = songsPart[1].trim();
      const songMatches = songText.split('\n');
      sections.songs = songMatches
        .map(s => s.replace(/^[-*]\s*/, '').trim())
        .filter(s => s.length > 0);
    }

    return sections;
  };

  const parsed = parseInsight(insight);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Main Message */}
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Heart className="w-5 h-5" />
            Your Personal Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90 leading-relaxed">
            {parsed.message || insight}
          </p>
        </CardContent>
      </Card>

      {/* Calming Activities */}
      {parsed.activities.length > 0 && (
        <Card className="glass-effect border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Sparkles className="w-5 h-5" />
              Calming Activities for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {parsed.activities.map((activity, index) => {
                // Parse activity to separate title from description
                const parts = activity.match(/^(\d+\.\s*\*\*)?(.+?)(\*\*)?:?\s*(.*)$/s);
                const title = parts ? (parts[2] || activity.split(':')[0]).replace(/\*\*/g, '').trim() : `Activity ${index + 1}`;
                const description = parts ? parts[4].trim() : activity;
                
                return (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-accent/5 border border-accent/20 hover:border-accent/40 transition-all duration-300"
                  >
                    <h4 className="font-semibold text-accent mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 text-accent text-sm">
                        {index + 1}
                      </span>
                      {title}
                    </h4>
                    <p className="text-foreground/80 text-sm leading-relaxed ml-8">
                      {description || activity}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Song Recommendations */}
      {parsed.songs.length > 0 && (
        <Card className="glass-effect border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Music className="w-5 h-5" />
              Music for Your Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {parsed.songs.map((song, index) => {
                const cleanSong = song.replace(/^[0-9.\-*)\s]+/, '').trim();
                if (!cleanSong) return null;
                return (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">♪</span>
                    <span className="text-foreground/90">{cleanSong}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIInsightCard;