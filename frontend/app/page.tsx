"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HiOutlineRocketLaunch } from "react-icons/hi2";
import { HiOutlineTerminal } from "react-icons/hi";
import { FaCode, FaArrowRight } from "react-icons/fa6";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative flex items-center justify-between px-6 py-6 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="bg-indigo-600 p-1.5 rounded-lg flex items-center justify-center">
            <FaCode size={18} />
          </div>
          CodeArena
        </div>
        
        <Link href="/login">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#f8fafc" }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 rounded-full bg-white text-black font-semibold text-sm transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            Login
          </motion.button>
        </Link>
      </nav>

      {/* Hero Content */}
      <main className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-8 inline-block">
            Beta Access Now Live
          </span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 leading-[1.1]">
            Master the Craft <br /> of Modern Coding.
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed mx-auto">
            Battle through real-world problems, build stunning UI components, 
            and learn from the community. Your journey to senior engineer starts here.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link href="/register">
              <motion.button
                whileHover={{ y: -3, boxShadow: "0 20px 25px -5px rgb(79 70 229 / 0.4)" }}
                className="group flex items-center gap-3 px-10 py-4 bg-indigo-600 rounded-2xl font-bold text-white transition-all hover:bg-indigo-500"
              >
                Get Started for Free
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            
            <motion.button
              whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              className="px-10 py-4 rounded-2xl border border-white/10 font-bold text-white transition-colors"
            >
              View Challenges
            </motion.button>
          </div>
        </motion.div>

        {/* Feature Preview Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full"
        >
          {[
            { icon: <HiOutlineTerminal size={28} />, title: "Interactive Compiler", desc: "Run your code in our cloud-based playground with real-time feedback." },
            { icon: <HiOutlineRocketLaunch size={28} />, title: "Resource Library", desc: "Access high-quality assets, payment integrations, and UI components." },
            { icon: <FaCode size={24} />, title: "Code Reviews", desc: "Get feedback from experienced mentors on your logic and performance." }
          ].map((feature, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -5, borderColor: "rgba(99, 102, 241, 0.4)" }}
              className="p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] text-left transition-all"
            >
              <div className="text-indigo-500 mb-6 bg-indigo-500/10 w-fit p-3 rounded-2xl">
                {feature.icon}
              </div>
              <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
              <p className="text text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}