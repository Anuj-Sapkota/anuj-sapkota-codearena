import { ChevronRight } from "lucide-react";

interface ProfileListCardProps {
  title: string;
  items: any[];
  icon: React.ElementType;
  emptyMsg: string;
}

const ProfileListCard = ({
  title,
  items,
  icon: HeaderIcon,
  emptyMsg,
}: ProfileListCardProps) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full transition-all hover:shadow-md">
    {/* Header */}
    <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/30">
      <HeaderIcon size={18} className="text-blue-600" />
      <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
        {title}
      </h3>
    </div>

    {/* List Body */}
    <div className="flex-grow">
      {items.length > 0 ? (
        items.map((item: any, idx: number) => (
          <div
            key={idx}
            className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                {item.title}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                {item.subtitle}
              </span>
            </div>
            <ChevronRight
              size={14}
              className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all"
            />
          </div>
        ))
      ) : (
        <div className="p-10 text-center text-slate-400 italic text-sm font-medium">
          {emptyMsg}
        </div>
      )}
    </div>
  </div>
);

export default ProfileListCard;
