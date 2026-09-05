const fs = require('fs');
const path = 'frontend/src/pages/PatientManage.tsx';
let code = fs.readFileSync(path, 'utf8');

// Frontend submit validation
const findSubmit = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {`;

const replaceSubmit = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    const phoneRegex = /^[6-9]\\d{9}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber.replace(/\\s/g, ''))) {
      setError('Invalid Phone Number. Must be 10 digits starting with 6, 7, 8, or 9.');
      return;
    }
    if (formData.emergencyContactPhone && !phoneRegex.test(formData.emergencyContactPhone.replace(/\\s/g, ''))) {
      setError('Invalid Emergency Contact Phone Number.');
      return;
    }
    
    // Clean up data before sending
    const payload = {
      ...formData,
      phoneNumber: formData.phoneNumber.replace(/\\s/g, ''),
      emergencyContactPhone: formData.emergencyContactPhone.replace(/\\s/g, ''),
      allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : []
    };

    try {`;

if (code.includes(findSubmit)) {
  code = code.replace(findSubmit, replaceSubmit);
}

// Replace the payload in api calls
code = code.replace("await api.put(`/patients/${id}`, { ...formData, allergies: formData.allergies ? formData.allergies.split(',').map((s: string) => s.trim()) : [] });", "await api.put(`/patients/${id}`, payload);");
code = code.replace("await api.post('/patients', { ...formData, allergies: formData.allergies ? formData.allergies.split(',').map((s: string) => s.trim()) : [] });", "await api.post('/patients', payload);");

fs.writeFileSync(path, code);
console.log("Patched PatientManage.tsx");
