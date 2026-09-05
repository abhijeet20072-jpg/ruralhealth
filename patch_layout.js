const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/components/Layout.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<span className="flex items-center text-red-300">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span> Offline
                  </span>`,
  `<span className="flex items-center text-rose-300 font-semibold text-sm">
                    <span className="w-2 h-2 bg-rose-500 rounded-full mr-2 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"></span> Offline
                  </span>`
);

content = content.replace(
  `<span className="flex items-center text-emerald-300 font-semibold text-sm">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span> Online
                  </span>`,
  `<span className="flex items-center text-emerald-400 font-semibold text-sm">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span> Online
                  </span>`
);

content = content.replace(
  `<span className="bg-yellow-500 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                    {pendingCount} Pending Sync
                  </span>`,
  `<span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                    {pendingCount} Pending
                  </span>`
);

content = content.replace(
  `<span className="text-slate-200 text-xs animate-pulse font-medium">Syncing...</span>`,
  `<span className="text-cyan-300 text-xs animate-pulse font-bold flex items-center gap-1.5">
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Syncing...
                  </span>`
);

fs.writeFileSync(file, content);
