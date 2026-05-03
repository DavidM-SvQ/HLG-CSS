const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf8');

const startIndex = content.indexOf('<header className="bg-white border-b border-neutral-200 px-6 py-4 sticky top-0 z-40">');
const endIndex = content.indexOf('</header>', startIndex) + '</header>'.length;

const componentCall = `<AppHeader 
        view={view}
        setView={setView}
        isAdmin={isAdmin}
        user={user}
        lastUpdated={lastUpdated}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        isLoggingIn={isLoggingIn}
      />`;

let newContent = content.substring(0, startIndex) + componentCall + content.substring(endIndex);

// insert the import statement
newContent = newContent.replace(
  /import \{ MonthlyReportView \} from "\.\/MonthlyReportView";/,
  'import { AppHeader } from "./components/AppHeader";\nimport { MonthlyReportView } from "./MonthlyReportView";'
);

fs.writeFileSync('src/App.tsx', newContent);
console.log("AppHeader extracted successfully!");
