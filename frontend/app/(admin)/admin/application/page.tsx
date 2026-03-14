"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPendingApplicationsThunk,
  reviewApplicationThunk,
} from "@/lib/store/features/creator/creator.actions";
import { RootState, AppDispatch } from "@/lib/store/store";

const AdminApplicationTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Pulling state from our new creator slice
  const { pendingApplications, isAdminLoading, isReviewing, error } =
    useSelector((state: RootState) => state.creator);

  useEffect(() => {
    dispatch(fetchPendingApplicationsThunk());
  }, [dispatch]);

  const handleReview = (userId: number, status: "APPROVED" | "REJECTED") => {
    const confirmMessage = `Are you sure you want to ${status.toLowerCase()} this applicant?`;
    if (window.confirm(confirmMessage)) {
      dispatch(reviewApplicationThunk({ targetUserId: userId, status }));
    }
  };

  if (isAdminLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">
          Pending Creator Applications
        </h2>
        <p className="text-sm text-gray-500">
          Review users who want to contribute resources
        </p>
      </div>

      {error && (
        <div className="m-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">Portfolio & Bio</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pendingApplications.length > 0 ? (
              pendingApplications.map((app) => (
                <tr
                  key={app.userId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {app.full_name}
                    </div>
                    <div className="text-sm text-gray-500">@{app.username}</div>
                    <div className="text-xs text-blue-500">{app.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={app.creatorProfile?.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-sm block mb-1"
                    >
                      View Portfolio Link
                    </a>
                    <p className="text-gray-600 text-sm italic line-clamp-2">
                      "{app.creatorProfile?.bio || "No bio provided"}"
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button
                        disabled={isReviewing}
                        onClick={() => handleReview(app.userId, "APPROVED")}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        disabled={isReviewing}
                        onClick={() => handleReview(app.userId, "REJECTED")}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-lg font-medium">
                    No pending applications!
                  </p>
                  <p className="text-sm">You've cleared the entire queue.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isReviewing && (
        <div className="bg-blue-50 px-6 py-2 text-center text-blue-700 text-xs animate-pulse">
          Processing decision... please wait.
        </div>
      )}
    </div>
  );
};

export default AdminApplicationTable;
