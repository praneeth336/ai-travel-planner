import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
  useEffect,
} from 'react';
import { User } from 'firebase/auth';
import { auth, onAuthStateChanged } from '../lib/firebase';
import { fetchImages, fetchRecommendation, reviseRecommendation, saveTripToDB } from '../api/client';
import { chatWithGemini } from '../lib/gemini';
import { ChatMessage, Page, PlaceImage, Recommendation, TripPreferences } from '../types';

// ─── State Shape ─────────────────────────────────────────────────────────────

type State = {
  page: Page;
  preferences: TripPreferences;
  loading: boolean;
  error: string;
  recommendation: Recommendation | null;
  images: PlaceImage[];
  revising: boolean;
  reviseError: string;
  user: User | null;
  chatHistory: ChatMessage[];
  chatLoading: boolean;
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'NAVIGATE'; page: Page }
  | { type: 'SET_DESTINATION'; destination: string }
  | { type: 'SET_PREF'; field: keyof TripPreferences; value: string | number }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS'; recommendation: Recommendation; images: PlaceImage[] }
  | { type: 'SET_IMAGES'; images: PlaceImage[] }
  | { type: 'SET_RECOMMENDATION'; recommendation: Recommendation }
  | { type: 'SUBMIT_ERROR'; error: string }
  | { type: 'REVISE_START' }
  | { type: 'REVISE_SUCCESS'; recommendation: Recommendation }
  | { type: 'REVISE_ERROR'; error: string }
  | { type: 'SET_USER'; user: User | null }
  | { type: 'CHAT_START' }
  | { type: 'ADD_CHAT_MESSAGE'; message: ChatMessage }
  | { type: 'CHAT_SUCCESS' }
  | { type: 'CHAT_ERROR'; error: string }
  | { type: 'RESET' };

// ─── Initial State ────────────────────────────────────────────────────────────

const initialPrefs: TripPreferences = {
  planningType: 'detailed',
  origin: '',
  destination: '',
  mood: 'Relaxed',
  budget: 50000,
  days: 5,
  startDate: '',
  endDate: '',
  currency: 'INR',
  mode: 'normal',
  guests: 1,
};

const initialState: State = {
  page: 'landing',
  preferences: initialPrefs,
  loading: false,
  error: '',
  recommendation: null,
  images: [],
  revising: false,
  reviseError: '',
  user: null,
  chatHistory: [],
  chatLoading: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, page: action.page };
    case 'SET_DESTINATION':
      return {
        ...state,
        preferences: { ...state.preferences, destination: action.destination },
      };
    case 'SET_PREF':
      return {
        ...state,
        preferences: { ...state.preferences, [action.field]: action.value },
      };
    case 'SUBMIT_START':
      return { ...state, loading: true, error: '' };
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        loading: false,
        recommendation: action.recommendation,
        images: action.images,
      };
    case 'SET_IMAGES':
      return {
        ...state,
        images: action.images,
      };
    case 'SET_RECOMMENDATION':
      return {
        ...state,
        recommendation: action.recommendation,
      };
    case 'SUBMIT_ERROR':
      return { ...state, loading: false, error: action.error };
    case 'REVISE_START':
      return { ...state, revising: true, reviseError: '' };
    case 'REVISE_SUCCESS':
      return { ...state, revising: false, recommendation: action.recommendation };
    case 'REVISE_ERROR':
      return { ...state, revising: false, reviseError: action.error };
    case 'SET_USER':
      return { ...state, user: action.user };
    case 'CHAT_START':
      return { ...state, chatLoading: true };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.message] };
    case 'CHAT_SUCCESS':
      return { ...state, chatLoading: false };
    case 'CHAT_ERROR':
      return { ...state, chatLoading: false, reviseError: action.error };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

