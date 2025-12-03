import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface Message {
  role: "user" | "model";
  content: string;
}

interface ChatSession {
  history: Message[];
  model: any;
}

const activeSessions = new Map<string, ChatSession>();

const systemPrompt = `You are a helpful AI assistant for StudentNotesMarketplace. Keep responses SHORT and CRISP (2-3 sentences max). Use **bold** for important terms.

Platform facts:
- Upload notes → earn 20 coins (when verified)
- Download notes → earn 50% of price
- Monthly subscription: ₹59 (₹70 GST)
- Yearly subscription: ₹499 (₹589 GST)
- Teachers approve notes → extra rewards

IMPORTANT: Always respond in 2-3 short sentences with **bold** text for key info. Be concise!`;

export async function initializeChatSession(userId: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    activeSessions.set(userId, {
      history: [],
      model: chat,
    });

    return chat;
  } catch (error) {
    console.error("Error initializing chat session:", error);
    throw error;
  }
}

export async function sendChatMessage(
  userId: string,
  userMessage: string
): Promise<string> {
  try {
    let session = activeSessions.get(userId);

    if (!session) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: systemPrompt }],
          },
          {
            role: "model",
            parts: [
              {
                text: "I understand. I'm here to help with StudentNotesMarketplace. How can I assist you today?",
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      session = {
        history: [
          { role: "user", content: systemPrompt },
          {
            role: "model",
            content:
              "I understand. I'm here to help with StudentNotesMarketplace. How can I assist you today?",
          },
        ],
        model: chat,
      };

      activeSessions.set(userId, session);
    }

    // Add user message to history
    session.history.push({
      role: "user",
      content: userMessage,
    });

    // Send message and get response
    const result = await session.model.sendMessage(userMessage);
    const responseText =
      result.response.text() ||
      "I'm having trouble responding. Please try again.";

    // Add model response to history
    session.history.push({
      role: "model",
      content: responseText,
    });

    // Keep only last 20 messages to manage memory
    if (session.history.length > 40) {
      session.history = session.history.slice(-40);
    }

    return responseText;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
}

export function getChatHistory(userId: string): Message[] {
  const session = activeSessions.get(userId);
  return session?.history || [];
}

export function clearChatSession(userId: string) {
  activeSessions.delete(userId);
}

export const suggestedQuestions = [
  "How do I upload notes?",
  "How does the earning system work?",
  "What's the subscription cost?",
  "How can I download notes?",
  "How do I become a teacher?",
  "What subjects are available?",
  "How do I track my earnings?",
  "Can I edit my uploaded notes?",
];
