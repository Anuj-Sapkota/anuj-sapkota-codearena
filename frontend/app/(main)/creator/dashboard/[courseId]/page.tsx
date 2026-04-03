"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  FiArrowLeft, FiEdit3, FiEye, FiUsers, FiDollarSign,
  FiAward, FiLoader, FiVideo, FiBook, FiChevronDown,
  FiCheckCircle, FiFileText,
} from "react-icons/fi";
import { MdOutlineOndemandVideo } from "react-icons/md";

function groupSections(modules: any[]) {
  const map = new Map<string, any[]>();
  for (const m of modules) {
    const key = m.sectionTitle || "Course Content";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return Array.from(map.entries()).map(([title, lessons]) => ({ title, lessons }));
}

export default function CourseDashboardPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get(`/resources/${courseId}/dashboard`)
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <FiLoader className="animate-spin text-slate-300" size={32} />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Course not found.</p>
    </div>
  );

  const sections = groupSections(data.modules || []);
  const toggleSection = (t: string) => setCollapsed(p => { const n = new Set(p); n.has(t) ? n.delete(t) : n.add(t); return n; });

  const statCards = [
    { icon: <FiEye size={16} />, label: "Total Views", value: data.stats.views.toLocaleString(), color: "text-blue-600 bg-blue-50" },
    { icon: <FiUsers size={16} />, label: "Students Enrolled", value: data.stats.students.toLocaleString(), color: "text-violet-600 bg-violet-50" },
    { icon: <FiDollarSign size={16} />, label: "Your Earnings", value: `NPR ${data.stats.creatorEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "text-emerald-600 bg-emerald-50" },
    { icon: <FiAward size={16} />, label: "Assignment Passed", value: data.stats.passedAssignment.toLocaleString(), color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto py-10 px-6">
        {/* Back + actions */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/creator/dashboard" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 hover:text-slate-900 transition-all">
            <FiArrowLeft size={13} /> Back to Studio
          </Link>
          <Link href={`/creator/dashboard/edit/${courseId}`}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-slate-800 transition-all shadow-sm"
          >
            <FiEdit3 size={13} /> Edit Course
          </Link>
        </div>

        {/* Hero */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row gap-0">
            {data.previewUrl && (
              <div className="md:w-72 shrink-0">
                <img src={data.previewUrl} alt={data.title} className="w-full h-48 md:h-full object-cover" />
              </div>
            )}
            <div className="p-7 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider ${data.isApproved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    {data.isApproved ? "Live" : "Under Review"}
                  </span>
                </div>
                <span className="text-lg font-black text-emerald-600 shrink-0">NPR {data.price?.toLocaleString()}</span>
              </div>
              <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 mb-2">{data.title}</h1>
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{data.description}</p>
              <div className="flex items-center gap-5 mt-5 pt-5 border-t border-slate-100">
                {[
                  { icon: <MdOutlineOndemandVideo size={13} />, label: `${data.modules?.length || 0} Lessons` },
                  { icon: <FiBook size={12} />, label: `${sections.length} Sections` },
                  { icon: <FiAward size={12} />, label: data.badge ? data.badge.name : "No Badge" },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-500">
                    {m.icon}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
              <p className="text-xl font-black text-slate-900 tracking-tighter">{s.value}</p>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Curriculum */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Curriculum</h2>
              <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">{sections.length} sections</span>
            </div>
            <div>
              {sections.map((section, si) => {
                const isCollapsed = collapsed.has(section.title);
                return (
                  <div key={si} className="border-b border-slate-50 last:border-0">
                    <button onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-slate-900 text-white rounded-md flex items-center justify-center text-[9px] font-black shrink-0">{si + 1}</div>
                        <p className="text-[11px] font-black uppercase italic tracking-tight text-slate-800">{section.title}</p>
                        <span className="text-[9px] font-bold text-slate-400">{section.lessons.length} lessons</span>
                      </div>
                      <FiChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} />
                    </button>
                    {!isCollapsed && (
                      <div className="bg-slate-50/50">
                        {section.lessons.map((lesson: any, li: number) => (
                          <div key={lesson.id} className="flex items-center gap-3 px-6 py-3 border-b border-slate-50 last:border-0">
                            <div className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center shrink-0">
                              {lesson.fileType === "code"
                                ? <FiFileText size={11} className="text-slate-500" />
                                : <MdOutlineOndemandVideo size={12} className="text-slate-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-slate-700 truncate">{lesson.title}</p>
                              {lesson.description && <p className="text-[9px] text-slate-400 truncate mt-0.5">{lesson.description}</p>}
                            </div>
                            <span className="text-[9px] font-bold text-slate-300 uppercase shrink-0">
                              {lesson.fileType === "code" ? lesson.fileName || "Code" : "Video"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Students */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Students</h2>
              <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">{data.purchases?.length || 0}</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
              {data.purchases?.length > 0 ? data.purchases.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0">
                    {p.user.profile_pic_url
                      ? <img src={p.user.profile_pic_url} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-500">{p.user.full_name[0]}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-700 truncate">{p.user.full_name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">@{p.user.username}</p>
                  </div>
                  <span className="text-[9px] font-black text-emerald-600 shrink-0">NPR {p.amount}</span>
                </div>
              )) : (
                <div className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No students yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
