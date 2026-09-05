const fs = require('fs');
const path = 'frontend/src/pages/PatientDetail.tsx';
let code = fs.readFileSync(path, 'utf8');

const tabFind = `<button 
              className={\`px-4 py-3 font-bold \${activeTab === 'summary' ? 'border-b-4 border-green-600 text-green-700' : 'text-gray-500'}\`}
              onClick={() => setActiveTab('summary')}
            >
              Summary
            </button>`;
const tabReplace = `<button 
              className={\`px-4 py-3 font-bold \${activeTab === 'summary' ? 'border-b-4 border-green-600 text-green-700' : 'text-gray-500'}\`}
              onClick={() => setActiveTab('summary')}
            >
              Summary
            </button>
            <button 
              className={\`px-4 py-3 font-bold \${activeTab === 'diagnostics' ? 'border-b-4 border-green-600 text-green-700' : 'text-gray-500'}\`}
              onClick={() => setActiveTab('diagnostics')}
            >
              Diagnostics
            </button>`;
if(!code.includes('Diagnostics\n            </button>')) code = code.replace(tabFind, tabReplace);

const renderFind = `{activeTab === 'summary' && (`;
const renderReplace = `{activeTab === 'diagnostics' && (
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h2 className="text-xl font-bold mb-4">Diagnostic History</h2>
              {diagnosticOrders.length === 0 ? <p className="text-gray-500">No diagnostic orders found.</p> : (
                <div className="grid gap-4">
                  {diagnosticOrders.map(o => (
                    <div key={o.id} className="border p-4 rounded bg-gray-50 flex flex-col md:flex-row justify-between">
                      <div>
                        <h4 className="font-bold">{o.testName} <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">{o.status}</span></h4>
                        <p className="text-sm text-gray-600">Ordered by {o.referringFacilityName} &rarr; Processing at {o.diagnosticFacilityName}</p>
                        <p className="text-sm mt-2"><strong>Reason:</strong> {o.clinicalReason}</p>
                        
                        {(o.resultValue || o.resultQualitative) && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            <h5 className="font-bold text-sm text-gray-700">Lab Results</h5>
                            {o.resultValue && <p className="text-sm">Value: {o.resultValue}</p>}
                            {o.resultQualitative && <p className="text-sm">Qualitative: {o.resultQualitative}</p>}
                            {o.resultInterpretation && <p className="text-sm italic text-gray-500">Note: {o.resultInterpretation}</p>}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 md:mt-0 md:ml-4 min-w-[200px]">
                        {o.status === 'RESULT_READY' && ['ROLE_DOCTOR_MO', 'ROLE_SPECIALIST'].includes(user?.role || '') && (
                          <button 
                            onClick={async () => {
                              const note = prompt('Enter Clinical Interpretation to Complete Review:');
                              if (note) {
                                try {
                                  await api.post(\`/diagnostics/orders/\${o.id}/review\`, { clinicalInterpretation: note });
                                  alert('Review submitted to EHR.');
                                  window.location.reload();
                                } catch(e) {
                                  alert('Failed to submit review');
                                }
                              }
                            }}
                            className="bg-green-600 text-white px-3 py-2 rounded text-sm font-bold w-full"
                          >
                            Review & Add to EHR
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'summary' && (`

if(!code.includes('activeTab === \'diagnostics\'')) code = code.replace(renderFind, renderReplace);

fs.writeFileSync(path, code);
