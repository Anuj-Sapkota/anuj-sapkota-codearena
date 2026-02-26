"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { HiCode } from "react-icons/hi";
import {
  HiHandThumbUp,
  HiOutlineHandThumbUp,
  HiOutlineChatBubbleLeft,
  HiOutlineTrash,
  HiOutlinePencil,
  HiEllipsisVertical,
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
          <div key={index} className="rounded-lg overflow-hidden my-4 border border-slate-200 ring-1 ring-black/5 shadow-sm">
            <SyntaxHighlighter 
              language={language} 
              style={vscDarkPlus} 
              customStyle={{ margin: 0, padding: "1.25rem", fontSize: "13px", lineHeight: "1.6", background: "#0f172a" }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      } else {
        const trimmedPart = part.trim();
        if (!trimmedPart) return null;
        return <p key={index} className="text-sm text-slate-700 leading-relaxed my-3">{part}</p>;
      }
    });
  };

  if (isEditing) {
    return (
      <div className="my-6 border border-emerald-100 rounded-xl p-1 bg-emerald-50/20">
        <DiscussionEditor initialContent={comment.content} initialLanguage={comment.language} buttonLabel="Update Post" isLoading={false} onCancel={() => setIsEditing(false)} onSubmit={handleUpdateSubmit} />
      </div>
    );
  }

  return (
    <div className="group relative bg-white border border-slate-200 rounded-xl p-5 mb-5 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="flex flex-col gap-4">
        
        {/* Header: High Contrast & Professional */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Profile Image with high-contrast ring */}
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-slate-100 border border-white flex-shrink-0 relative">
              {comment.user.profile_pic_url ? (
                <Image src={comment.user.profile_pic_url} alt={comment.user.username} fill sizes="32px" className="object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                   <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {comment.user.full_name?.charAt(0) || comment.user.username.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-slate-900 tracking-tight">
                  {comment.user.username}
                </span>
                {comment.language && (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full border border-emerald-100 font-bold uppercase tracking-wide">
                    {comment.language}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Action Menu: Prominent but Clean */}
          {isOwner && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`p-1.5 rounded-md transition-all ${
                  showMenu ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                }`}
              >
                <HiEllipsisVertical size={20} />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-30 py-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <button
                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                  >
                    <HiOutlinePencil size={15} /> Edit Discussion
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => { onDelete(comment.id); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-[12px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <HiOutlineTrash size={15} /> Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="text-slate-700">
          {renderFormattedContent(comment.content, comment.language || "javascript")}
        </div>

        {/* Footer: Clean Contrast Buttons */}
        <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
          <button
            onClick={() => onUpvote(comment.id)}
            className={`flex items-center gap-2 text-[12px] font-bold transition-all px-3 py-1.5 rounded-md ${
              comment.hasUpvoted 
                ? "bg-emerald-600 text-white shadow-sm" 
                : "text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200"
            }`}
          >
            {comment.hasUpvoted ? <HiHandThumbUp size={16} /> : <HiOutlineHandThumbUp size={16} />}
            <span>{comment.upvotes}</span>
          </button>

          <button
            onClick={() => onReply(comment.id)}
            className="flex items-center gap-2 text-[12px] font-bold text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-md border border-transparent hover:border-slate-200 transition-all"
          >
            <HiOutlineChatBubbleLeft size={16} />
            <span>Reply</span>
          </button>
        </div>
      </div>
    </div>
  );
};