const fs = require('fs');
let path = 'frontend/src/pages/ConsultationWorkspace.tsx';
let code = fs.readFileSync(path, 'utf8');

const stateFind = `const [referralFacilityId, setReferralFacilityId] = useState('');`;
const stateReplace = stateFind + `
  const [followUpReason, setFollowUpReason] = useState('');
  const [followUpDays, setFollowUpDays] = useState('');
  const [followUpPriority, setFollowUpPriority] = useState('NORMAL');`;
if(!code.includes('followUpReason')) code = code.replace(stateFind, stateReplace);

const completeFind = `if (referralReason && referralFacilityId) {
        await api.post('/referrals', {
          patientId: appointment!.patientId,
          destinationFacilityId: referralFacilityId,
          reason: referralReason,
          priority: 'NORMAL'
        });
      }`;
const completeReplace = completeFind + `
      
      if (followUpReason && followUpDays) {
        const d = new Date();
        d.setDate(d.getDate() + parseInt(followUpDays, 10));
        await api.post('/notifications/follow-ups', {
          patientId: appointment!.patientId,
          reason: followUpReason,
          dueDate: d.toISOString(),
          priority: followUpPriority,
          relatedEntityType: 'APPOINTMENT',
          relatedEntityId: appointment!.id
        });
      }`;
if(!code.includes('followUpDays')) code = code.replace(completeFind, completeReplace);

const uiFind = `{/* Referral Section */}`;
const uiReplace = `{/* Follow-Up Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Follow-Up (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" className="border p-2 rounded" placeholder="Reason (e.g. Check BP)" value={followUpReason} onChange={e => setFollowUpReason(e.target.value)} />
            <input type="number" className="border p-2 rounded" placeholder="Days from now" value={followUpDays} onChange={e => setFollowUpDays(e.target.value)} />
            <select className="border p-2 rounded" value={followUpPriority} onChange={e => setFollowUpPriority(e.target.value)}>
              <option value="NORMAL">Normal Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="URGENT">Urgent Priority</option>
            </select>
          </div>
        </div>

        ` + uiFind;
if(!code.includes('Follow-Up Section')) code = code.replace(uiFind, uiReplace);

fs.writeFileSync(path, code);
