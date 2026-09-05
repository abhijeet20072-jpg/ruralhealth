const fs = require('fs');

const fixApiImport = (filePath) => {
    let code = fs.readFileSync(filePath, 'utf8');
    code = code.replace("import api from '../services/api';", "import { api } from '../services/api';");
    code = code.replace("res => {", "(res: any) => {");
    code = code.replace("res => {", "(res: any) => {"); // just in case
    code = code.replace("const { user } = useAuth();", "// const { user } = useAuth();");
    fs.writeFileSync(filePath, code);
};

fixApiImport('frontend/src/components/OrderDiagnosticModal.tsx');
fixApiImport('frontend/src/pages/DiagnosticOrders.tsx');
fixApiImport('frontend/src/pages/MyDiagnostics.tsx');

const appPath = 'frontend/src/App.tsx';
let appCode = fs.readFileSync(appPath, 'utf8');
// Check why MyDiagnostics is unused
// Maybe my regex failed to insert it in <Routes>?
// Let's insert it explicitly:
if (!appCode.includes('<Route path="/citizen/diagnostics"')) {
    appCode = appCode.replace(
        '<Route path="/citizen/referrals"',
        '<Route path="/citizen/diagnostics" element={<ProtectedRoute><RoleRoute allowedRoles={["ROLE_CITIZEN"]}><MyDiagnostics /></RoleRoute></ProtectedRoute>} />\n          <Route path="/citizen/referrals"'
    );
    fs.writeFileSync(appPath, appCode);
} else {
    // If it is there but still complaining, maybe it was imported twice?
    appCode = appCode.replace(/import { MyDiagnostics } from '.\/pages\/MyDiagnostics';\nimport { MyDiagnostics } from '.\/pages\/MyDiagnostics';/g, "import { MyDiagnostics } from './pages/MyDiagnostics';");
    fs.writeFileSync(appPath, appCode);
}
