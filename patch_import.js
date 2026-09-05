const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'frontend', 'src', 'pages', 'PatientManage.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { useNavigate, useParams } from 'react-router-dom';",
  "import { useNavigate, useParams } from 'react-router-dom';\nimport { useAuth } from '../context/AuthContext';"
);

fs.writeFileSync(file, content);
