import { GoogleGenerativeAI } from "@google/generative-ai";
import { type TripFormData, type TripPreferences, type Recommendation } from "../types";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY as string);

export function safeParseJSON(text: string, defaultValue: any = null): any {
  let cleaned = text.trim();
  
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  const arrayStart = cleaned.indexOf('[');
  const arrayEnd = cleaned.lastIndexOf(']');
  
  let start = -1;
  let end = -1;
  
  if (jsonStart !== -1 && arrayStart !== -1) {
    if (jsonStart < arrayStart) {
      start = jsonStart;
      end = jsonEnd;
    } else {
      start = arrayStart;
      end = arrayEnd;
    }
  } else if (jsonStart !== -1) {
    start = jsonStart;
    end = jsonEnd;
  } else if (arrayStart !== -1) {
    start = arrayStart;
    end = arrayEnd;
  }
  
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }
  
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
  cleaned = cleaned.replace(/,(\s*[\]}])/g, '$1');

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON string:", cleaned, e);
    if (defaultValue !== null) return defaultValue;
    throw e;
  }
}

export async function generateRecommendationFallback(prefs: TripPreferences): Promise<Recommendation> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    }
  });

  const prompt = `You are a professional travel planner. Generate a highly detailed and realistic travel itinerary for the following preferences:
  - Origin: ${prefs.origin}
  - Destination: ${prefs.destination}
  - Mood: ${prefs.mood}
  - Budget: ${prefs.budget} ${prefs.currency}
  - Duration: ${prefs.days} days
  - Guests: ${prefs.guests}
  - Start Date: ${prefs.startDate}
  
  You MUST return ONLY a valid JSON object matching this exact schema:
  {
    "destination": "string (the primary location)",
    "title": "string (catchy trip title)",
    "tagline": "string",
    "summary": "string (1 paragraph overview)",
    "best_time": "string",
    "highlights": ["string", "string", "string"],
    "daily_plan": [
      {
        "day": 1,
        "title": "string",
        "morning": "string",
        "midday": "string",
        "afternoon": "string",
        "evening": "string",
        "tip": "string",
        "stay": "string"
      }
    ],
    "cozy_tips": ["string", "string"],
    "must_try_food": ["string", "string"],
    "estimated_cost_breakdown": {
      "accommodation": [{"item": "string", "source": "string", "calculation": "string", "cost": 0, "currency": "${prefs.currency}", "type": "fixed"}],
      "food": [{"item": "string", "source": "string", "calculation": "string", "cost": 0, "currency": "${prefs.currency}", "type": "variable"}],
      "transport": [{"item": "string", "source": "string", "calculation": "string", "cost": 0, "currency": "${prefs.currency}", "type": "fixed"}],
      "activities": [{"item": "string", "source": "string", "calculation": "string", "cost": 0, "currency": "${prefs.currency}", "type": "fixed"}],
      "other": [{"item": "string", "source": "string", "calculation": "string", "cost": 0, "currency": "${prefs.currency}", "type": "fixed"}],
      "total": ${prefs.budget},
      "confidence": "High"
    }
  }`;

  const result = await model.generateContent(prompt);
  return safeParseJSON(result.response.text());
}

export async function geminiChat(messages: { role: string; content: string }[]): Promise<string> {
  const systemInstruction = `You are a helpful, friendly, and expert travel assistant. Your primary goal is to explain concepts, answer questions, and provide travel advice in the simplest, most accessible way possible for non-technical users.

Follow these strict rules:
1. NO JARGON: Avoid complex terminology. If you absolutely must use a technical term, immediately explain it using a simple real-world analogy.
2. BE CONCISE: Get straight to the point. Avoid long, academic introductions.
3. STRUCTURE: Use bullet points, bold text, and very short paragraphs to make your answers easy to skim.
4. TONE: Be encouraging, patient, and conversational. Speak to the user like a helpful friend.
5. CLARITY OVER DEPTH: Focus on giving the user a practical, high-level understanding rather than an exhaustive explanation.
If you do not know the exact answer, simply say 'I don't have that information right now, but here is what I do know.'`;

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction
  });
  
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));
  
  const lastMessage = messages[messages.length - 1].content;
  
  const chat = model.startChat({
    history: history,
    generationConfig: {
      temperature: 0.4,
      topP: 0.8,
      topK: 40,
    }
  });

  const result = await chat.sendMessage(lastMessage);
  return result.response.text();
}

