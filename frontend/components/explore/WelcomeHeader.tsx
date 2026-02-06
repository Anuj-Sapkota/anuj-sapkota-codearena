interface WelcomeHeaderProps {
  user: string;
  rank: string;
  pointsToNextTier: number;
}

export const WelcomeHeader = ({ user, rank, pointsToNextTier }: WelcomeHeaderProps) => (
  <header className="mb-12">
    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">
      WELCOME_BACK, <span className="text-primary-1 italic">{user}</span>
    </h1>
    <p className="text-slate-500 font-medium">
      Your current rank is <span className="text-slate-900 font-bold">#{rank}</span>. 
      You are <span className="text-primary-1 font-bold">{pointsToNextTier} points</span> away from the next tier.
    </p>
  </header>
);