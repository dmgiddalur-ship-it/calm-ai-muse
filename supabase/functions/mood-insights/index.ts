import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mood, note, moodTags } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating insights for mood:", mood, "with tags:", moodTags);

    // Mood-specific calming activity suggestions
    const moodActivities: Record<string, string> = {
      "Happy": "celebrate and amplify this positive energy",
      "Calm": "maintain this peaceful state through mindfulness",
      "Excited": "channel this vibrant energy productively",
      "Sad": "gently process these feelings with self-compassion",
      "Anxious": "ground yourself and find inner peace",
      "Tired": "restore your energy and practice self-care"
    };

    const activityFocus = moodActivities[mood] || "support your emotional wellbeing";

    const moodPrompt = `User's current mood: ${mood}
${note ? `User's note: ${note}` : ''}
${moodTags && moodTags.length > 0 ? `Mood tags: ${moodTags.join(', ')}` : ''}

Generate a personalized, empathetic response in this EXACT format:

MESSAGE:
[Write 2-3 warm, understanding sentences about their ${mood} mood. Be empathetic and validating.]

ACTIVITIES:
[Provide 3-4 specific, actionable calming activities to help them ${activityFocus}. Each activity should:
- Be practical and take 5-15 minutes
- Include clear step-by-step instructions
- Match their current emotional state
Format each as a numbered list with the activity name in bold followed by instructions.]

SONGS:
[List exactly 3 song recommendations that match their ${mood} mood]
- Song 1: "Song Name" by Artist Name
- Song 2: "Song Name" by Artist Name  
- Song 3: "Song Name" by Artist Name

Keep the tone gentle, supportive, and non-judgmental. Make activities specific and actionable, not generic advice.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a compassionate mental wellness assistant. Provide warm, personalized support and practical suggestions."
          },
          {
            role: "user",
            content: moodPrompt
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service requires payment. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate insights");
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    console.log("AI response generated successfully");

    return new Response(
      JSON.stringify({ insight: aiResponse }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in mood-insights function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});