"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HiOutlinePencilSquare, HiBars3BottomLeft } from "react-icons/hi2";
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

  // Redux State
  const { items, isLoading } = useSelector((state: RootState) => state.discussion);
  const currentUser = useSelector((state: RootState) => (state as any).auth?.user); // Adjust path to your auth state

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

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this discussion permanently?")) {
      dispatch(deleteDiscussionThunk(id));
    }
  };

  const handleUpdate = (id: string, content: string, language: string | null) => {
    dispatch(updateDiscussionThunk({ id, data: { content, language } }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white min-h-screen">
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

      {isEditorOpen && (
        <div className="mb-8">
          <DiscussionEditor
            onSubmit={handlePostSubmit}
            onCancel={() => setIsEditorOpen(false)}
            isLoading={isLoading}
          />
        </div>
      )}

      <div className="space-y-2">
        {isLoading && items.length === 0 ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 w-full bg-slate-50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : items.length > 0 ? (
          items.map((comment: any) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUser?.userId}
              onUpvote={handleUpvote}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onReply={(id) => console.log("Reply to", id)}
            />
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 text-sm">No discussions yet. Be the first to post!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussContainer;