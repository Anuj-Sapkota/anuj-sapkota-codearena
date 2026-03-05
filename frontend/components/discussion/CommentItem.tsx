"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { 
  HiHandThumbUp, 
  HiOutlineHandThumbUp, 
  HiOutlineChatBubbleLeft, 
  HiOutlineTrash, 
  HiOutlinePencil, 
  HiEllipsisVertical,
  HiChevronDown,
  HiChevronUp,
  HiShieldCheck // Icon for Admin
} from "react-icons/hi2";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { DiscussionEditor } from "./DiscussionEditor";

interface CommentProps {
  comment: any;
  currentUserId?: number;
  isAdmin?: boolean; // New Prop
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
  isAdmin = false, // Default to false
  depth = 0,
}: CommentProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwner = currentUserId === comment.userId;
  const hasReplies = comment.replies && comment.replies.length > 0;

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
                {selectedLang ? selectedLang : "CODE_SNIPPET"}
              </span>
            </div>
            <SyntaxHighlighter
              language={displayLang}
              style={vscDarkPlus}
              customStyle={{ margin: 0, padding: "1.5rem", fontSize: "13px", lineHeight: "1.6", background: "#0f172a" }}
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

  return (
    <div className={`flex flex-col w-full ${depth > 0 ? "mt-4" : "mb-5"}`}>
      <div className={`group relative bg-white border-2 rounded-2xl p-5 transition-all duration-300 ${
        comment.user.role === "ADMIN" ? "border-amber-100 bg-amber-50/10" : "border-slate-100 hover:border-slate-200"
      }`}>
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full overflow-hidden ring-2 border-2 border-white shrink-0 relative ${
                comment.user.role === "ADMIN" ? "ring-amber-400" : "ring-slate-50"
              }`}>
                {comment.user.profile_pic_url ? (
                  <Image src={comment.user.profile_pic_url} alt="avatar" fill className="object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center font-black text-xs ${
                    comment.user.role === "ADMIN" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"
                  }`}>
                    {comment.user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-black text-slate-900 tracking-tight flex items-center gap-1">
                    {comment.user.username}
                    {comment.user.role === "ADMIN" && (
                      <HiShieldCheck className="text-amber-500 text-sm" title="Verified Admin" />
                    )}
                  </span>
                  {comment.language && (
                    <span className="bg-slate-800 text-white text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest">
                      {comment.language}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Action Menu (Show for Owner OR Admin) */}
            {(isOwner || isAdmin) && (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors cursor-pointer">
                  <HiEllipsisVertical size={20} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-slate-100 rounded-xl shadow-xl z-30 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Only Owner can Edit */}
                    {isOwner && (
                      <button onClick={() => setIsEditing(true)} className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50">
                        <HiOutlinePencil /> Edit_Post
                      </button>
                    )}
                    {/* Both Admin and Owner can Delete */}
                    <button onClick={() => onDelete(comment.id)} className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50">
                      <HiOutlineTrash /> {isAdmin && !isOwner ? "Moderate_Delete" : "Delete_Post"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="text-slate-700">
            {isEditing ? (
               <DiscussionEditor
               initialContent={comment.content}
               initialLanguage={comment.language}
               buttonLabel="UPDATE_POST"
               isLoading={false}
               onCancel={() => setIsEditing(false)}
               onSubmit={(c, l) => {
                 onUpdate(comment.id, c, l);
                 setIsEditing(false);
               }}
             />
            ) : renderFormattedContent(comment.content, comment.language)}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 pt-4 border-t-2 border-slate-50">
            <button
              onClick={() => onUpvote(comment.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 bg-slate-50 hover:bg-slate-100 active:scale-95 ${
                comment.hasUpvoted ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              {comment.hasUpvoted ? (
                <HiHandThumbUp size={14} className="text-emerald-500 animate-in zoom-in duration-300 cursor-pointer" />
              ) : (
                <HiOutlineHandThumbUp size={14} />
              )}
              {comment.upvotes}
            </button>

            <button
              onClick={() => setIsReplying(!isReplying)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                isReplying ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
              }`}
            >
              <HiOutlineChatBubbleLeft size={14} />
              {isReplying ? "Cancel" : "Reply"}
            </button>
          </div>
        </div>
      </div>

      {/* Reply logic remains the same... */}
      {isReplying && (
        <div className="mt-4 ml-10 animate-in slide-in-from-top-2 duration-300">
          <DiscussionEditor
            onSubmit={(content, lang) => {
              onReply(comment.id, content, lang);
              setIsReplying(false);
              setShowReplies(true); 
            }}
            onCancel={() => setIsReplying(false)}
            isLoading={false}
            buttonLabel="POST_REPLY"
          />
        </div>
      )}

      {hasReplies && (
        <div className="mt-2 ml-10">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-2 px-2 py-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 rounded-lg transition-colors"
          >
            {showReplies ? <HiChevronUp size={16} /> : <HiChevronDown size={16} />}
            {showReplies ? "Hide_Replies" : `View_Replies (${comment.replies.length})`}
          </button>
        </div>
      )}

      {hasReplies && showReplies && (
        <div className="mt-2 ml-10 border-l-2 border-slate-100 pl-6 animate-in fade-in slide-in-from-left-2 duration-300">
          {comment.replies.map((reply: any) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              isAdmin={isAdmin} // Pass isAdmin down to replies
              onUpvote={onUpvote}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};