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
    <div className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg leading-6 font-medium text-gray-900">
            Consultation #{tc.id.substring(0,8)}
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            connectionState === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {connectionState}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-100 aspect-video flex items-center justify-center rounded-lg overflow-hidden relative">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">You</div>
          </div>
          <div className="bg-gray-100 aspect-video flex items-center justify-center rounded-lg overflow-hidden relative">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">Remote Peer</div>
            {connectionState !== 'Connected' && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20">
                <span className="text-white font-medium drop-shadow-md">Waiting for peer...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          {connectionState === 'Disconnected' && (
            <button
              onClick={setupWebRTC}
              className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
            >
              Join Call
            </button>
          )}
          <button
            onClick={() => {
              cleanup();
              setConnectionState('Disconnected');
            }}
            className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
          >
            Leave Call
          </button>
        </div>

        {user?.role !== 'ROLE_CITIZEN' && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-md font-medium text-gray-900 mb-2">Clinical Documentation</h3>
            <textarea
              rows={4}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter consultation summary, findings, and recommendations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={completeConsultation}
                className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
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
