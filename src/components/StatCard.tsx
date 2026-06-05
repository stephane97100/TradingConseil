import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface StatDetailItem {
  label: string;
  value: string;
  colorClass?: string;
}

interface StatCardProps {
  id: string;
  title: string;
  value: string;
  icon?: React.ReactNode;
  badgeText?: string;
  badgeColorClass?: string;
  extraDetails: StatDetailItem[];
  customFooterElement?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  icon,
  badgeText,
  badgeColorClass = "text-indigo-400",
  extraDetails,
  customFooterElement
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      id={id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden transition-colors duration-200 hover:border-slate-700/80 hover:bg-slate-900/90 cursor-default select-none shadow-lg h-auto"
      layout="position"
      whileHover={{ scale: 1.02 }}
    >
      {/* Decorative ambient background blur effect on hover */}
      <motion.div
        className="absolute -right-16 -top-16 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"
        animate={{
          scale: isHovered ? 1.4 : 1,
          opacity: isHovered ? 1 : 0.5
        }}
        transition={{ duration: 0.3 }}
      />

      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-bold">
            {title}
          </span>
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
        </div>

        <div className="flex items-end justify-between mt-2.5">
          <span className="text-xl font-bold text-white font-display leading-tight">
            {value}
          </span>
          
          {badgeText && !customFooterElement && (
            <span className={`text-[10px] font-mono uppercase font-bold ${badgeColorClass}`}>
              {badgeText}
            </span>
          )}

          {customFooterElement && (
            <div className="shrink-0">{customFooterElement}</div>
          )}
        </div>
      </div>

      {/* Expandable Extra Details Tray */}
      <motion.div
        initial={false}
        animate={{
          height: isHovered ? "auto" : 0,
          opacity: isHovered ? 1 : 0,
          marginTop: isHovered ? 14 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden border-t border-slate-850/60"
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 font-mono text-[9px]">
          {extraDetails.map((detail, idx) => (
            <div key={idx} className="flex flex-col justify-between py-0.5 border-b border-slate-950/20">
              <span className="text-slate-500 uppercase tracking-tight">{detail.label}</span>
              <span className={`font-bold mt-0.5 ${detail.colorClass || "text-slate-350"}`}>
                {detail.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