export async function createTripPlanStream(
  data: TripFormData,
  onChunk: (text: string) => void
) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const systemPrompt = `You are a world-class luxury and budget travel planner with deep knowledge of global destinations, hidden gems, and local logistics.
Your goal is to create a highly detailed, engaging, and structured travel itinerary.

Input Details:
- Start: ${data.startLocation}
- Destination: ${data.destination}
- Duration: ${data.duration} Days
- Budget: ${data.budget} ${data.currency}
- Style: ${data.travelStyle}
- Trip Types: ${data.tripTypes.join(', ')}
- Guests: ${data.guests}
- Preferences: ${data.preferences.join(', ')}
- Extra Notes: ${data.notes || 'None'}

Output Structure (MANDATORY):
1. # Trip Overview - A captivating summary of the trip focusing on the vibe of the ${data.tripTypes.join('/')}.
   - **MANDATORY**: Start this section with a breathtaking, high-quality, wide-angle scenic image showing the beauty of the destination using Markdown: ![Destination Beauty](https://source.unsplash.com/featured/1280x720/?${data.destination.replace(/\s+/g, '')},travel,landscape).
   - ### Best Time to Visit: Provide specific seasonal recommendations for this destination.
2. # Day-wise Itinerary - Detailed plan for ${data.duration} days. Use subheadings like "## Day 1: Exploring the Heart of [City]". For each day, include:
   - **Morning**: Activity, timing, why visit.
   - **Afternoon**: Activities, lunch suggestion.
   - **Evening**: Sunset spots, dinner suggestion, nightlife.
3. # Must-Visit Places - A curated list with descriptions and best time to visit each.
   - **MANDATORY**: For each place, provide its name as a clickable link that opens its location and photos on Google Maps using Markdown: [📍 View Place Name Location & Photos](https://www.google.com/maps/search/?api=1&query=Place+Name). DO NOT include direct images.
4. # Hidden Gems - 3-4 local, off-the-beaten-path locations. For each, provide a Google Maps search link as described above. DO NOT include direct images.
5. # Accommodation - 3 categorized options (Budget, Mid-range, Luxury). 
   - **MANDATORY**: Provide a direct booking or search link for each (e.g., [Book on Booking.com](https://www.booking.com/searchresults.html?ss=HotelName)). DO NOT include images.
6. # Travel Options - How to get there from ${data.startLocation} (Flight, Train, Bus). 
   - **MANDATORY**: Provide booking search links for each (e.g., [Find Flights on Skyscanner](https://www.skyscanner.com/transport/flights/source/dest/), [Book Trains/Buses on Omio](https://www.omio.com/)). Include local transport tips. DO NOT include images.
7. # Budget Breakdown - See the detailed section below for a verified, itemized breakdown including sources and calculations.
8. # Money-Saving Tips - Practical, local-specific hacks.
9. # Travel Tips - Packing checklist, safety, etiquette.
10. # [INTERNAL_DATA]
<map_markers_json>
[
  { "id": "1", "name": "Name", "description": "Short desc", "lat": 0.0, "lng": 0.0, "day": 1 }
]
</map_markers_json>

<budget_json>
{
  "accommodation": [
    { "item": "Mid-range Hotel in [Area]", "source": "Booking.com average for [City]", "calculation": "6 nights x $150", "cost": 900, "currency": "USD", "type": "fixed", "notes": "Price includes city tax" }
  ],
  "food": [
    { "item": "Daily Meal Allowance", "source": "Travel guide average for [City]", "calculation": "7 days x $60", "cost": 420, "currency": "USD", "type": "variable", "notes": "Includes lunch formulas and coffee" }
  ],
  "transport": [
    { "item": "Round-trip Flight (JFK-CDG)", "source": "Historical average (Air France)", "calculation": "1 ticket", "cost": 850, "currency": "USD", "type": "fixed" },
    { "item": "Paris Visite Pass (Zones 1-5)", "source": "Official RATP 2026 rates", "calculation": "5-day pass", "cost": 80, "currency": "USD", "type": "fixed" }
  ],
  "activities": [
    { "item": "Louvre Entry", "source": "Official Louvre website", "calculation": "1 adult", "cost": 30, "currency": "USD", "type": "fixed" }
  ],
  "other": [
    { "item": "ETIAS Visa Waiver", "source": "Official europa.eu fee", "calculation": "1 authorization", "cost": 20, "currency": "USD", "type": "fixed" }
  ],
  "total": 2300,
  "confidence": "High"
}
</budget_json>
[END_INTERNAL_DATA]

    [BUDGET_GUIDELINES]:
    1. Act as a Smart Budget Analyzer Engine. Never return 0 or random values.
    2. Base calculations on these multipliers for ${data.destination}:
       - Accommodation: Budget (₹500-1500), Standard (₹1500-4000), Luxury (₹4000-15000+) per night.
       - Food: Budget (₹300-600), Standard (₹700-1500), Luxury (₹2000-5000) per person/day.
    3. Formulas:
       - Accommodation = price_per_night × ${data.duration} nights.
       - Food = daily_food_cost × ${data.guests} people × ${data.duration} days.
       - Transportation = (Origin ${data.startLocation} to Destination ${data.destination} cost) + local transport.
       - Activities = Estimate based on interests: ${data.preferences.join(', ')}.
       - Other = 10% of subtotal.
    4. Sourcing: Research current, verified pricing (Google Flights, Booking.com, TripAdvisor).
    5. Validation: If a calculation fails, use fallback percentages of the total budget: Acc (35%), Food (20%), Trans (25%), Act (10%), Other (10%).
    6. Ensure the grand total in budget_json is realistic for 2026.
    7. Include a "confidence" score (High/Medium/Low) in the JSON.

Style Guide:
- Use emojis for flair.
- Use bold text for emphasis.
- DO NOT use direct images in any section. Instead, use the Google Maps link format for all specific locations and visiting places.
- Keep the tone professional, helpful, and inspiring.
- Render everything in Markdown.`;

  try {
    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
    });

    let fullText = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text || "";
      fullText += chunkText;
      onChunk(fullText);
    }
    return fullText;
  } catch (error: any) {
    console.error("Gemini stream error:", error);
    throw error;
  }
}

