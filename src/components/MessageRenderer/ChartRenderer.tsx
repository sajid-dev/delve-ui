"use client";

import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Simple horizontal bar chart renderer for chat responses.
type ChartDatum = {
  label: string;
  value: number;
};

function isDatum(value: unknown): value is ChartDatum {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.label === "string" &&
    typeof candidate.value === "number" &&
    Number.isFinite(candidate.value)
  );
}

function isChartData(data: unknown): data is ChartDatum[] {
  return Array.isArray(data) && data.every(isDatum);
}

export default function ChartRenderer({ data }: { data: unknown }) {
  if (!isChartData(data) || data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/40 p-3 text-sm text-muted-foreground">
        Unable to render chart preview.
      </div>
    );
  }

  const maxValue = data.reduce((max, item) => Math.max(max, item.value), 1);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-foreground">
          Chart preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {data.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/80"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
