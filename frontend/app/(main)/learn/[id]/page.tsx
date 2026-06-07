"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  FiArrowRight, FiCheck, FiCheckCircle, FiClock,
  FiLock, FiLoader, FiPlay, FiUsers, FiZap, FiBookOpen, FiArrowLeft,
} from "react-icons/fi";
import { FaTrophy } from "react-icons/fa";
import { resourceService } from "@/lib/services/resource.service";
import { paymentService } from "@/lib/services/payment.service";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import Modal from "@/components/ui/Modal";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

const PERKS = [
  "Lifetime Access",
  "Completion Certificate",
  "Downloadable Assets",
  "Community Access",
];

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ["resource", id],
    queryFn: () => resourceService.getResourceById(id),
  });

  const handlePayment = async () => {
    if (!isAuthenticated) {
      setAuthModal("login");
      return;
    }
    try {
      const data = await paymentService.initiateEsewa(id);
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
      const fields = [
        "amount", "tax_amount", "total_amount", "transaction_uuid",
        "product_code", "product_service_charge", "product_delivery_charge",
        "success_url", "failure_url", "signed_field_names", "signature",
      ];
      fields.forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(data[key]).trim();
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Payment Error:", error);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <FiLoader className="animate-spin text-primary-1" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Loading Course</p>
    </div>
  );

  if (isError || !course) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Course not found</p>
      <Link href={ROUTES.MAIN.LEARN} className="text-[10px] font-black text-primary-1 uppercase tracking-widest hover:underline">
        ← Back to courses
      </Link>
    </div>
  );

  const moduleCount = course.modules?.length ?? 0;
  const isFree = course.price === 0;

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-slate-100 pt-12 pb-0">
        {/* Grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60" />
        {/* Green glow */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[250px] bg-primary-1/8 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 pb-0">
          {/* Back */}
          <Link
            href={ROUTES.MAIN.LEARN}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-8"
          >
            <FiArrowLeft size={12} /> All Courses
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            {/* Left — course info */}
            <div className="lg:col-span-7 pb-12">
              {/* Badge row */}
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-primary-1/10 border border-primary-1/20 text-primary-1 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-primary-1 rounded-full animate-pulse" />
                  {course.type ?? "Course"}
                </div>
                {course.language && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-200 px-3 py-1.5 rounded-full">
                    {course.language}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
                {course.title}
              </h1>

              <p className="text-slate-500 text-base font-medium leading-relaxed mb-8 max-w-xl border-l-4 border-primary-1 pl-5">
                {course.description}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                  <FiBookOpen size={13} className="text-primary-1" />
                  {moduleCount} {moduleCount === 1 ? "lesson" : "lessons"}
                </div>
                {course.creator?.name && (
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                    <FiUsers size={13} className="text-primary-1" />
                    By {course.creator.name}
                  </div>
                )}
                {course.badge && (
                  <div className="flex items-center gap-2 text-[11px] font-bold text-amber-600">
                    <FaTrophy size={11} />
                    Earn a badge on completion
                  </div>
                )}
              </div>
            </div>

            {/* Right — thumbnail */}
            {course.thumbnail && (
              <div className="lg:col-span-5 hidden lg:block self-end">
                <div className="rounded-t-sm overflow-hidden border-x border-t border-slate-200 shadow-2xl shadow-black/10">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full aspect-video object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* ── Curriculum ── */}
          <div className="lg:col-span-7 space-y-10">

            {/* What you'll learn */}
            <div>
              <p className="text-[10px] font-black text-primary-1 uppercase tracking-[0.3em] mb-3">What you'll learn</p>
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">Course Curriculum</h2>

              <div className="space-y-2">
                {course.modules?.map((mod: any, index: number) => (
                  <div
                    key={mod.id ?? index}
                    className="group flex items-center justify-between px-5 py-4 bg-white border-2 border-slate-100 rounded-sm hover:border-primary-1/30 hover:shadow-[0_4px_20px_rgba(19,139,81,0.06)] transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-[11px] font-black text-slate-300 group-hover:text-primary-1 transition-colors tabular-nums shrink-0">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-black uppercase tracking-tight text-slate-900 truncate">
                          {mod.title}
                        </p>
                        {mod.type && (
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                            {mod.type}
                          </p>
                        )}
                      </div>
                    </div>
                    <FiLock className="text-slate-300 shrink-0 ml-4" size={14} />
                  </div>
                ))}

                {moduleCount === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-sm py-12 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Curriculum coming soon</p>
                  </div>
                )}
              </div>
            </div>

            {/* How it works strip */}
            <div className="bg-slate-900 rounded-sm p-8">
              <p className="text-[10px] font-black text-primary-1 uppercase tracking-[0.3em] mb-6">Simple process</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { step: "01", title: "Enroll", desc: "Get instant access after payment." },
                  { step: "02", title: "Learn", desc: "Watch lessons at your own pace." },
                  { step: "03", title: "Earn", desc: "Complete all modules to earn your badge." },
                ].map((s, i, arr) => (
                  <div key={s.step} className="relative">
                    {i < arr.length - 1 && (
                      <div className="hidden sm:block absolute top-3 left-full w-full h-px bg-slate-700 z-0" />
                    )}
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-primary-1 uppercase tracking-[0.3em] mb-2">{s.step}</p>
                      <p className="text-sm font-black text-white uppercase tracking-tight mb-1">{s.title}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sticky purchase card ── */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">

              {/* Price card */}
              <div className="bg-white border-2 border-slate-100 rounded-sm p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                {/* Price */}
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Access License</p>
                    <h3 className="text-5xl font-black tracking-tighter">
                      {isFree ? "FREE" : `NPR ${course.price?.toLocaleString()}`}
                    </h3>
                  </div>
                  {isFree ? (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-3 py-1.5 rounded-sm flex items-center gap-1.5">
                      <FiCheck size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Free</span>
                    </div>
                  ) : (
                    <div className="bg-primary-1/10 border border-primary-1/20 text-primary-1 px-3 py-1.5 rounded-sm flex items-center gap-1.5">
                      <FiZap size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Instant</span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={handlePayment}
                  className="group w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-primary-1 transition-all shadow-lg active:scale-95 mb-6"
                >
                  {isFree ? "Enroll for Free" : "Unlock Course"}
                  <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Perks */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {PERKS.map((perk) => (
                    <div key={perk} className="flex items-center gap-3 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                      <FiCheckCircle size={13} className="text-primary-1 shrink-0" />
                      {perk}
                    </div>
                  ))}
                </div>
              </div>

              {/* Badge card — only if course has a badge */}
              {course.badge && (
                <div className="bg-amber-50 border-2 border-amber-100 rounded-sm p-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-sm flex items-center justify-center shrink-0">
                    <FaTrophy size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-0.5">Badge Reward</p>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{course.badge.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Complete all lessons to earn this badge</p>
                  </div>
                </div>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border-2 border-slate-100 rounded-sm p-4 text-center">
                  <p className="text-2xl font-black text-slate-900">{moduleCount}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Lessons</p>
                </div>
                <div className="bg-white border-2 border-slate-100 rounded-sm p-4 text-center">
                  <p className="text-2xl font-black text-slate-900">{course.views ?? 0}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Views</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="py-20 px-6 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[150px] bg-primary-1/15 rounded-full blur-3xl" />
        <div className="max-w-3xl mx-auto text-center relative">
          <p className="text-[10px] font-black text-primary-1 uppercase tracking-[0.3em] mb-4">Ready to start?</p>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
            Start learning today.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-md mx-auto">
            Join the CodeArena community and level up your skills with structured courses from verified creators.
          </p>
          <button
            onClick={handlePayment}
            className="inline-flex items-center gap-2 bg-primary-1 text-white px-10 py-4 text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-primary-2 transition-all shadow-lg shadow-primary-1/20 active:scale-95"
          >
            {isFree ? "Enroll for Free" : `Get Access — NPR ${course.price?.toLocaleString()}`}
            <FiArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Auth modals — shown when guest clicks enroll */}
      <Modal isOpen={authModal === "login"} onClose={() => setAuthModal(null)}>
        <LoginForm onSuccess={() => setAuthModal(null)} onSwitch={() => setAuthModal("register")} />
      </Modal>
      <Modal isOpen={authModal === "register"} onClose={() => setAuthModal(null)}>
        <RegisterForm onSuccess={() => setAuthModal(null)} onSwitch={() => setAuthModal("login")} />
      </Modal>

    </div>
  );
}
