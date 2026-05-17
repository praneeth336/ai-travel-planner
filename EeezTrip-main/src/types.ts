import { z } from 'zod';

// ─── Form Types ─────────────────────────────────────────────────────────────

export const TravelStyle = z.enum(['budget', 'mid-range', 'luxury']);
export type TravelStyle = z.infer<typeof TravelStyle>;

export const Currency = z.enum(['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD']);
export type Currency = z.infer<typeof Currency>;

export const Preference = z.enum([
  'nature', 'temples', 'beaches', 'food', 'nightlife', 
  'adventure', 'shopping', 'history', 'wellness', 'photography'
]);
export type Preference = z.infer<typeof Preference>;

export const TripType = z.enum([
  'weekend', 'family', 'business', 'romantic', 'friends', 'solo', 'holiday'
]);
export type TripType = z.infer<typeof TripType>;

export const TripFormSchema = z.object({
  startLocation: z.string().min(2, "Start location is required"),
  destination: z.string().min(2, "Destination is required"),
  duration: z.number().min(1).max(30),
  budget: z.number().min(100),
  currency: Currency,
  travelStyle: TravelStyle,
  guests: z.number().min(1),
  preferences: z.array(Preference),
  tripTypes: z.array(TripType),
  notes: z.string().optional(),
});

export type TripFormData = z.infer<typeof TripFormSchema>;

// ─── Trip Request ────────────────────────────────────────────────────────────

export type TripPreferences = {
  planningType: 'detailed' | 'mood';
  origin: string;
  destination: string;
  mood: string;
  budget: number;
  days: number;
  startDate: string;
  endDate: string;
  currency: string;
  mode: 'normal' | 'deep';
  guests: number;
};

export type TripRequest = {
  origin: string;
  destination: string;
  mood: string;
  budget: number;
  days: number;
  startDate: string;
  endDate: string;
  mode: 'normal' | 'deep';
  guests: number;
};

// ─── API Response Types ──────────────────────────────────────────────────────

export type DayPlan = {
  day: number;
  title: string;
  morning: string;
  midday: string;
  afternoon: string;
  evening: string;
  tip: string;
  stay?: string;
};

export type BudgetItem = {
  item: string;
  source: string;
  calculation: string;
  cost: number;
  currency: string;
  type: 'fixed' | 'variable';
  notes?: string;
};

export type CostBreakdown = {
  accommodation: BudgetItem[];
  food: BudgetItem[];
  transport: BudgetItem[];
  activities: BudgetItem[];
  other: BudgetItem[];
  total: number;
  confidence: 'High' | 'Medium' | 'Low';
};

export type Recommendation = {
  destination?: string;
  title: string;
  tagline: string;
  summary: string;
  best_time: string;
  highlights: string[];
  daily_plan: DayPlan[];
  cozy_tips: string[];
  must_try_food: string[];
  estimated_cost_breakdown: CostBreakdown;
};

export type PlaceImage = {
  image_id: string;
  url: string;
  url_regular?: string;
  url_small?: string;
  alt: string;
  author: string;
  source: string;
  source_link?: string;
};

// ─── Navigation ─────────────────────────────────────────────────────────────

export type Page = 'landing' | 'choice' | 'start' | 'mood-start' | 'preferences' | 'results' | 'booking' | 'dashboard' | 'reviews';

// ─── Database Records ───────────────────────────────────────────────────────

export type Review = {
  id?: string;
  _id?: string;
  user_id?: string;
  user_name?: string;
  user_photo?: string;
  destination: string;
  rating: number;
  comment: string;
  video_url?: string | null;
  created_at?: string;
  likes?: number;
};

export type TripRecord = {
  id: string;
  user_id: string;
  label: string;
  destination: string;
  trip: Recommendation;
  preferences?: TripPreferences;
  created_at: string;
};

// ─── Mood Option ─────────────────────────────────────────────────────────────

export type MoodOption = {
  id: string;
  label: string;
  imageUrl: string;
  description: string;
  color: string;
  pinkAccent?: boolean;
};

export type SavedTrip = {
  id: string;
  userId: string;
  destination: string;
  title: string;
  content: string;
  createdAt: any;
};

export type DestinationReview = {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string | null;
  destination: string;
  rating: number;
  review: string;
  videoUrl?: string | null;
  createdAt: any;
};

export type MapMarker = {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  day: number;
};

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};
