const fs = require('fs');
const path = 'frontend/src/pages/Appointments.tsx';
let code = fs.readFileSync(path, 'utf8');

const findImport = `import { Link } from 'react-router-dom';`;
const replaceImport = `import { Link, useSearchParams } from 'react-router-dom';`;

if (!code.includes('useSearchParams')) {
    code = code.replace(findImport, replaceImport);
}

const findState = `const [booking, setBooking] = useState({ facilityId: '', doctorId: '', date: '', timeSlot: '' });`;
const replaceState = `const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState({ 
    facilityId: searchParams.get('facilityId') || '', 
    doctorId: searchParams.get('doctorId') || '', 
    date: '', 
    timeSlot: '' 
  });`;

if (!code.includes('searchParams.get')) {
    code = code.replace(findState, replaceState);
}

fs.writeFileSync(path, code);
