import React from 'react';

export function SkillPanel({ icon, type, title, desc, cost, typeGradient }: { icon: React.ReactNode, type: string, title: string, desc: string, cost?: string, typeGradient?: string }) {
  return (
    <div className="bg-gradient-to-b from-[#e3cfb4] to-[#c7b08d] rounded-[4px] border-[2px] border-[#5a4227] p-2 pt-[4px] rpg-panel-shadow relative flex flex-col justify-start min-h-[60px]">
      <div className="absolute inset-0 border border-[#f3e5ca] rounded-[2px] pointer-events-none"></div>
      <div className="flex items-center gap-[6px] mb-[2px]">
        {icon}
        <span className={`font-serif text-[12px] font-bold ${typeGradient ? `bg-clip-text text-transparent bg-gradient-to-b ${typeGradient} filter drop-shadow-[0_1px_0_rgba(0,0,0,0.8)]` : 'text-white text-stroke-black'} tracking-widest mt-[1px]`}>{type}</span>
      </div>
      <div className="w-[102%] -ml-[1%] h-[1.5px] bg-gradient-to-r from-transparent via-[#8a6b4c] to-transparent mb-[4px] opacity-70"></div>
      <div className="flex justify-between items-baseline mb-[2px] w-full">
        <h3 className="text-[13px] text-black font-bold tracking-tight text-white text-stroke-black drop-shadow-[0_1px_1px_rgba(0,0,0,1)] truncate pr-1">{title}</h3>
        {cost && (
          <span className="text-[11px] font-bold text-[#1a110a] border-[1.5px] border-[#5a4227] px-1 rounded-sm bg-[#cfb591] leading-none py-[2px] shadow-sm ml-auto whitespace-nowrap">
            <span className="font-normal mr-[2px]">Cost:</span>{cost}
          </span>
        )}
      </div>
      <p className="text-[11px] font-medium leading-[1.25] text-[#3a220c] w-[95%]">{desc}</p>
    </div>
  );
}
