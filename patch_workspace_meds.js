const fs = require('fs');
const path = 'frontend/src/pages/ConsultationWorkspace.tsx';
let code = fs.readFileSync(path, 'utf8');

const importFind = `import { OrderDiagnosticModal } from '../components/OrderDiagnosticModal';`;
const importReplace = importFind + `\nimport { CheckMedicineAvailabilityModal } from '../components/CheckMedicineAvailabilityModal';`;
if(!code.includes('CheckMedicineAvailabilityModal')) code = code.replace(importFind, importReplace);

const stateFind = `const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);`;
const stateReplace = stateFind + `\n  const [checkMedTerm, setCheckMedTerm] = useState<string | null>(null);`;
if(!code.includes('checkMedTerm')) code = code.replace(stateFind, stateReplace);

const inputFind = `<input type="text" className="border p-2 rounded" placeholder="Medicine" value={p.medicine} onChange={e => handlePrescriptionChange(index, 'medicine', e.target.value)} />`;
const inputReplace = `<div className="flex gap-2">
                    <input type="text" className="border p-2 rounded w-full" placeholder="Medicine" value={p.medicine} onChange={e => handlePrescriptionChange(index, 'medicine', e.target.value)} />
                    <button type="button" onClick={() => { if(p.medicine) setCheckMedTerm(p.medicine); }} className="bg-indigo-50 text-indigo-700 px-2 rounded font-bold text-xs border border-indigo-200 shrink-0" title="Check Availability">
                      Check Stock
                    </button>
                  </div>`;
if(!code.includes('Check Stock')) code = code.replace(inputFind, inputReplace);

const modalFind = `{showDiagnosticModal && <OrderDiagnosticModal patientId={appointment!.patientId} onClose={() => setShowDiagnosticModal(false)} />}`;
const modalReplace = modalFind + `\n      {checkMedTerm && <CheckMedicineAvailabilityModal searchTerm={checkMedTerm} onClose={() => setCheckMedTerm(null)} />}`;
if(!code.includes('searchTerm={checkMedTerm}')) code = code.replace(modalFind, modalReplace);

fs.writeFileSync(path, code);
