"use client";

import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import { ROUTES } from "@/constants/routes";
import Logo from "@/public/logo.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#09090b] border-t border-zinc-800 text-zinc-400">
      <div className="max-w-7xl mx-auto px-8">
        
        {/* TOP SECTION: HIGH CONTRAST NAV */}
        <div className="flex flex-col md:flex-row justify-between items-center py-12 gap-8">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <Link href={ROUTES.HOME} className="hover:opacity-100 transition-opacity">
              <Image
                src={Logo}
                alt="logo"
                className="w-24 object-contain brightness-110"
              />
            </Link>
            
            <nav>
              <ul className="flex flex-wrap justify-center gap-8">
                <FooterLink href="/problems">Problems</FooterLink>
                <FooterLink href="/contests">Learn</FooterLink>
                <FooterLink href="/discuss">Discuss</FooterLink>
                <FooterLink href="/about">About</FooterLink>
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <SocialButton icon={<FaGithub />} href="#" />
            <SocialButton icon={<FaTwitter />} href="#" />
            <SocialButton icon={<FaLinkedinIn />} href="#" />
          </div>
        </div>

        {/* BOTTOM SECTION: CLEAN BORDER & TYPOGRAPHY */}
        <div className="border-t border-zinc-800/50 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-[10px] font-black text-white uppercase tracking-[0.25em]">
              © {currentYear} CodeArena Inc.
            </p>
            <span className="hidden md:block w-px h-3 bg-zinc-700" />
          </div>

          <div className="flex gap-8">
            <LegalLink href="/terms">Terms</LegalLink>
            <LegalLink href="/privacy">Privacy</LegalLink>
            <LegalLink href="/security">Security</LegalLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- PREMIUM SUB-COMPONENTS ---

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="text-[11px] font-black text-zinc-400 hover:text-white uppercase tracking-[0.2em] transition-all duration-300"
    >
      {children}
    </Link>
  );
}

function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="text-[9px] font-bold text-zinc-600 hover:text-zinc-200 uppercase tracking-[0.2em] transition-colors"
    >
      {children}
    </Link>
  );
}

function SocialButton({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a 
      href={href} 
      className="w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 transition-all rounded-sm"
    >
      <span className="text-lg">{icon}</span>
    </a>
  );
}