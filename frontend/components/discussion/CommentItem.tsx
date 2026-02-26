import React from "react";
import { HiCode } from "react-icons/hi";
import { 
  HiHandThumbUp, 
  HiOutlineHandThumbUp, 
  HiOutlineChatBubbleLeft 
} from "react-icons/hi2";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface CommentProps {
  comment: {
    id: string;
    user: {
      username: string;
      full_name: string;
    };
    content: string;
    language?: string;
    upvotes: number;
    createdAt: Date;
    hasUpvoted: boolean;
  };
  onUpvote: (id: string) => void;
  onReply: (id: string) => void;
}

export const CommentItem = ({ comment, onUpvote, onReply }: CommentProps) => {
  const hasUpvoted = comment.hasUpvoted;

  /**
   * Enhanced parser to handle text and mixed code blocks
   */
  const renderFormattedContent = (content: string, defaultLang: string) => {
    // Split by triple backticks while keeping them in the array
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        // 1. Strip the backticks from start and end
        const rawContent = part.slice(3, -3).trim();
        
        const lines = rawContent.split("\n");
        let language = defaultLang || "javascript";
        let code = rawContent;

        // 2. Logic to detect if the first line is a language tag (e.g., ```cpp)
        // If there's a newline and the first line is one word, it's likely a language
        if (lines.length > 1) {
          const potentialLang = lines[0].trim();
          if (potentialLang.length > 0 && !potentialLang.includes(" ")) {
            language = potentialLang;
            code = lines.slice(1).join("\n");
          }
        }

        return (
          <div key={index} className="rounded-lg overflow-hidden my-4 shadow-sm border border-slate-200">
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: "1rem",
                fontSize: "13px",
                lineHeight: "1.6",
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      } else {
        // 3. Regular text - only render if not empty
        const trimmedPart = part.trim();
        if (!trimmedPart) return null;

        return (
          <p key={index} className="whitespace-pre-wrap text-slate-700 my-2">
            {part}
          </p>
        );
      }
    });
  };

  return (
    <div className="border-l-2 border-gray-100 pl-5 my-6 ml-2 hover:border-blue-500 transition-all duration-300">
      {/* Header: User Info & Language Tag */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm text-slate-600 font-bold border border-slate-300">
          {comment.user.full_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-900">
              {comment.user.username}
            </span>
            {comment.language && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded font-mono border border-slate-200">
                <HiCode />
                {comment.language}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Body: Mixed Text and Code Blocks */}
      <div className="text-sm leading-relaxed mb-4">
        {renderFormattedContent(comment.content, comment.language || "javascript")}
      </div>

      {/* Footer: Actions */}
      <div className="flex items-center gap-5">
        <button
          onClick={() => onUpvote(comment.id)}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            hasUpvoted ? "text-blue-600" : "text-slate-500 hover:text-blue-600"
          }`}
        >
          {hasUpvoted ? (
            <HiHandThumbUp size={16} />
          ) : (
            <HiOutlineHandThumbUp size={16} />
          )}
          <span>{comment.upvotes}</span>
        </button>

        <button
          onClick={() => onReply(comment.id)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-xs font-medium"
        >
          <HiOutlineChatBubbleLeft size={16} />
          <span>Reply</span>
        </button>
      </div>
    </div>
  );
};