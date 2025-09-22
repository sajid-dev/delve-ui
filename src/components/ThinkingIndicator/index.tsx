"use client";

import { Card, CardContent } from "@/components/ui/card";

const dots = [0, 1, 2];

export function ThinkingIndicator() {
  return (
    <Card className="inline-flex w-fit items-center gap-2 border-dashed border-muted-foreground/40 bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm">
      <CardContent className="flex items-center gap-2 p-0">
        <span>Thinking</span>
        <span className="flex gap-1">
          {dots.map((dot) => (
            <span
              key={dot}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
              style={{ animationDelay: `${dot * 0.15}s` }}
            />
          ))}
        </span>
      </CardContent>
    </Card>
  );
}
