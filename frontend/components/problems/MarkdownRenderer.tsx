import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ content, className = "" }: MarkdownRendererProps) => {
  return (
    <div className={`prose-config ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-2xl font-black uppercase tracking-tight border-b-2 border-current pb-2 mb-4" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-xl font-bold mt-6 mb-3 uppercase tracking-tight" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="leading-relaxed mb-4 text-sm opacity-90" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="list-disc list-outside ml-5 mb-4 space-y-1 text-sm" {...props} />
          ),
          code: ({ ...props }) => (
            <code className="bg-gray-500/20 text-emerald-500 px-1.5 py-0.5 rounded text-xs font-mono font-bold" {...props} />
          ),
          pre: ({ ...props }) => (
            <pre className="bg-black/20 p-4 rounded-md font-mono text-xs my-4 overflow-x-auto" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};