const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, 'frontend', 'src', 'components', 'Layout.tsx');
let layoutContent = fs.readFileSync(layoutPath, 'utf8');

// Add mobile menu state
if (!layoutContent.includes('isMobileMenuOpen')) {
  layoutContent = layoutContent.replace(
    `export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {`,
    `export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);`
  );

  layoutContent = layoutContent.replace(
    `<div className="flex items-center justify-between h-16">`,
    `<div className="flex items-center justify-between h-16">
            <div className="flex items-center md:hidden mr-4">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 hover:text-white focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>`
  );

  layoutContent = layoutContent.replace(
    `<Sidebar />`,
    `<Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />`
  );
  
  // Also fix the flex layout slightly so the button sits next to the brand
  layoutContent = layoutContent.replace(
    `<div className="flex items-center">
              <Link to="/dashboard" className="flex flex-col flex-shrink-0 group">`,
    `<div className="flex items-center">
              <div className="flex items-center md:hidden mr-4">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 hover:text-white focus:outline-none">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
              <Link to="/dashboard" className="flex flex-col flex-shrink-0 group">`
  );
  
  // Remove the previous duplicate insertion I just added via string replace which was slightly wrong
  layoutContent = layoutContent.replace(
    `<div className="flex items-center justify-between h-16">
            <div className="flex items-center md:hidden mr-4">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 hover:text-white focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
            <div className="flex items-center">`,
    `<div className="flex items-center justify-between h-16">
            <div className="flex items-center">`
  );
  
  fs.writeFileSync(layoutPath, layoutContent);
}

const sidebarPath = path.join(__dirname, 'frontend', 'src', 'components', 'Sidebar.tsx');
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

sidebarContent = sidebarContent.replace(
  `export const Sidebar: React.FC = () => {`,
  `export const Sidebar: React.FC<{ isOpen?: boolean; setIsOpen?: (v: boolean) => void }> = ({ isOpen, setIsOpen }) => {`
);

sidebarContent = sidebarContent.replace(
  `className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 min-h-[calc(100vh-4.5rem)] flex flex-col shrink-0 overflow-y-auto hidden md:flex"`,
  `className={\`\${isOpen ? 'block absolute z-20 h-full' : 'hidden'} md:block md:relative w-64 bg-slate-900 border-r border-slate-800 text-slate-300 min-h-[calc(100vh-4.5rem)] flex flex-col shrink-0 overflow-y-auto\`}`
);

sidebarContent = sidebarContent.replace(
  `          <Link`,
  `          <Link onClick={() => setIsOpen && setIsOpen(false)}`
);

fs.writeFileSync(sidebarPath, sidebarContent);

