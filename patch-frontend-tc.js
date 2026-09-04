const fs = require('fs');

let code = fs.readFileSync('frontend/src/pages/TeleconsultationRoom.tsx', 'utf8');

code = code.replace(
  /const startSignaling = \(\) => {[\s\S]*?eventSourceRef.current\.onerror = \(\) => {[\s\S]*?};[\s\S]*?};/,
  `const startSignaling = async () => {
    try {
      const res = await api.post(\`/api/teleconsultations/\${id}/ticket\`);
      const ticket = res.data.ticket;

      eventSourceRef.current = new EventSource(
        \`\${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/teleconsultations/\${id}/signaling?ticket=\${ticket}\`
      );

      eventSourceRef.current.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'PEER_JOINED') {
          if (user?.role !== 'ROLE_CITIZEN') {
            await createOffer();
          }
        } else if (msg.type === 'offer') {
          await handleOffer(msg.sdp);
        } else if (msg.type === 'answer') {
          await handleAnswer(msg.sdp);
        } else if (msg.type === 'candidate') {
          await handleCandidate(msg.candidate);
        } else if (msg.type === 'PEER_LEFT') {
          setConnectionState('Disconnected');
        }
      };

      eventSourceRef.current.onerror = () => {
        setConnectionState('Signaling Failed');
        eventSourceRef.current?.close();
      };
    } catch (err) {
      console.error('Signaling auth failed', err);
      setConnectionState('Signaling Auth Failed');
    }
  };`
);

// Fix the backticks safely
code = code.replace(/\\`/g, '`').replace(/\\\$/g, '$');

fs.writeFileSync('frontend/src/pages/TeleconsultationRoom.tsx', code);
