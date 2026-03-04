"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdChatBubbleOutline, MdAdd, MdHistory, MdFilterList } from "react-icons/md";
import { AppDispatch, RootState } from "@/lib/store/store.js";
import {
  fetchDiscussionsThunk,
  createDiscussionThunk,
  toggleUpvoteThunk,
  deleteDiscussionThunk,
  updateDiscussionThunk,
} from "@/lib/store/features/discussion/discussion.actions";
import { CommentItem } from "./CommentItem";
import { DiscussionEditor } from "./DiscussionEditor";

const DiscussContainer = ({ problemId }: { problemId: number }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  // Filtering States
  const [sortBy, setSortBy] = useState<"newest" | "most_upvoted">("newest");
  const [selectedLang, setSelectedLang] = useState<string>("all");

  // Redux State
  const { items, isLoading } = useSelector(
    (state: RootState) => state.discussion,
  );
  const currentUser = useSelector(
    (state: RootState) => (state as any).auth?.user,
  );

  // Check if Admin for Management features
  const isAdmin = currentUser?.role === "ADMIN";

  // Trigger fetch on any filter change
  useEffect(() => {
    dispatch(
      fetchDiscussionsThunk({
        problemId,
        userId: currentUser?.userId,
        sortBy,
        language: selectedLang === "all" ? undefined : selectedLang,
      }),
    );
  }, [dispatch, problemId, currentUser?.userId, sortBy, selectedLang]);

  const handlePostSubmit = async (content: string, language: string | null) => {
    const result = await dispatch(
      createDiscussionThunk({
        content,
        problemId,
        language,
        parentId: null,
      }),
    );
    if (createDiscussionThunk.fulfilled.match(result)) {
      setIsEditorOpen(false);
    }
  };

  const handleReplySubmit = async (
    parentId: string,
    content: string,
    language: string | null,
  ) => {
    await dispatch(
      createDiscussionThunk({
        content,
        problemId,
        language,
        parentId, 
      }),
    );
  };

  const handleUpvote = (id: string) => dispatch(toggleUpvoteThunk(id));

  const handleDelete = (id: string) => {
    if (window.confirm("DELETE_PERMANENTLY? This action cannot be undone.")) {
      dispatch(deleteDiscussionThunk(id));
    }
  };

  const handleUpdate = (
    id: string,
    content: string,
    language: string | null,
  ) => {
    dispatch(updateDiscussionThunk({ id, data: { content, language } }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-8 mb-10">
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col gap-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <MdChatBubbleOutline className="text-base" /> Community_Debrief (
              {items.length})
              {isAdmin && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[8px]">ADMIN_MODE</span>}
            </h3>
            
            {/* FILTER TOOLBAR */}
            <div className="flex items-center gap-3">
              {/* Sort Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setSortBy("newest")}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    sortBy === "newest" 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => setSortBy("most_upvoted")}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    sortBy === "most_upvoted" 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Popular
                </button>
              </div>

              {/* Language Dropdown */}
              <div className="relative flex items-center">
                <select 
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="appearance-none bg-slate-100 border border-slate-200 text-[9px] font-black uppercase tracking-widest rounded-xl pl-8 pr-4 py-2.5 outline-none cursor-pointer hover:bg-slate-200 transition-colors text-slate-700"
                >
                  <option value="all">All_Langs</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript</option>
                </select>
                <MdFilterList className="absolute left-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {!isEditorOpen && (
            <button
              onClick={() => setIsEditorOpen(true)}
              className="group relative bg-slate-800 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3 overflow-hidden cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2">
                New_Post{" "}
                <MdAdd className="text-sm group-hover:rotate-90 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          )}
        </div>

        {isEditorOpen && (
          <div className="animate-in slide-in-from-top-4 duration-300">
            <DiscussionEditor
              onSubmit={handlePostSubmit}
              onCancel={() => setIsEditorOpen(false)}
              isLoading={isLoading}
              buttonLabel="PUBLISH_POST"
            />
          </div>
        )}
      </div>

      {/* FEED SECTION */}
      <div className="space-y-6">
        {isLoading && items.length === 0 ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-slate-50 border-2 border-slate-100 rounded-2xl" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="flex flex-col gap-4">
            {items.map((comment: any) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUser?.userId}
                isAdmin={isAdmin}
                onUpvote={handleUpvote}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onReply={handleReplySubmit}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem] transition-colors hover:border-emerald-200">
            <MdHistory className="text-6xl mb-4 text-slate-200" />
            <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Zero_Discussions_Found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussContainer;