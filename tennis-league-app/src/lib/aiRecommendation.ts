import { MatchDay } from '@/lib/match';

type Suggestion = {
  pair: [string, string];
  court: number;
  reason: string;
};

/**
 * Get AI suggestions for a given match day. If an OpenAI API key is provided via
 * `VITE_OPENAI_API_KEY`, a real request is made. Otherwise a deterministic mock
 * is returned for demo / offline environments.
 */
export async function getAiSuggestions(matchDay: MatchDay): Promise<Suggestion[]> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  // Simple deterministic mock based on player names
  const mock = () => {
    const suggestions: Suggestion[] = [];
    matchDay.courts.forEach((court) => {
      if (court.players.length >= 2) {
        const [p1, p2] = court.players;
        suggestions.push({
          pair: [p1.name, p2.name],
          court: court.courtNumber,
          reason: 'Balanced skill levels',
        });
      }
    });
    return suggestions;
  };

  if (!apiKey) {
    // No real key – return mock data instantly
    return Promise.resolve(mock());
  }

  // Build a prompt describing the match day information
  const prompt = `You are a tennis league analyst. Given the following match day data, suggest pairings of players for each court and a brief reason for each pairing. Return an array of objects with fields: pair (array of two player names), court (court number), reason (short explanation). Data:\n${JSON.stringify(
    matchDay,
    null,
    2,
  )}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });
    if (!response.ok) {
      console.error('OpenAI request failed', await response.text());
      return mock();
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return mock();
    // Assume the model returns JSON array
    const parsed = JSON.parse(content) as Suggestion[];
    return parsed;
  } catch (err) {
    console.error('AI suggestion error', err);
    return mock();
  }
}
