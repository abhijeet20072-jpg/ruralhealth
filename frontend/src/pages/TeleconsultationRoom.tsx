import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useConnectivity } from '../context/ConnectivityContext';

export default function TeleconsultationRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOnline, enqueueOperation } = useConnectivity();
  const [tc, setTc] = useState<any>(null);
  
  const [connectionState, setConnectionState] = useState<string>('Disconnected');
  const [notes, setNotes] = useState('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchTc();
    return () => {
      cleanup();
    };
  }, [id]);

  const fetchTc = async () => {
    try {
      const res = await api.get(`/api/teleconsultations/${id}`);
      setTc(res.data.consultation);
    } catch (err) {
      console.error('Failed to fetch consultation', err);
    }
  };

  const cleanup = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  };

  const startSignaling = async () => {
    try {
      const res = await api.post(`/api/teleconsultations/${id}/ticket`);
      const ticket = res.data.ticket;

      eventSourceRef.current = new EventSource(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/teleconsultations/${id}/signaling?ticket=${ticket}`
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
  };

  const setupWebRTC = async () => {
    if (!isOnline) {
      alert('Cannot initiate live WebRTC while offline. Please use Store-and-Forward clinical notes below.');
      return;
    }
    try {
      setConnectionState('Connecting...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          api.post(`/api/teleconsultations/${id}/signaling`, {
            type: 'candidate',
            candidate: event.candidate
          }).catch(console.error);
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'connected') {
          setConnectionState('Connected');
          api.put(`/api/teleconsultations/${id}/status`, { status: 'IN_PROGRESS' }).catch(console.error);
        } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
          setConnectionState('Disconnected');
        }
      };

      peerConnectionRef.current = pc;
      startSignaling();
    } catch (err) {
      console.error(err);
      setConnectionState('Hardware Error or Denied');
    }
  };

  const createOffer = async () => {
    if (!peerConnectionRef.current) return;
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    await api.post(`/api/teleconsultations/${id}/signaling`, {
      type: 'offer',
      sdp: offer
    });
  };

  const handleOffer = async (sdp: any) => {
    if (!peerConnectionRef.current) return;
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    await api.post(`/api/teleconsultations/${id}/signaling`, {
      type: 'answer',
      sdp: answer
    });
  };

  const handleAnswer = async (sdp: any) => {
    if (!peerConnectionRef.current) return;
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
  };

  const handleCandidate = async (candidate: any) => {
    if (!peerConnectionRef.current) return;
    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const completeConsultation = async () => {
    try {
      if (isOnline) {
        await api.put(`/api/teleconsultations/${id}/status`, { 
          status: 'COMPLETED',
          clinicalNotes: notes
        });
      } else {
        await enqueueOperation({
          id: crypto.randomUUID(),
          type: 'UPDATE_TELECONSULTATION_STATUS',
          payload: { tcId: id, status: 'COMPLETED', clinicalNotes: notes },
          timestamp: new Date().toISOString()
        });
        alert('Offline mode: Clinical notes saved locally for async sync.');
      }
      cleanup();
      navigate('/teleconsultations');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to complete consultation');
    }
  };

  if (!tc) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-slate-900 shadow-xl px-4 py-5 sm:rounded-2xl sm:p-6 text-white border border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
            <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Consultation #{tc.id.substring(0,8)}
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            connectionState === 'Connected' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}>
            {connectionState}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative">
          <div className="bg-black aspect-video flex items-center justify-center rounded-xl overflow-hidden relative border-2 border-slate-700/50 shadow-inner">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10">You</div>
          </div>
          <div className="bg-black aspect-video flex items-center justify-center rounded-xl overflow-hidden relative border-2 border-slate-700/50 shadow-inner">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10">Remote Peer</div>
            {connectionState !== 'Connected' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20">
                <span className="text-white font-medium drop-shadow-md">Waiting for peer...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center space-x-4 py-4 bg-slate-800/50 rounded-xl mb-6">
          {connectionState === 'Disconnected' && (
            <button
              onClick={setupWebRTC}
              className="bg-cyan-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-cyan-700 transition-colors inline-flex items-center gap-2"
            >
              Join Call
            </button>
          )}
          <button
            onClick={() => {
              cleanup();
              setConnectionState('Disconnected');
            }}
            className="bg-rose-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-rose-700 transition-colors inline-flex items-center gap-2"
          >
            Leave Call
          </button>
        </div>

        {user?.role !== 'ROLE_CITIZEN' && (
          <div className="mt-6 border-t border-slate-700 pt-6">
            <h3 className="text-lg font-medium text-slate-100 mb-3">Clinical Documentation</h3>
            <textarea
              rows={4}
              className="bg-slate-800 text-white border-slate-700 shadow-inner focus:ring-cyan-500 focus:border-cyan-500 block w-full p-3 rounded-lg resize-none placeholder-slate-500"
              placeholder="Enter consultation summary, findings, and recommendations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={completeConsultation}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-emerald-700 transition-colors"
              >
                Complete & Save EHR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
