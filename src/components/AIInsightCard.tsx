import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Music, Heart } from "lucide-react";

interface AIInsightCardProps {
  insight: string;
  mood: string;
}

const AIInsightCard = ({ insight, mood }: AIInsightCardProps) => {
  // Parse the AI response to extract different sections
  const parseInsight = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Find sections
    const messageLines: string[] = [];
    const activityLines: string[] = [];
    const songLines: string[] = [];
    
    let currentSection = 'message';
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('activity') || lowerLine.includes('suggestion')) {
        currentSection = 'activity';
      } else if (lowerLine.includes('song') || lowerLine.includes('music')) {
        currentSection = 'songs';
      } else if (currentSection === 'message') {
        messageLines.push(line);
      } else if (currentSection === 'activity') {
        activityLines.push(line);
      } else if (currentSection === 'songs') {
        songLines.push(line);
      }
    });

    return {
      message: messageLines.join(' '),
      activity: activityLines.join(' '),
      songs: songLines,
    };
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

      {/* Calming Activity */}
      {parsed.activity && (
        <Card className="glass-effect border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Sparkles className="w-5 h-5" />
              Suggested Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 leading-relaxed">
              {parsed.activity}
            </p>
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