const fs = require('fs');
const path = 'frontend/src/pages/ConsultationWorkspace.tsx';
let code = fs.readFileSync(path, 'utf8');

if(!code.includes('import { OrderDiagnosticModal }')) {
  code = code.replace("import { useConnectivity } from '../context/ConnectivityContext';", "import { useConnectivity } from '../context/ConnectivityContext';\nimport { OrderDiagnosticModal } from '../components/OrderDiagnosticModal';");
}

if(!code.includes('showDiagnosticModal')) {
  const stateFind = `const [prescriptions, setPrescriptions] = useState([{ medicine: '', dosage: '', frequency: '', duration: '' }]);`;
  const stateReplace = stateFind + `\n  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);`;
  code = code.replace(stateFind, stateReplace);
}

const sectionFind = `<div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Investigations Ordered</label>
              <textarea rows={2} className="w-full border p-3 rounded" value={investigations} onChange={e => setInvestigations(e.target.value)} placeholder="CBC, X-Ray Chest..."></textarea>
            </div>`;
const sectionReplace = `<div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Investigations Ordered (Free Text)</label>
              <textarea rows={2} className="w-full border p-3 rounded" value={investigations} onChange={e => setInvestigations(e.target.value)} placeholder="Other manual notes..."></textarea>
              <button type="button" onClick={() => setShowDiagnosticModal(true)} className="mt-2 text-sm bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded border border-indigo-200">
                + Order Formal Diagnostic Test
              </button>
            </div>`;
code = code.replace(sectionFind, sectionReplace);

const formEndFind = `</form>\n      </div>\n    </div>\n  );\n}`;
const formEndReplace = `</form>\n      </div>\n      {showDiagnosticModal && <OrderDiagnosticModal patientId={appointment!.patientId} onClose={() => setShowDiagnosticModal(false)} />}\n    </div>\n  );\n}`;
if(!code.includes('<OrderDiagnosticModal')) code = code.replace(formEndFind, formEndReplace);

fs.writeFileSync(path, code);
