import type { AdminDashboard, AdminSessionSummary } from "@/types/admin";
import type { ConversationDetail, ConversationSummary } from "@/types/conversation";
import type { Message } from "@/types/message";

const LLM_BACKEND_URL =
  process.env.NEXT_PUBLIC_LLM_BACKEND_URL?.trim() || "http://localhost:8000";
const HEALTH_BACKEND_URL = process.env.NEXT_PUBLIC_HEALTH_BACKEND_URL?.trim();

type BackendStatus = "online" | "offline";

export type BackendStatusResult = {
  status: BackendStatus;
  detail?: string;
};

const OFFLINE_RESULT: BackendStatusResult = {
  status: "offline",
  detail: "LLM backend is not reachable.",
};

function buildUrl(base: string, path: string): string {
  const normalizedBase = base.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${suffix}`;
}

function resolveHealthCheckUrl(): string {
  const fallback = buildUrl(LLM_BACKEND_URL, "/health");

  if (!HEALTH_BACKEND_URL) {
    return fallback;
  }

  try {
    const candidate = new URL(HEALTH_BACKEND_URL, LLM_BACKEND_URL);

    if (!candidate.pathname || candidate.pathname === "/") {
      candidate.pathname = "/health";
    }

    return candidate.toString();
  } catch {
    return fallback;
  }
}

const HEALTH_CHECK_URL = resolveHealthCheckUrl();

export async function checkBackendStatus(): Promise<BackendStatusResult> {
  try {
    const response = await fetch(HEALTH_CHECK_URL, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        status: "offline",
        detail: `Health check failed with status ${response.status}`,
      };
    }

    const payload = await response.json().catch(() => null);
    const detail =
      payload && typeof payload === "object" && "status" in payload
        ? String((payload as Record<string, unknown>).status)
        : undefined;

    return { status: "online", detail };
  } catch (error) {
    console.error("LLM backend health check failed", error);
    return OFFLINE_RESULT;
  }
}

type ChatCompletionResult = {
  messages: Message[];
  conversationId?: string;
};

async function requestBackendChat(
  prompt: string,
  conversationId?: string
): Promise<ChatCompletionResult> {
  const url = buildUrl(LLM_BACKEND_URL, "/chat");

  const payload: Record<string, unknown> = {
    message: prompt,
    user_id: "jack",
  };

  if (conversationId) {
    payload.conversation_id = conversationId;
    payload.session_id = conversationId;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed with status ${response.status}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  const messages = normalizeLlmPayload(data);

  if (!messages.length) {
    throw new Error("Received an unexpected response from the LLM backend.");
  }

  const responseConversationId =
    typeof data.session_id === "string"
      ? data.session_id
      : typeof data.conversation_id === "string"
        ? data.conversation_id
        : undefined;

  return {
    messages,
    conversationId: responseConversationId,
  };
}

export async function sendMessage(
  prompt: string,
  conversationId?: string
): Promise<ChatCompletionResult> {
  return requestBackendChat(prompt, conversationId);
}

export async function fetchAdminDashboard(): Promise<AdminDashboard> {
  const url = buildUrl(LLM_BACKEND_URL, "/admin/dashboard");

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load admin dashboard (${response.status})`);
  }

  const payload = (await response.json()) as unknown;

  if (!payload || typeof payload !== "object") {
    throw new Error("Unexpected admin dashboard payload");
  }

  return payload as AdminDashboard;
}

export async function fetchAdminUserConversations(
  userId: string
): Promise<AdminSessionSummary[]> {
  const url = buildUrl(
    LLM_BACKEND_URL,
    `/admin/conversations/${encodeURIComponent(userId)}`
  );

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load user conversations (${response.status})`);
  }

  const payload = (await response.json()) as unknown;
  if (!Array.isArray(payload)) {
    throw new Error("Unexpected user conversations payload");
  }

  return payload
    .map((item) => normalizeAdminSession(item))
    .filter((item): item is AdminSessionSummary => item !== null);
}

export async function deleteSession(
  sessionId: string,
  userId: string
): Promise<void> {
  const url = buildUrl(
    LLM_BACKEND_URL,
    `/sessions/${sessionId}?user_id=${encodeURIComponent(userId)}`
  );

  const response = await fetch(url, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete session (${response.status})`);
  }
}