export async function extractTripDataFromVoice(transcript: string): Promise<any> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const prompt = `Extract trip details from this voice transcript: "${transcript}". 
  Return ONLY a valid JSON object with these fields: 
  "startLocation" (string), 
  "destination" (string), 
  "budget" (number), 
  "currency" (string - 3-letter code),
  "duration" (number - days),
  "tripTypes" (array of strings - valid: "weekend", "family", "business", "romantic", "friends", "solo", "holiday"),
  "preferences" (array of strings - valid: "nature", "temples", "beaches", "food", "nightlife", "adventure", "shopping", "history", "wellness").
  
  If a field is not found, omit it.
  Example: {"startLocation": "New York", "destination": "Paris", "budget": 5000, "currency": "USD", "duration": 7, "tripTypes": ["holiday"], "preferences": ["food", "history"]}?`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return safeParseJSON(result.response.text() || "{}", {});
  } catch (error) {
    console.error("Extraction error:", error);
    return null;
  }
}

export async function chatWithGemini(
  messages: { role: "user" | "model"; content: string }[],
  onChunk: (text: string) => void,
  signal?: AbortSignal
) {
  const systemInstruction = `You are a helpful, friendly, and expert travel assistant. Your primary goal is to explain concepts, answer questions, and provide travel advice in the simplest, most accessible way possible for non-technical users.

Follow these strict rules:
1. NO JARGON: Avoid complex terminology. If you absolutely must use a technical term, immediately explain it using a simple real-world analogy.
2. BE CONCISE: Get straight to the point. Avoid long, academic introductions.
3. STRUCTURE: Use bullet points, bold text, and very short paragraphs to make your answers easy to skim.
4. TONE: Be encouraging, patient, and conversational. Speak to the user like a helpful friend.
5. CLARITY OVER DEPTH: Focus on giving the user a practical, high-level understanding rather than an exhaustive explanation.
If you do not know the exact answer, simply say 'I don't have that information right now, but here is what I do know.'`;

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: systemInstruction,
  });

  try {
    const formattedContents = messages.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const result = await model.generateContentStream({
      contents: formattedContents,
      generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1000,
      }
    });

    let fullText = "";
    for await (const chunk of result.stream) {
      if (signal?.aborted) {
        break;
      }
      const chunkText = chunk.text || "";
      fullText += chunkText;
      onChunk(fullText);
    }
  } catch (error: any) {
    if (error.name === 'AbortError' || signal?.aborted) {
      console.log("Chat generation aborted");
      return;
    }
    console.error("Chat Gemini error:", error);
    throw error;
  }
}

