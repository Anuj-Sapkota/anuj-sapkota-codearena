"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { 
  HiHandThumbUp, 
  HiOutlineHandThumbUp, 
  HiOutlineChatBubbleLeft, 
  HiOutlineTrash, 
  HiOutlinePencil, 
  HiEllipsisVertical 
} from "react-icons/hi2";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { DiscussionEditor } from "./DiscussionEditor";

interface CommentProps {
  comment: any;
  currentUserId?: number;
  onUpvote: (id: string) => void;
  onReply: (parentId: string, content: string, lang: string | null) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: string, lang: string | null) => void;
  depth?: number;
}

export const CommentItem = ({
  comment,
  onUpvote,
  onReply,
  onDelete,
  onUpdate,
  currentUserId,
  depth = 0,
}: CommentProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
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

  const renderFormattedContent = (content: string, selectedLang: string | null) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const code = part.slice(3, -3).trim();
        const displayLang = selectedLang || "text";

        return (
          <div key={index} className="rounded-xl overflow-hidden my-4 border-2 border-slate-100 shadow-sm">
            <div className="bg-[#0f172a] px-4 py-2 border-b border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                {selectedLang ? selectedLang : "NO_LANGUAGE_SPECIFIED"}
              </span>
            </div>
            <SyntaxHighlighter
              language={displayLang}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: "1.5rem",
                fontSize: "13px",
                lineHeight: "1.6",
                background: "#0f172a",
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }
      
      const trimmedText = part.trim();
      if (!trimmedText) return null;
      return <p key={index} className="text-sm text-slate-700 leading-relaxed my-3">{part}</p>;
    });
  };

  if (isEditing) {
    return (
      <div className="my-6 border-2 border-emerald-100 rounded-2xl p-1 bg-emerald-50/10">
        <DiscussionEditor
          initialContent={comment.content}
          initialLanguage={comment.language}
          buttonLabel="UPDATE_POST"
          isLoading={false}CPP
          onCancel={() => setIsEditing(false)}
          onSubmit={(c, l) => {
            onUpdate(comment.id, c, l);
            setIsEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col w-full ${depth > 0 ? "mt-4" : "mb-5"}`}>
      <div className="group relative bg-white border-2 border-slate-100 rounded-2xl p-5 hover:border-slate-200 transition-all duration-300">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-slate-50 border-2 border-white flex-shrink-0 relative">
                {comment.user.profile_pic_url ? (
                  <Image src={comment.user.profile_pic_url} alt="avatar" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                    {comment.user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-black text-slate-900 tracking-tight">{comment.user.username}</span>
                  
                  {/* Language Badge displayed on the right of the name */}
                  {comment.language && (
                    <span className="bg-emerald-50 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full border border-emerald-100 font-black uppercase tracking-wider">
                      {comment.language}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {isOwner && (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                  <HiEllipsisVertical size={20} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-slate-100 rounded-xl shadow-xl z-30 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button onClick={() => setIsEditing(true)} className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50">
                      <HiOutlinePencil /> Edit_Post
                    </button>
                    <button onClick={() => onDelete(comment.id)} className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50">
                      <HiOutlineTrash /> Delete_Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="text-slate-700">
            {renderFormattedContent(comment.content, comment.language)}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 pt-4 border-t-2 border-slate-50">
            <button
              onClick={() => onUpvote(comment.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                comment.hasUpvoted ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
              }`}
            >
              {comment.hasUpvoted ? <HiHandThumbUp size={14} /> : <HiOutlineHandThumbUp size={14} />}
              {comment.upvotes}
            </button>

            <button
              onClick={() => setIsReplying(!isReplying)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isReplying ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
              }`}
            >
              <HiOutlineChatBubbleLeft size={14} />
              {isReplying ? "Cancel" : "Reply"}
            </button>
          </div>
        </div>
      </div>

      {isReplying && (
        <div className="mt-4 ml-10 animate-in slide-in-from-top-2 duration-300">
          <DiscussionEditor
            onSubmit={(content, lang) => {
              onReply(comment.id, content, lang);
              setIsReplying(false);
            }}
            onCancel={() => setIsReplying(false)}
            isLoading={false}
            buttonLabel="POST_REPLY"
          />
        </div>
      )}

      {comment.replies?.map((reply: any) => (
        <div key={reply.id} className="ml-10 border-l-2 border-slate-100 pl-6">
          <CommentItem
            comment={reply}
            currentUserId={currentUserId}
            onUpvote={onUpvote}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onReply={onReply}
            depth={depth + 1}
          />
        </div>
      ))}
    </div>
  );
};