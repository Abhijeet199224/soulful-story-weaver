import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles, BookOpen, Users, Lightbulb } from "lucide-react";
import { streamChat, Msg } from "@/lib/ai";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const quickPrompts = [
  { icon: BookOpen, label: "Plot idea", prompt: "Give me an interesting plot twist for a literary fiction novel about family secrets and homecoming." },
  { icon: Users, label: "New character", prompt: "Create a compelling supporting character for a story about a journalist uncovering family history." },
  { icon: Lightbulb, label: "Scene idea", prompt: "Suggest a vivid, emotional scene set during a rainy evening that reveals a character's inner conflict." },
];

const AIStoryAssistant = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        mode: "story",
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
        onError: (err) => {
          toast.error(err);
          setIsLoading(false);
        },
      });
    } catch {
      toast.error("Failed to connect to AI");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Bot className="h-5 w-5 text-primary" />
        <h2 className="font-display text-base font-semibold text-foreground">AI Story Developer</h2>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
            <div className="rounded-full bg-primary/10 p-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-display text-lg font-semibold text-foreground">Story Developer</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Brainstorm plots, develop characters, and craft scenes with AI assistance.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {quickPrompts.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => send(qp.prompt)}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs text-secondary-foreground transition-all hover:border-primary/40 hover:bg-secondary"
                >
                  <qp.icon className="h-3.5 w-3.5 text-primary" />
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 text-secondary-foreground"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === "user" && (
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your story..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIStoryAssistant;