export async function getVoiceSummary(itinerary: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `Summarize this travel itinerary into a short, descriptive 2-3 sentence paragraph that is friendly and easy to read aloud by a voice assistant. Focus on the main highlights and vibe. Do not use special characters or markdown.
  
  Itinerary:
  ${itinerary}`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    return result.response.text() || "Your trip is ready! Check the details on your screen.";
  } catch (error) {
    console.error("Voice summary error:", error);
    return "Your trip is ready! Here is your custom itinerary.";
  }
}

export async function getAlternativeDestinations(destination: string, budget: number, currency: string): Promise<any[]> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `The user wants to go to "${destination}" with a budget of ${budget} ${currency}. 
  If this budget is realistically too low for a comfortable 5-7 day trip, suggest 3 similar destinations with a lower cost of living but a similar "vibe" (e.g., if they chose Swiss Alps, suggest Tatra Mountains or Georgia).
  If the budget is sufficient, you can still suggest unique alternatives.
  
  Return ONLY a valid JSON array of objects with: 
  "name" (string), 
  "reason" (string - why it is similar but cheaper), 
  "estimatedBudget" (number - for 5 days in ${currency}), 
  "vibeMatch" (number 1-100).`;
  
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return safeParseJSON(result.response.text() || "[]", []);
  } catch (error) {
    console.error("Alternative destinations error:", error);
    return [];
  }
}

import { fetchMoodRecommendations } from "../api/client";

