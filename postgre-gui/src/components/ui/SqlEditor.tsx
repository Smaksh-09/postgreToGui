"use client";

import { useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql, PostgreSQL } from "@codemirror/lang-sql";
import { EditorView } from "@codemirror/view";

// 1. Theme Definition (Refined for visibility)
const midnightTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#0a0a0a",
      color: "#e4e4e7",
      height: "100%", // Critical for resizing
    },
    ".cm-content": {
      caretColor: "#f97316",
      padding: "12px 0",
      color: "#e4e4e7",
    },
    // Fix the "White Bar" issue by forcing a dark background on the active line
    ".cm-activeLine": {
      backgroundColor: "rgba(255, 255, 255, 0.05) !important",
    },
    ".cm-gutters": {
      backgroundColor: "#0a0a0a",
      color: "rgba(255, 255, 255, 0.3)",
      borderRight: "1px solid rgba(255, 255, 255, 0.06)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: "#f97316",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
      backgroundColor: "rgba(249, 115, 22, 0.2) !important",
    },
  },
  { dark: true }
);

// 2. Syntax Highlighting (Unchanged)
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

const midnightHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: "#f97316", fontWeight: "bold" },
  { tag: tags.operatorKeyword, color: "#f97316" },
  { tag: tags.string, color: "#34d399" },
  { tag: tags.number, color: "#c084fc" },
  { tag: tags.bool, color: "#c084fc" },
  { tag: tags.propertyName, color: "#e4e4e7" },
  { tag: tags.comment, color: "rgba(255,255,255,0.3)", fontStyle: "italic" },
  { tag: tags.function(tags.name), color: "#fbbf24" },
]);

interface SqlEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  minHeight?: string;
}

export default function SqlEditor({
  value,
  onChange,
  readOnly = false,
  className = "",
  minHeight = "120px",
}: SqlEditorProps) {
  const handleChange = useCallback(
    (val: string) => {
      if (onChange) onChange(val);
    },
    [onChange]
  );

  return (
    <div
      // 3. Resizing Fix: 
      // - resize-y: Enables the drag handle
      // - overflow-hidden: Ensures the handle stays within bounds (sometimes 'auto' hides it)
      // - flex flex-col: Forces the editor child to expand
      className={`relative flex flex-col resize-y overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] ${className}`}
      style={{ minHeight, maxHeight: "40vh" }} // Set explicit limits
    >
      <CodeMirror
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        // THE KEY FIX: Pass theme here, not in extensions!
        theme={midnightTheme} 
        height="100%"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: false, // Cleaner look without fold arrows
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          tabSize: 2,
        }}
        extensions={[
          sql({ dialect: PostgreSQL }),
          syntaxHighlighting(midnightHighlight),
          EditorView.lineWrapping,
        ]}
      />
    </div>
  );
}