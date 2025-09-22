"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Message } from "@/types/message";

import ChartRenderer from "./ChartRenderer";

export default function MessageRenderer({ message }: { message: Message }) {
  switch (message.type) {
    case "text":
      return <p className="leading-relaxed">{message.content}</p>;

    case "markdown":
      return (
        <div className="prose prose-sm dark:prose-invert">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      );

    case "code":
      return (
        <div className="overflow-hidden rounded-lg border border-border bg-muted/40">
          <div className="flex items-center justify-between border-b border-border/70 bg-muted/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>{message.content.language}</span>
          </div>
          <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
            <code>{message.content.code}</code>
          </pre>
        </div>
      );

    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-sm">
            <tbody>
              {message.content.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-border/60 last:border-none"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border-r border-border/60 px-3 py-2 text-left text-muted-foreground last:border-none"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "chart":
      return <ChartRenderer data={message.content} />;

    case "kpi":
      return (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {message.content.map((kpi, index) => (
            <Card key={index} className="shadow-sm">
              <CardHeader className="space-y-1 pb-3">
                <CardDescription className="text-xs uppercase tracking-wide">
                  {kpi.label}
                </CardDescription>
                <CardTitle className="text-2xl font-bold">
                  {kpi.value}
                </CardTitle>
              </CardHeader>
              {kpi.change && (
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  {kpi.change}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      );

    case "timeline":
      return (
        <ul className="space-y-2 text-sm">
          {message.content.map((timelineItem, index) => (
            <li key={index}>
              <span className="font-medium text-foreground">
                {timelineItem.date}
              </span>
              <span className="text-muted-foreground"> — {timelineItem.event}</span>
            </li>
          ))}
        </ul>
      );

    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={message.content.url}
          alt={message.content.alt || "AI generated"}
          className="rounded-lg border border-border object-contain"
        />
      );

    case "video":
      return (
        <video
          src={message.content.url}
          controls
          className="w-full rounded-lg border border-border"
        />
      );

    case "audio":
      return <audio src={message.content.url} controls className="w-full" />;

    case "form":
      return (
        <form className="space-y-4 text-sm">
          {message.content.fields.map((field, index) => (
            <div key={index} className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <Textarea name={field.name} />
              ) : (
                <Input type={field.type} name={field.name} />
              )}
            </div>
          ))}
          <Button type="submit" className="w-fit">
            Submit
          </Button>
        </form>
      );

    case "options":
      return (
        <ul className="space-y-2 text-sm">
          {message.content.map((option, index) => (
            <li key={index}>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start"
              >
                {option}
              </Button>
            </li>
          ))}
        </ul>
      );

    case "buttons":
      return (
        <div className="flex flex-wrap gap-2">
          {message.content.map((button, index) => (
            <Button key={index} size="sm" type="button">
              {button.label}
            </Button>
          ))}
        </div>
      );

    case "checklist":
      return (
        <ul className="space-y-2 text-sm">
          {message.content.map((task, index) => (
            <li key={index} className="flex items-center gap-2">
              <Checkbox defaultChecked={task.done} disabled className="mt-0.5" />
              <span className={cn(task.done && "text-muted-foreground line-through")}>
                {task.task}
              </span>
            </li>
          ))}
        </ul>
      );

    case "citations":
      return (
        <ol className="space-y-2 text-sm">
          {message.content.map((citation, index) => (
            <li key={index}>
              <a
                href={citation.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {citation.text}
              </a>
            </li>
          ))}
        </ol>
      );

    case "knowledge":
      return (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{message.content.title}</CardTitle>
            <CardDescription>{message.content.description}</CardDescription>
          </CardHeader>
          {message.content.url && (
            <CardContent className="pt-0">
              <Button variant="link" asChild>
                <a href={message.content.url} target="_blank" rel="noreferrer">
                  Learn more
                </a>
              </Button>
            </CardContent>
          )}
        </Card>
      );

    case "search":
      return (
        <ul className="space-y-3 text-sm">
          {message.content.map((result, index) => (
            <li key={index} className="space-y-1">
              <a
                href={result.url}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                {result.title}
              </a>
              <p className="text-muted-foreground">{result.snippet}</p>
            </li>
          ))}
        </ul>
      );

    case "tool_call":
      return (
        <div className="space-y-2 rounded-lg border border-dashed border-muted-foreground/50 bg-muted/40 p-4 text-sm">
          <p className="font-medium text-foreground">
            🔧 Tool invoked: {message.content.tool}
          </p>
          <pre className="overflow-x-auto rounded bg-background/80 p-3 text-xs text-muted-foreground">
            {JSON.stringify(message.content.input, null, 2)}
          </pre>
        </div>
      );

    case "action_result":
      return (
        <Alert variant="success">
          <AlertDescription>✅ {message.content}</AlertDescription>
        </Alert>
      );

    case "alert":
      return (
        <Alert variant={mapAlertVariant(message.content.level)}>
          <AlertDescription>{message.content.message}</AlertDescription>
        </Alert>
      );

    case "file":
      return (
        <Button asChild variant="link" className="px-0">
          <a href={message.content.url} download>
            📂 {message.content.name}
          </a>
        </Button>
      );

    case "map":
      return (
        <div className="space-y-2 text-sm">
          {message.content.map((marker, index) => (
            <p key={index}>
              📍 {marker.label} ({marker.lat}, {marker.lng})
            </p>
          ))}
        </div>
      );

    case "graph":
      return (
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
          <pre className="overflow-x-auto text-xs text-muted-foreground">
            {JSON.stringify(message.content, null, 2)}
          </pre>
          {/* Could render with a graph library later */}
        </div>
      );

    default:
      return <p>Unsupported message type</p>;
  }
}

function mapAlertVariant(level: "info" | "success" | "warning" | "error") {
  switch (level) {
    case "success":
      return "success" as const;
    case "warning":
      return "warning" as const;
    case "error":
      return "destructive" as const;
    default:
      return "info" as const;
  }
}