export async function getMoodRecommendations(mood: string, budget: number, currency: string): Promise<any[]> {
  // Try the online backend API first
  const onlineResults = await fetchMoodRecommendations(mood, budget, currency);
  if (onlineResults && onlineResults.length > 0) return onlineResults;

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `The user is feeling "${mood}" and has a budget of ${budget} ${currency} for a 1-week trip.
  Suggest 3 diverse destinations (1 domestic-ish, 2 international) that match this mood and fit this budget.
  
  Return ONLY a JSON array of objects with:
  "name" (string),
  "description" (string - max 100 chars),
  "whyMatch" (string - why it fits the mood "${mood}"),
  "estimatedCost" (number - in ${currency}),
  "landscapeType" (string - e.g., "Lush Greenery", "Alpine Lakes", "Golden Deserts", "Coastal Cliffs"),
  "highlight" (string - one specific "wow" factor)
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return safeParseJSON(result.response.text() || "[]", []);
  } catch (error) {
    console.error("Mood recommendations error:", error);
    
    // Improved Fallback data based on general mood categories
    const fallbacks: Record<string, any[]> = {
      adventurous: [
        { name: "Rishikesh, India", description: "Yoga capital with white water rafting", whyMatch: "Perfect for action and spirit", estimatedCost: budget * 0.3, landscapeType: "Rivers & Mountains", highlight: "Bungee Jumping" },
        { name: "Interlaken, Switzerland", description: "Adventure capital of Europe", whyMatch: "Ultimate mountain thrills", estimatedCost: budget * 0.9, landscapeType: "Alpine Peaks", highlight: "Skydiving over Lakes" },
        { name: "Queentown, NZ", description: "Breathtaking landscapes and extreme sports", whyMatch: "World class adventure", estimatedCost: budget * 0.8, landscapeType: "Lakes & Glaciers", highlight: "AJ Hackett Bungy" }
      ],
      relaxed: [
        { name: "Goa, India", description: "Pristine beaches and laid back vibes", whyMatch: "Ultimate coastal relaxation", estimatedCost: budget * 0.4, landscapeType: "Tropical Coastline", highlight: "Sunset Beach Yoga" },
        { name: "Bali, Indonesia", description: "Spiritual retreats and lush rice fields", whyMatch: "Serene and peaceful", estimatedCost: budget * 0.6, landscapeType: "Jungle & Beaches", highlight: "Villas with Private Pools" },
        { name: "Santorini, Greece", description: "Iconic blue domes and calm waters", whyMatch: "Quiet luxury and views", estimatedCost: budget * 0.9, landscapeType: "Volcanic Cliffs", highlight: "Sunset over Oia" }
      ],
      romantic: [
        { name: "Udaipur, India", description: "The City of Lakes", whyMatch: "Palatial romance", estimatedCost: budget * 0.5, landscapeType: "Mirror-like Lakes", highlight: "Boat ride at Lake Pichola" },
        { name: "Paris, France", description: "The City of Love", whyMatch: "Timeless romantic atmosphere", estimatedCost: budget * 1.0, landscapeType: "Urban Elegance", highlight: "Eiffel Tower Sparkles" },
        { name: "Maldives", description: "Overwater bungalows and crystal seas", whyMatch: "Secluded intimacy", estimatedCost: budget * 1.2, landscapeType: "Atolls & Lagoons", highlight: "Underwater Dining" }
      ]
    };

    const moodLower = mood.toLowerCase();
    return fallbacks[moodLower] || fallbacks.relaxed;
  }
}

export async function getSeasonalRecommendations(userLocation: string = "India"): Promise<any> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  
  const prompt = `It is currently ${month}. Based on this season and the user's base location of "${userLocation}", provide travel recommendations in 3 categories.
  
  Categories:
  1. Nearby/In-state: Within 300 miles of ${userLocation}.
  2. National: Popular and seasonally perfect spots within the same country as ${userLocation}.
  3. Global: The best international places to visit right now (e.g. for weather, festivals, or off-season deals).


  Return ONLY a JSON object with keys "nearby", "national", "global". 
  Each key should be an array of 3 objects: { "name": string, "description": string, "highlight": string, "type": "nature" | "city" | "beach" | "culture" }.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return safeParseJSON(result.response.text() || "{}", {});
  } catch (error) {
    console.error("Seasonal recommendations error:", error);
    
    // Robust seasonal fallback (May/Summer focus)
    return {
      nearby: [
        { name: "Munnar", description: "Cool tea plantations and mist", highlight: "Tea Museum", type: "nature" },
        { name: "Coorg", description: "Scotland of India with coffee estates", highlight: "Abbey Falls", type: "nature" },
        { name: "Hampi", description: "Ancient ruins with sunset views", highlight: "Virupaksha Temple", type: "culture" }
      ],
      national: [
        { name: "Leh Ladakh", description: "High altitude desert peaks", highlight: "Pangong Lake", type: "nature" },
        { name: "Srinagar", description: "Heaven on earth with houseboats", highlight: "Dal Lake", type: "nature" },
        { name: "Manali", description: "Gateway to the majestic Himalayas", highlight: "Rohtang Pass", type: "nature" }
      ],
      global: [
        { name: "Kyoto, Japan", description: "Zen gardens and historic shrines", highlight: "Fushimi Inari", type: "culture" },
        { name: "Amalfi Coast, Italy", description: "Colorful cliffside villages", highlight: "Positano View", type: "beach" },
        { name: "Cape Town, SA", description: "Breathtaking coast and table mountain", highlight: "Boulders Beach", type: "nature" }
      ]
    };
  }
}
