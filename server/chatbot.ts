import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const hasGeminiKey = !!GEMINI_API_KEY;
const genAI = hasGeminiKey ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

interface Message {
  role: "user" | "model";
  content: string;
}

interface ChatSession {
  history: Message[];
  model: any;
}

const activeSessions = new Map<string, ChatSession>();

const systemPrompt = `You are a helpful AI assistant for Master Student . Keep responses SHORT and CRISP (2-3 sentences max). Use **bold** for important terms.

Platform facts:
- Upload notes → earn 20 coins (when verified)
- Download notes → earn 50% of price
- Monthly subscription: ₹59 (₹70 GST)
- Yearly subscription: ₹499 (₹589 GST)
- Teachers approve notes → extra rewards

IMPORTANT: Always respond in 2-3 short sentences with **bold** text for key info. Be concise!`;

function getFallbackReply(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes("upload")) {
    return "**To upload notes**, go to the upload section, add your files and details, then submit for review. Once approved, you **earn 20 coins per upload** and extra from student downloads.";
  }

  if (msg.includes("earn") || msg.includes("coins") || msg.includes("money")) {
    return "You **earn coins** when your notes are uploaded and downloaded by students. Each verified upload gives **20 coins**, and you also earn **50% of the coin price** on every paid download.";
  }

  if (msg.includes("download")) {
    return "You can **download notes** from the catalog or trending sections once you are logged in. Some downloads are **free**, others use coins or a **low‑cost subscription** for unlimited access.";
  }

  if (msg.includes("subscription") || msg.includes("price") || msg.includes("plan")) {
    return "The platform offers **affordable subscriptions** so students can access many notes without worrying about per‑note cost. Typical plans are **low‑priced monthly and yearly options** designed for Indian students.";
  }

  if (msg.includes("teacher") || msg.includes("topper") || msg.includes("become")) {
    return "To **become a topper/teacher**, start by uploading high‑quality notes and completing your profile. As your notes get **approved and downloaded**, you build reputation and **earn more coins**.";
  }

  return "I’m a **study assistant for Master Student** and can help with uploads, downloads, coins and subscriptions. Ask me something like **“How do I upload notes?”** or **“How do I earn coins?”** for a focused answer.";
}

export async function initializeChatSession(userId: string) {
  try {
    if (!hasGeminiKey || !genAI) {
      // No Gemini available – just initialize empty in‑memory session
      activeSessions.set(userId, {
        history: [],
        model: null,
      });
      return null;
    }

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

    if (!session && hasGeminiKey && genAI) {
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

    // If we still don't have a Gemini session, use fallback immediately
    if (!session || !session.model) {
      const reply = getFallbackReply(userMessage);
      if (session) {
        session.history.push({ role: "user", content: userMessage });
        session.history.push({ role: "model", content: reply });
      }
      return reply;
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
      getFallbackReply(userMessage);

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
    // Never break the UI – always return a helpful fallback
    return getFallbackReply(userMessage);
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
