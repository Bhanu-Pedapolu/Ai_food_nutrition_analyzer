// NutriVision — AI Chat Service (Demo / Abstraction)
// In production, replace with actual AI API (Gemini, GPT-4, etc.)

import type { ChatMessage } from '../types';

const NUTRITION_RESPONSES: Record<string, string> = {
  protein: 'Great vegetarian protein sources include paneer (cottage cheese), tofu, chickpeas, lentils (dal), kidney beans (rajma), Greek yogurt, quinoa, and edamame. Aim for 0.8–1.6g of protein per kg of body weight daily.',
  iron: 'Iron-rich foods for vegetarians: spinach, lentils, tofu, pumpkin seeds, quinoa, and iron-fortified cereals. Pair with Vitamin C (like lemon juice) to enhance absorption. Avoid tea/coffee immediately after iron-rich meals.',
  breakfast: 'Healthy Indian breakfast ideas: Oats upma, vegetable poha, masala oatmeal with fruits, moong dal chilla, idli with sambar, smoothie bowls with nuts and seeds, or avocado toast with eggs. Aim for protein + fiber + healthy fats.',
  hot: 'On hot days, prioritize hydrating foods: coconut water, watermelon, cucumber, buttermilk (chaas), green smoothies, and fresh salads. Avoid heavy oily foods that can slow digestion.',
  fiber: 'High-fiber Indian foods: whole wheat roti, oats, brown rice, lentils, rajma, spinach, fenugreek (methi), guava, pears, and flaxseeds. Aim for 25–35g of fiber daily for digestive health.',
  energy: 'For sustained energy: choose complex carbs (oats, brown rice, sweet potato), combine with protein (dal, eggs, paneer) and healthy fats (nuts, seeds, ghee in moderation). Avoid refined sugar spikes.',
  weight: 'For healthy weight management, focus on: portion control, high-protein meals to stay full, fiber-rich vegetables, reducing refined carbs and sugar, staying hydrated, and not skipping meals — especially breakfast.',
  calcium: 'Calcium-rich foods: low-fat dairy (yogurt, paneer, milk), ragi (finger millet), sesame seeds (til), almonds, broccoli, and amaranth. Vitamin D is essential for calcium absorption.',
  omega: 'Omega-3 rich foods: flaxseeds, chia seeds, walnuts, fatty fish (salmon, sardines), and hemp seeds. For vegetarians, flaxseed oil and algae-based supplements are excellent options.',
  immunity: 'Foods that support immunity: citrus fruits (vitamin C), ginger, garlic, turmeric (curcumin), yogurt (probiotics), green leafy vegetables, and berries. Regular varied nutrition matters more than any single "superfood".',
};

function generateResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('protein') || lower.includes('vegetarian protein')) return NUTRITION_RESPONSES.protein;
  if (lower.includes('iron')) return NUTRITION_RESPONSES.iron;
  if (lower.includes('breakfast')) return NUTRITION_RESPONSES.breakfast;
  if (lower.includes('hot') || lower.includes('summer') || lower.includes('hydrat')) return NUTRITION_RESPONSES.hot;
  if (lower.includes('fiber') || lower.includes('fibre') || lower.includes('digestiv')) return NUTRITION_RESPONSES.fiber;
  if (lower.includes('energy') || lower.includes('tired') || lower.includes('fatigue')) return NUTRITION_RESPONSES.energy;
  if (lower.includes('weight') || lower.includes('lose') || lower.includes('diet')) return NUTRITION_RESPONSES.weight;
  if (lower.includes('calcium') || lower.includes('bone')) return NUTRITION_RESPONSES.calcium;
  if (lower.includes('omega') || lower.includes('fatty acid')) return NUTRITION_RESPONSES.omega;
  if (lower.includes('immune') || lower.includes('immunity') || lower.includes('sick')) return NUTRITION_RESPONSES.immunity;

  // Generic responses
  const generics = [
    'That\'s a great nutrition question! A balanced diet with a variety of whole foods — vegetables, legumes, whole grains, and healthy proteins — is the best foundation for good health. Would you like specific information about any nutrient or food group?',
    'I recommend focusing on whole, minimally processed foods. Indian cuisine has many naturally nutritious options like dal, sabzi, and curd. What specific aspect of nutrition would you like to explore?',
    'Nutrition is highly individual! Key principles: eat plenty of vegetables and legumes, choose whole grains over refined ones, stay hydrated, and practice mindful eating. Is there a specific concern I can help with?',
    'For personalized nutrition advice, consider consulting a registered dietitian. In the meantime, I can help with general information about specific foods, nutrients, or healthy eating patterns. What would you like to know?',
  ];

  return generics[Math.floor(Math.random() * generics.length)];
}

export async function sendChatMessage(
  message: string,
  context?: { foodName?: string; nutritionData?: Record<string, number> }
): Promise<string> {
  // Simulate API response time
  await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

  // In production, call your AI backend:
  // const response = await fetch('/api/chat', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ message, context }),
  // });
  // const data = await response.json();
  // return data.reply;

  return generateResponse(message);
}

export function createMessage(role: 'user' | 'assistant', content: string): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    role,
    content,
    timestamp: new Date(),
  };
}

export const INITIAL_GREETING = 'Hello! I\'m your NutriVision AI assistant. 🌿 I can help you understand your food, suggest healthier alternatives, answer nutrition questions, and give you personalized insights. What would you like to know today?';
