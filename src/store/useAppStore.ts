// NutriVision — App State (Zustand)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, FoodAnalysis, WeeklyMealPlan, GroceryItem, HydrationLog, NutritionGoalTargets, ChatMessage, SavedFood } from '../types';

interface AppState {
  // Auth
  isAuthenticated: boolean;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;

  // Profile
  profile: UserProfile | null;

  // Food Analysis
  currentAnalysis: FoodAnalysis | null;
  analysisHistory: FoodAnalysis[];

  // QR Session
  qrSessionId: string | null;
  qrStatus: 'idle' | 'pending' | 'connected' | 'received';
  qrImageUrl: string | null;

  // Meal Plan
  currentMealPlan: WeeklyMealPlan | null;

  // Grocery
  groceryItems: GroceryItem[];

  // Hydration
  hydrationLog: HydrationLog;

  // Goals
  nutritionGoals: NutritionGoalTargets;

  // Chat
  chatMessages: ChatMessage[];

  // Saved
  savedFoods: SavedFood[];

  // Theme
  theme: 'light' | 'dark' | 'system';

  // Actions
  login: (id: string, email: string, name: string) => void;
  logout: () => void;
  setProfile: (profile: UserProfile) => void;
  setCurrentAnalysis: (analysis: FoodAnalysis | null) => void;
  addToHistory: (analysis: FoodAnalysis) => void;
  setQRSession: (sessionId: string) => void;
  setQRStatus: (status: 'idle' | 'pending' | 'connected' | 'received') => void;
  setQRImage: (url: string) => void;
  addHydration: (ml: number) => void;
  resetHydration: () => void;
  addGroceryItem: (item: GroceryItem) => void;
  toggleGroceryItem: (id: string) => void;
  removeGroceryItem: (id: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  toggleSavedFood: (food: SavedFood) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const today = new Date().toISOString().split('T')[0];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userId: null,
      userEmail: null,
      userName: null,
      profile: null,
      currentAnalysis: null,
      analysisHistory: [],
      qrSessionId: null,
      qrStatus: 'idle',
      qrImageUrl: null,
      currentMealPlan: null,
      groceryItems: [],
      hydrationLog: { date: today, entries: [], totalMl: 0, goalMl: 2500 },
      nutritionGoals: { calories: 2000, protein: 50, carbohydrates: 250, fat: 65, fiber: 25, water: 2500 },
      chatMessages: [],
      savedFoods: [],
      theme: 'system',

      login: (id, email, name) => set({ isAuthenticated: true, userId: id, userEmail: email, userName: name }),
      logout: () => set({ isAuthenticated: false, userId: null, userEmail: null, userName: null, profile: null }),
      setProfile: (profile) => set({ profile }),
      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
      addToHistory: (analysis) => set((s) => ({
        analysisHistory: [analysis, ...s.analysisHistory].slice(0, 50)
      })),
      setQRSession: (sessionId) => set({ qrSessionId: sessionId, qrStatus: 'pending', qrImageUrl: null }),
      setQRStatus: (status) => set({ qrStatus: status }),
      setQRImage: (url) => set({ qrImageUrl: url, qrStatus: 'received' }),
      addHydration: (ml) => set((s) => {
        const newTotal = s.hydrationLog.totalMl + ml;
        return { hydrationLog: { ...s.hydrationLog, totalMl: newTotal, entries: [...s.hydrationLog.entries, { time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), amountMl: ml, type: 'water' }] } };
      }),
      resetHydration: () => set((s) => ({ hydrationLog: { ...s.hydrationLog, totalMl: 0, entries: [] } })),
      addGroceryItem: (item) => set((s) => ({ groceryItems: [...s.groceryItems, item] })),
      toggleGroceryItem: (id) => set((s) => ({ groceryItems: s.groceryItems.map(i => i.id === id ? { ...i, checked: !i.checked } : i) })),
      removeGroceryItem: (id) => set((s) => ({ groceryItems: s.groceryItems.filter(i => i.id !== id) })),
      addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      clearChat: () => set({ chatMessages: [] }),
      toggleSavedFood: (food) => set((s) => {
        const exists = s.savedFoods.find(f => f.id === food.id);
        return { savedFoods: exists ? s.savedFoods.filter(f => f.id !== food.id) : [...s.savedFoods, food] };
      }),
      setTheme: (theme) => {
        set({ theme });
        const root = document.documentElement;
        if (theme === 'dark') root.setAttribute('data-theme', 'dark');
        else if (theme === 'light') root.removeAttribute('data-theme');
        else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) root.setAttribute('data-theme', 'dark');
          else root.removeAttribute('data-theme');
        }
      }
    }),
    {
      name: 'nutrivision-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userId: state.userId,
        userEmail: state.userEmail,
        userName: state.userName,
        profile: state.profile,
        analysisHistory: state.analysisHistory,
        groceryItems: state.groceryItems,
        hydrationLog: state.hydrationLog,
        savedFoods: state.savedFoods,
        theme: state.theme,
        nutritionGoals: state.nutritionGoals,
        chatMessages: state.chatMessages,
      })
    }
  )
);
