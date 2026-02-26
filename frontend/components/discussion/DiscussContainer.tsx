"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HiOutlinePencilSquare, HiBars3BottomLeft } from "react-icons/hi2";
import { AppDispatch, RootState } from "@/lib/store/store.js"; // Adjust paths to your store setup
import {
  fetchDiscussionsThunk,
  createDiscussionThunk,
  toggleUpvoteThunk,
} from "@/lib/store/features/discussion/discussion.actions";
import { CommentItem } from "./CommentItem";
import { DiscussionEditor } from "./DiscussionEditor";

const DiscussContainer = ({ problemId }: { problemId: number }) => {
  console.log("Problem id from the discuss container: ", problemId);
  const dispatch = useDispatch<AppDispatch>();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Use the Redux State
  const { items, isLoading } = useSelector(
    (state: RootState) => state.discussion,
  );

  useEffect(() => {
    dispatch(fetchDiscussionsThunk(problemId));
  }, [dispatch, problemId]);

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

  const handleUpvote = (id: string) => {
    dispatch(toggleUpvoteThunk(id));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white min-h-screen">
      {/* 1. Header Section */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <HiBars3BottomLeft className="text-blue-600" />
            Discussions
          </h2>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
            {items.length} posts
          </span>
        </div>

        {!isEditorOpen && (
          <button
            onClick={() => setIsEditorOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all"
          >
            <HiOutlinePencilSquare size={18} />
            New Post
          </button>
        )}
      </div>

      {/* 2. Real Editor Component */}
      {isEditorOpen && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <DiscussionEditor
            onSubmit={handlePostSubmit}
            onCancel={() => setIsEditorOpen(false)}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* 3. Discussion List */}
      <div className="space-y-2">
        {isLoading && items.length === 0 ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 w-full bg-slate-50 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          items.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onUpvote={handleUpvote}
              onReply={(id) => console.log("Open reply editor for", id)}
            />
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 text-sm">
              No discussions yet. Be the first to post!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussContainer;