type ContextValue = {
  state: State;
  dispatch: Dispatch<Action>;
  navigate: (page: Page) => void;
  submitTrip: (overridePrefs?: Partial<TripPreferences>) => Promise<void>;
  reviseTrip: (instruction: string) => Promise<void>;
  saveCurrentTrip: (label?: string) => Promise<void>;
  setRecommendation: (recommendation: Recommendation) => void;
  sendChatMessage: (content: string) => Promise<void>;
};

const TripContext = createContext<ContextValue | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch({ type: 'SET_USER', user });
    });
    return unsubscribe;
  }, []);

  const navigate = (page: Page) => dispatch({ type: 'NAVIGATE', page });
  const setRecommendation = (recommendation: Recommendation) =>
    dispatch({ type: 'SET_RECOMMENDATION', recommendation });

  const submitTrip = async (overridePrefs?: Partial<TripPreferences>) => {
    dispatch({ type: 'SUBMIT_START' });
    try {
      const finalPrefs = overridePrefs ? { ...state.preferences, ...overridePrefs } : state.preferences;
      const recommendation = await fetchRecommendation(finalPrefs);
      
      // Always sync the actual AI-chosen destination back into preferences
      // so it never goes stale when the user generates a second trip.
      if (recommendation.destination) {
        dispatch({
          type: 'SET_PREF',
          field: 'destination',
          value: recommendation.destination,
        });
      }

      dispatch({ type: 'SUBMIT_SUCCESS', recommendation, images: [] });
      navigate('results');

      // Auto-save to DB if user is logged in
      if (state.user) {
        saveTripToDB(state.user.uid, recommendation, finalPrefs);
      }

      // Load images in background so itinerary appears faster.
      fetchImages(recommendation.destination || state.preferences.destination, 8)
        .then((images) => dispatch({ type: 'SET_IMAGES', images }))
        .catch(() => {
          // Silently ignore image fetch issues; itinerary is already available.
        });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      dispatch({ type: 'SUBMIT_ERROR', error: msg });
    }
  };

  const saveCurrentTrip = async (label?: string) => {
    if (!state.user || !state.recommendation) return;
    try {
      await saveTripToDB(state.user.uid, state.recommendation, state.preferences, label);
    } catch (err) {
      console.error("Failed to manual save trip:", err);
    }
  };

  const reviseTrip = async (instruction: string) => {
    if (!state.recommendation) return;
    dispatch({ type: 'REVISE_START' });
    try {
      const newRec = await reviseRecommendation(state.preferences, state.recommendation, instruction);
      dispatch({ type: 'REVISE_SUCCESS', recommendation: newRec });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Revision failed';
      dispatch({ type: 'REVISE_ERROR', error: msg });
    }
  };

  const sendChatMessage = async (content: string) => {
    const userMsg: ChatMessage = { role: 'user', content };
    dispatch({ type: 'ADD_CHAT_MESSAGE', message: userMsg });
    dispatch({ type: 'CHAT_START' });

    try {
      const history = state.chatHistory.map(m => ({ 
        role: m.role === 'assistant' ? 'model' as const : 'user' as const, 
        content: m.content 
      }));
      history.push({ role: 'user', content });

      let fullResponse = "";
      await chatWithGemini(history, (chunk) => {
        fullResponse = chunk;
        // In a real implementation we might want to stream to state, 
        // but for now we'll just wait for the full response to keep it simple
      });

      const assistantMsg: ChatMessage = { role: 'assistant', content: fullResponse };
      dispatch({ type: 'ADD_CHAT_MESSAGE', message: assistantMsg });
      dispatch({ type: 'CHAT_SUCCESS' });
    } catch (err: any) {
      dispatch({ type: 'CHAT_ERROR', error: err.message });
    }
  };

  return (
    <TripContext.Provider value={{ state, dispatch, navigate, submitTrip, reviseTrip, saveCurrentTrip, setRecommendation, sendChatMessage }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTripStore() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTripStore must be used inside TripProvider');
  return ctx;
}
