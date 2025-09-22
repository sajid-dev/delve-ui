// types/message.ts
export type Message =
  | { role: "user" | "ai" | "agent"; type: "text"; content: string }
  | { role: "user" | "ai" | "agent"; type: "markdown"; content: string }
  | {
      role: "user" | "ai" | "agent";
      type: "code";
      content: { language: string; code: string };
    }
  | { role: "user" | "ai" | "agent"; type: "table"; content: string[][] }
  | { role: "user" | "ai" | "agent"; type: "chart"; content: { label: string; value: number }[] }
  | {
      role: "user" | "ai" | "agent";
      type: "kpi";
      content: { label: string; value: string; change?: string }[];
    }
  | {
      role: "user" | "ai" | "agent";
      type: "timeline";
      content: { date: string; event: string }[];
    }
  | {
      role: "user" | "ai" | "agent";
      type: "image";
      content: { url: string; alt?: string };
    }
  | { role: "user" | "ai" | "agent"; type: "video"; content: { url: string } }
  | { role: "user" | "ai" | "agent"; type: "audio"; content: { url: string } }
  | {
      role: "user" | "ai" | "agent";
      type: "form";
      content: { fields: { name: string; label: string; type: string }[] };
    }
  | { role: "user" | "ai" | "agent"; type: "options"; content: string[] }
  | {
      role: "user" | "ai" | "agent";
      type: "buttons";
      content: { label: string; action: string }[];
    }
  | {
      role: "user" | "ai" | "agent";
      type: "checklist";
      content: { task: string; done: boolean }[];
    }
  | {
      role: "user" | "ai" | "agent";
      type: "citations";
      content: { text: string; url: string }[];
    }
  | {
      role: "user" | "ai" | "agent";
      type: "knowledge";
      content: { title: string; description: string; url?: string };
    }
  | {
      role: "user" | "ai" | "agent";
      type: "search";
      content: { title: string; url: string; snippet: string }[];
    }
  | {
      role: "user" | "ai" | "agent";
      type: "tool_call";
      content: { tool: string; input: Record<string, unknown> };
    }
  | { role: "user" | "ai" | "agent"; type: "action_result"; content: string }
  | {
      role: "user" | "ai" | "agent";
      type: "alert";
      content: {
        level: "info" | "success" | "warning" | "error";
        message: string;
      };
    }
  | {
      role: "user" | "ai" | "agent";
      type: "file";
      content: { name: string; url: string };
    }
  | {
      role: "user" | "ai" | "agent";
      type: "map";
      content: { lat: number; lng: number; label: string }[];
    }
  | {
      role: "user" | "ai" | "agent";
      type: "graph";
      content: {
        nodes: { id: string; label: string }[];
        edges: { from: string; to: string }[];
      };
    };
