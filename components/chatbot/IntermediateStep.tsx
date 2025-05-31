import { useState } from "react";
import type { Message } from "ai";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Cog } from "lucide-react";

// Helper to clean message content similar to ChatMessageBubble
function formatMessageContent(content: string): string {
  if (!content) return '';
  
  // Split by newlines and process each line separately
  const lines = content.split('\n');
  const processedLines = lines.map(line => {
    // Skip empty lines that might cause extra spacing
    if (!line.trim()) return '';
    
    // Extract content from 2:[...] pattern if present
    const match = line.match(/^\d+:\s*\[["']?(.*?)["']?\]$/);
    if (match && match[1]) {
      return match[1];
    }
    
    // If not a full match pattern, clean up partial patterns
    return line
      .replace(/^\d+:\s*\[["']?/g, '') // Remove prefix like "2:["
      .replace(/["']?\]$/g, '');        // Remove suffix like "]"
  });
  
  // Join lines back together, filtering out empty lines
  content = processedLines.filter(line => line !== '').join('\n');
  
  // Clean up other common escape sequences,
  // but DON'T replace \n with newlines (keep literal \n as requested)
  content = content.replace(/\\"/g, '"');
  content = content.replace(/\\\\/g, '\\');
  
  return content;
}

export function IntermediateStep(props: { message: Message }) {
  // Safely parse content, handling potential errors
  let parsedInput = { action: { name: "unknown", args: {} }, observation: "No data" };
  try {
    if (props.message && props.message.content) {
      // Format the content before parsing
      const formattedContent = formatMessageContent(props.message.content);
      const parsed = JSON.parse(formattedContent);
      parsedInput = {
        action: parsed.action || { name: "unknown", args: {} },
        observation: parsed.observation || "No observation data"
      };
    }
  } catch (e) {
    console.error("Error parsing intermediate step content:", e);
  }
  
  const action = parsedInput.action || { name: "unknown", args: {} };
  const observation = parsedInput.observation || "No observation data";
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="mr-auto bg-muted/50 border border-border rounded-lg p-2.5 max-w-[90%] mb-3 whitespace-pre-wrap flex flex-col">
      <button
        type="button"
        className={cn(
          "text-left flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
          expanded && "w-full",
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <Cog className="h-4 w-4" />
        <span>
          <span className="opacity-80">Step:</span>{" "}
          <code className="font-mono bg-secondary/50 px-1.5 py-0.5 rounded text-xs">
            {action.name || "unknown"}
          </code>
        </span>
        <span className={cn("ml-auto", expanded && "hidden")}>
          <ChevronDown className="w-4 h-4" />
        </span>
        <span className={cn("ml-auto", !expanded && "hidden")}>
          <ChevronUp className="w-4 h-4" />
        </span>
      </button>
      
      <div
        className={cn(
          "overflow-hidden max-h-0 transition-all ease-in-out duration-300 text-sm mt-2",
          expanded && "max-h-[360px] pt-2",
        )}
      >
        <div className="border-t border-border pt-2 space-y-3">
          <div>
            <div className="font-medium text-xs uppercase text-muted-foreground mb-1">Input</div>
            <pre className="bg-background/50 p-2 rounded-md border text-xs overflow-auto max-h-[100px]">
              {JSON.stringify(action.args || {}, null, 2)}
            </pre>
          </div>
          
          <div>
            <div className="font-medium text-xs uppercase text-muted-foreground mb-1">Output</div>
            <pre className="bg-background/50 p-2 rounded-md border text-xs overflow-auto max-h-[200px]">
              {typeof observation === 'string' ? observation : JSON.stringify(observation, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}