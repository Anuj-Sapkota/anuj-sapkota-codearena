"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image"; // Added Next.js Image
import { HiCode } from "react-icons/hi";
import {
  HiHandThumbUp,
  HiOutlineHandThumbUp,
  HiOutlineChatBubbleLeft,
  HiOutlineTrash,
  HiOutlinePencil,
  HiEllipsisVertical, // Using the filled version for more prominence
} from "react-icons/hi2";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { DiscussionEditor } from "./DiscussionEditor";

interface CommentProps {
  comment: any;
  currentUserId?: number;
  onUpvote: (id: string) => void;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: string, lang: string | null) => void;
}

export const CommentItem = ({
  comment,
  onUpvote,
  onReply,
  onDelete,
  onUpdate,
  currentUserId,
}: CommentProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = currentUserId === comment.userId;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleUpdateSubmit = (newContent: string, newLang: string | null) => {
    onUpdate(comment.id, newContent, newLang);
    setIsEditing(false);
    setShowMenu(false);
  };

  // Content rendering logic remains the same...
  const renderFormattedContent = (content: string, defaultLang: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const rawContent = part.slice(3, -3).trim();
        const lines = rawContent.split("\n");
        let language = defaultLang || "javascript";
        let code = rawContent;
        if (lines.length > 1) {
          const potentialLang = lines[0].trim();
          if (potentialLang.length > 0 && !potentialLang.includes(" ")) {
            language = potentialLang;
            code = lines.slice(1).join("\n");
          }
        }
        return (
          <div key={index} className="rounded-md overflow-hidden my-3 border border-slate-200">
            <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={{ margin: 0, padding: "1rem", fontSize: "13px", lineHeight: "1.5", background: "#1e1e1e" }}>
              {code}
            </SyntaxHighlighter>
          </div>
        );
      } else {
        const trimmedPart = part.trim();
        if (!trimmedPart) return null;
        return <p key={index} className="text-[14px] text-slate-700 leading-relaxed my-2">{part}</p>;
      }
    });
  };

  if (isEditing) {
    return (
      <div className="my-4 ml-4">
        <DiscussionEditor initialContent={comment.content} initialLanguage={comment.language} buttonLabel="Save Changes" isLoading={false} onCancel={() => setIsEditing(false)} onSubmit={handleUpdateSubmit} />
      </div>
    );
  }

  return (
    <div className="group relative bg-white border-b border-slate-100 py-5 px-3 hover:bg-slate-50/40 transition-colors">
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-100 group-hover:bg-[#2db55d]/30 transition-colors ml-[-4px]" />

      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100 flex items-center justify-center relative">
              {comment.user.profile_pic_url ? (
                <Image src={comment.user.profile_pic_url} alt={comment.user.username} fill sizes="28px" className="object-cover" />
              ) : (
                <span className="text-[11px] text-[#2db55d] font-bold uppercase select-none">
                  {comment.user.full_name?.charAt(0) || comment.user.username.charAt(0)}
                </span>
              )}
            </div>
            <span className="font-semibold text-[13px] text-slate-900 hover:text-[#2db55d] cursor-pointer transition-colors">
              {comment.user.username}
            </span>
            {comment.language && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-[#2db55d] text-[10px] rounded border border-green-100 font-mono">
                <HiCode size={10} /> {comment.language}
              </span>
            )}
            <span className="text-[12px] text-slate-400">• {new Date(comment.createdAt).toLocaleDateString()}</span>
          </div>

          {/* --- ENHANCED ACTION MENU --- */}
          {isOwner && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Action Menu"
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  showMenu 
                    ? "bg-slate-200 text-slate-900 shadow-inner" 
                    : "text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                }`}
              >
                <HiEllipsisVertical size={22} strokeWidth={2} />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Settings</div>
                  <button
                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-slate-700 hover:bg-slate-50 hover:text-[#2db55d] transition-colors"
                  >
                    <HiOutlinePencil size={16} className="text-slate-400" /> 
                    <span>Edit Post</span>
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => { onDelete(comment.id); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <HiOutlineTrash size={16} /> 
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pl-0 mt-1 mb-2">
          {renderFormattedContent(comment.content, comment.language || "javascript")}
        </div>

        <div className="flex items-center gap-5">
          <button
            onClick={() => onUpvote(comment.id)}
            className={`flex items-center gap-1.5 text-[12px] font-medium transition-all transform active:scale-95 ${
              comment.hasUpvoted ? "text-[#2db55d]" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            {comment.hasUpvoted ? <HiHandThumbUp size={17} className="animate-in fade-in zoom-in duration-200" /> : <HiOutlineHandThumbUp size={17} />}
            <span className={comment.hasUpvoted ? "font-bold" : ""}>{comment.upvotes}</span>
          </button>

          <button onClick={() => onReply(comment.id)} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-900 transition-colors text-[12px] font-medium">
            <HiOutlineChatBubbleLeft size={17} /> <span>Reply</span>
          </button>
        </div>
      </div>
    </div>
  );
};