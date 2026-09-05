const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend', 'src', 'pages', 'PatientManage.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add useAuth import
content = content.replace(
  "import { useParams, useNavigate } from 'react-router-dom';",
  "import { useParams, useNavigate } from 'react-router-dom';\nimport { useAuth } from '../context/AuthContext';"
);

// 2. Extract user and check role
content = content.replace(
  "const navigate = useNavigate();",
  "const navigate = useNavigate();\n  const { user } = useAuth();\n  const isCitizen = user?.role === 'ROLE_CITIZEN';"
);

// 3. Change title
content = content.replace(
  "<h1 className=\"text-2xl font-bold mb-6\">{isEditing ? 'Update Patient Profile' : 'Register New Patient'}</h1>",
  "<h1 className=\"text-2xl font-bold mb-6\">{isEditing ? 'Update Patient Profile' : (isCitizen ? 'Complete Patient Profile' : 'Register New Patient')}</h1>"
);

fs.writeFileSync(file, content);
