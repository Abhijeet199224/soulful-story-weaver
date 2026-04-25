"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Heading2, Italic, MessageSquareQuote, List, Save } from "lucide-react";

export interface TipTapEditorRef {
  replaceSelection: (text: string) => void;
  insertAtCursor: (text: string) => void;
  setContent: (content: string) => void;
}

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSelectionChange: (text: string) => void;
  onWordCountChange: (wordCount: number) => void;
  onSnapshot: () => void;
}

const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(function TipTapEditor(
  { content, onChange, onSelectionChange, onWordCountChange, onSnapshot },
  ref
) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your scene here...",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "tiptap rounded-xl bg-[#fffdf8] p-5 shadow-sm border border-slate-200",
      },
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      const { from, to } = currentEditor.state.selection;
      const selected = currentEditor.state.doc.textBetween(from, to, " ");
      onSelectionChange(selected.trim());
    },
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      const words = currentEditor.getText().trim().split(/\s+/).filter(Boolean).length;
      onChange(html);
      onWordCountChange(words);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (content !== editor.getHTML()) {
      editor.commands.setContent(content || "<p></p>", false);
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;
    const timer = setInterval(() => onSnapshot(), 12000);
    return () => clearInterval(timer);
  }, [editor, onSnapshot]);

  useImperativeHandle(ref, () => ({
    replaceSelection: (text: string) => {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      editor.chain().focus().insertContentAt({ from, to }, text).run();
    },
    insertAtCursor: (text: string) => {
      if (!editor) return;
      editor.chain().focus().insertContent(text).run();
    },
    setContent: (next: string) => {
      if (!editor) return;
      editor.commands.setContent(next || "<p></p>", false);
    },
  }));

  if (!editor) {
    return <div className="h-[60vh] animate-pulse rounded-xl border border-white/20 bg-black/20" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/20 bg-black/20 p-2">
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-slate-100">
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => editor.chain().focus().toggleBold().run()} className="rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-slate-100">
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className="rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-slate-100">
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-slate-100">
          <List className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className="rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-slate-100">
          <MessageSquareQuote className="h-3.5 w-3.5" /> Dialogue
        </button>
        <button onClick={() => onSnapshot()} className="ml-auto inline-flex items-center gap-1 rounded border border-amber-300/70 bg-amber-200 px-2 py-1 text-xs font-semibold text-slate-900">
          <Save className="h-3.5 w-3.5" /> Save Snapshot
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
});

export default TipTapEditor;
