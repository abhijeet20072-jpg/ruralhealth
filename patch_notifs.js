const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend/src/pages/MyNotifications.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notifications</h1>`,
  `<h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>`
);

content = content.replace(
  `className="bg-white rounded-xl shadow overflow-hidden"`,
  `className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"`
);

content = content.replace(
  `{notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">You have no notifications.</div>
        )`,
  `{notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No notifications</h3>
            <p className="text-slate-500">You're all caught up!</p>
          </div>
        )`
);

content = content.replace(
  `className="bg-cyan-50 text-cyan-700 px-4 py-2 rounded font-bold border border-cyan-200"`,
  `className="bg-white text-slate-700 px-4 py-2 rounded-md font-semibold border border-slate-300 hover:bg-slate-50 shadow-sm transition-colors"`
);

content = content.replace(
  `<ul className="divide-y">`,
  `<ul className="divide-y divide-slate-200">`
);

content = content.replace(
  `bg-cyan-50/20`,
  `bg-cyan-50/40 border-l-4 border-cyan-500`
);
content = content.replace(
  `bg-white`,
  `bg-white border-l-4 border-transparent`
);

content = content.replace(
  `bg-red-100 text-red-700`,
  `bg-rose-100 text-rose-700`
);

fs.writeFileSync(file, content);