export async function clearSessions(userId: string): Promise<void> {
  const url = buildUrl(
    LLM_BACKEND_URL,
    `/sessions?user_id=${encodeURIComponent(userId)}`
  );

  const response = await fetch(url, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to clear sessions (${response.status})`);
  }
}

export async function fetchConversations(userId: string): Promise<ConversationSummary[]> {
  const url = buildUrl(LLM_BACKEND_URL, `/sessions?user_id=${encodeURIComponent(userId)}`);

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load conversations (${response.status})`);
  }

  const payload = (await response.json()) as unknown;
  if (!Array.isArray(payload)) {
    throw new Error("Unexpected conversations payload");
  }

  return payload
    .map((item) => normalizeConversation(item))
    .filter((item): item is ConversationSummary => item !== null);
}

export async function fetchConversationDetail(
  conversationId: string,
  userId: string
): Promise<ConversationDetail> {
  const url = buildUrl(
    LLM_BACKEND_URL,
    `/sessions/${conversationId}?user_id=${encodeURIComponent(userId)}`
  );

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load conversation (${response.status})`);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  return normalizeConversationDetail(payload, conversationId);
}

function normalizeLlmPayload(payload: Record<string, unknown>): Message[] {
  const data =
    payload.data && typeof payload.data === "object"
      ? (payload.data as Record<string, unknown>)
      : null;

  const componentsRaw = data && Array.isArray(data.components)
    ? data.components
    : null;

  if (componentsRaw) {
    const messages = componentsRaw
      .map((component) => normalizeComponent(component, "ai"))
      .filter((componentMessage): componentMessage is Message => componentMessage !== null);

    if (messages.length > 0) {
      return messages;
    }
  }

  const answer = typeof payload.answer === "string" ? payload.answer : null;
  if (answer) {
    const contentType =
      typeof payload.content_type === "string"
        ? payload.content_type.toLowerCase()
        : "text";

    if (contentType === "markdown") {
      return [{ role: "ai", type: "markdown", content: answer }];
    }

    return [{ role: "ai", type: "text", content: answer }];
  }

  if (typeof payload.type === "string" && payload.content !== undefined) {
    const candidate = payload as Omit<Message, "role">;
    return [{ role: "ai", ...candidate }];
  }

  if (typeof payload.message === "string") {
    return [
      {
        role: "ai",
        type: "markdown",
        content: payload.message,
      },
    ];
  }

  return [];
}

function normalizeComponent(
  component: unknown,
  defaultRole: Message["role"] = "ai"
): Message | null {
  if (!component || typeof component !== "object") {
    return null;
  }

  const record = component as Record<string, unknown>;
  const typeRaw = typeof record.type === "string" ? record.type.toLowerCase() : null;
  if (!typeRaw) return null;

  const payload = record.payload as unknown;
  const normalizedRole =
    typeof record.role === "string" ? record.role.toLowerCase() : undefined;
  const role: Message["role"] =
    normalizedRole === "user" || normalizedRole === "agent"
      ? (normalizedRole as Message["role"])
      : defaultRole;

  const content = extractPayloadContent(payload);

  switch (typeRaw) {
    case "text": {
      const textContent = typeof content === "string" ? content : null;
      if (textContent) {
        return { role, type: "text", content: textContent };
      }
      break;
    }
    case "markdown": {
      const markdownContent = typeof content === "string" ? content : null;
      if (markdownContent) {
        return { role, type: "markdown", content: markdownContent };
      }
      break;
    }
    case "code": {
      if (content && typeof content === "object") {
        const codeRecord = content as Record<string, unknown>;
        const codeValue = typeof codeRecord.code === "string" ? codeRecord.code : null;
        const language = typeof codeRecord.language === "string" ? codeRecord.language : "text";
        if (codeValue) {
          return {
            role,
            type: "code",
            content: { language, code: codeValue },
          };
        }
      }
      break;
    }
    case "table": {
      if (payload && typeof payload === "object") {
        const tablePayload = payload as Record<string, unknown>;
        const headers = Array.isArray(tablePayload.headers)
          ? tablePayload.headers.filter((item): item is string => typeof item === "string")
          : undefined;
        const rowsRaw = tablePayload.rows;
        const rows = Array.isArray(rowsRaw)
          ? rowsRaw
              .map((row) =>
                Array.isArray(row)
                  ? row.filter((cell): cell is string => typeof cell === "string")
                  : []
              )
              .filter((row) => row.length > 0)
          : [];

        if ((headers && headers.length > 0) || rows.length > 0) {
          const tableData = headers ? [headers, ...rows] : rows;
          if (tableData.length > 0) {
            return {
              role,
              type: "table",
              content: tableData,
            };
          }
        }
      }
      break;
    }
  }

  const fallbackText =
    typeof content === "string"
      ? content
      : payload !== undefined
        ? safeJsonStringify(payload)
        : undefined;

  if (fallbackText) {
    return { role, type: "text", content: fallbackText };
  }

  return null;
}

function extractPayloadContent(payload: unknown): unknown {
  if (payload && typeof payload === "object" && "content" in payload) {
    return (payload as Record<string, unknown>).content;
  }
  return payload;
}

function safeJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function normalizeAdminSession(
  input: unknown
): AdminSessionSummary | null {
  if (!input || typeof input !== "object") return null;

  const record = input as Record<string, unknown>;
  const sessionId = typeof record.session_id === "string" ? record.session_id : null;
  if (!sessionId) return null;

  const title = typeof record.title === "string" ? record.title : "Untitled";
  const messageCount = typeof record.message_count === "number" ? record.message_count : 0;
  const createdAt = typeof record.created_at === "string" ? record.created_at : "";
  const updatedAt = typeof record.updated_at === "string" ? record.updated_at : "";
  const tokensUsed = typeof record.tokens_used === "number" ? record.tokens_used : 0;

  const latestAnswerRaw =
    record.latest_answer && typeof record.latest_answer === "object"
      ? (record.latest_answer as Record<string, unknown>)
      : null;

  const latestAnswer =
    latestAnswerRaw && typeof latestAnswerRaw.timestamp === "string"
      ? {
          session_id:
            typeof latestAnswerRaw.session_id === "string"
              ? latestAnswerRaw.session_id
              : sessionId,
          timestamp: latestAnswerRaw.timestamp,
        }
      : undefined;

  return {
    session_id: sessionId,
    title,
    message_count: messageCount,
    created_at: createdAt,
    updated_at: updatedAt,
    tokens_used: tokensUsed,
    latest_answer: latestAnswer,
  };
}

function normalizeConversation(input: unknown): ConversationSummary | null {
  if (!input || typeof input !== "object") return null;

  const record = input as Record<string, unknown>;
  const conversationId =
    typeof record.session_id === "string"
      ? record.session_id
      : typeof record.conversation_id === "string"
        ? record.conversation_id
        : null;
  const title =
    typeof record.title === "string"
      ? record.title
      : typeof record.name === "string"
        ? record.name
        : typeof record.session_title === "string"
          ? record.session_title
          : "Untitled conversation";
  const updatedAt = typeof record.updated_at === "string"
    ? record.updated_at
    : typeof record.last_activity_at === "string"
      ? record.last_activity_at
      : undefined;
  const messageCount = typeof record.message_count === "number"
    ? record.message_count
    : typeof record.messages_count === "number"
      ? record.messages_count
      : undefined;

  if (!conversationId) return null;

  return {
    conversationId,
    title,
    updatedAt,
    messageCount,
  };
}

function normalizeConversationDetail(
  payload: Record<string, unknown>,
  fallbackConversationId: string
): ConversationDetail {
  const conversationId =
    typeof payload.session_id === "string"
      ? payload.session_id
      : typeof payload.conversation_id === "string"
        ? payload.conversation_id
        : fallbackConversationId;

  const title =
    typeof payload.title === "string"
      ? payload.title
      : typeof payload.name === "string"
        ? payload.name
        : undefined;

  const messagesRaw = Array.isArray(payload.messages) ? payload.messages : [];
  const messages: Message[] = messagesRaw
    .flatMap((item) => normalizeSessionMessage(item))
    .filter((item): item is Message => item !== null);

  return {
    conversationId,
    title,
    messages,
  };
}

function normalizeSessionMessage(input: unknown): Message[] {
  if (!input || typeof input !== "object") return [];

  const record = input as Record<string, unknown>;
  const roleRaw = typeof record.role === "string" ? record.role.toLowerCase() : "assistant";
  const role: Message["role"] = roleRaw === "user" ? "user" : "ai";

  const componentsRaw = Array.isArray(record.components) ? record.components : null;
  if (componentsRaw && componentsRaw.length > 0) {
    const componentMessages = componentsRaw
      .map((component) => normalizeComponent(component, role))
      .filter((message): message is Message => message !== null);

    if (componentMessages.length > 0) {
      return componentMessages;
    }
  }

  const content = typeof record.content === "string" ? record.content : undefined;
  const contentType =
    typeof record.content_type === "string"
      ? record.content_type.toLowerCase()
      : "text";

  if (!content) {
    return [];
  }

  switch (contentType) {
    case "markdown":
      return [{ role, type: "markdown", content }];
    case "table":
      return [
        {
          role,
          type: "table",
          content: [[content]],
        },
      ];
    case "text":
    default:
      return [{ role, type: "text", content }];
  }
}
