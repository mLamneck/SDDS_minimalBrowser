import { useState } from "preact/hooks";
import { ParticleComm } from "../system/ParticleConnector";

export function ParticleConnectorGui({ comm }: { comm: ParticleComm }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [input, setInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [token, setToken] = useState('');
  const [deviceIdError, setDeviceIdError] = useState('');
  const [tokenError, setTokenError] = useState('');

  const connect = () => {
    setDeviceIdError('');
    setTokenError('');
    setShowModal(true);
  };

  const disconnect = () => {
	setConnected(false);
  }

  const connectDisconnect = ()=>{
	if (!connected)
		connect()
	else
		disconnect();
  }

  const handleConnect = () => {
    let valid = true;

    if (!deviceId.trim()) {
      setDeviceIdError('Please enter a Device ID');
      valid = false;
    } else {
      setDeviceIdError('');
    }

    if (!token.trim()) {
      setTokenError('Please Enter an Access Token');
      valid = false;
    } else {
      setTokenError('');
    }

    if (!valid || connected) return;

    comm.connect(deviceId, token, {
      onopen: () => {
        console.log('connected');
        setConnected(true);
        setShowModal(false);
      },
      onmessage: (msg) => {
        setMessages(prev => [...prev, msg]);
      },
      onclose: () => {
        console.log('connection closed');
        setConnected(false);
      },
      onerror: (err) => {
        console.error('error:', err);
      },
      onreconnect: (attempt) => {
        console.log(`reconnect ${attempt}`);
      },
    });
  };

  const sendMessage = () => {
    if (!input.trim() || !comm) return;
    comm.send(input)
      .then(() => {
        console.log('message sent:', input);
        setInput('');
      })
      .catch(err => {
        console.error('error while sending:', err);
      });
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={connectDisconnect}>
        {connected ? 'Close' : 'Connect'}
      </button>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#fff', padding: '2rem', borderRadius: '8px',
            minWidth: '300px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <h2>Establish Connection</h2>
            <input
              type="text"
              placeholder="Device ID"
              value={deviceId}
              onChange={(e) => setDeviceId(e.currentTarget.value)}
              style={{
                display: 'block', marginBottom: '0.25rem', width: '100%', padding: '0.5rem',
                border: deviceIdError ? '1px solid red' : undefined
              }}
            />
            {deviceIdError && <div style={{ color: 'red', fontSize: '0.875rem', marginBottom: '1rem' }}>{deviceIdError}</div>}

            <input
              type="password"
              placeholder="Access Token"
              value={token}
              onChange={(e) => setToken(e.currentTarget.value)}
              style={{
                display: 'block', marginBottom: '0.25rem', width: '100%', padding: '0.5rem',
                border: tokenError ? '1px solid red' : undefined
              }}
            />
            {tokenError && <div style={{ color: 'red', fontSize: '0.875rem', marginBottom: '1rem' }}>{tokenError}</div>}

            <button onClick={handleConnect} style={{ marginRight: '1rem' }}>Connect</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Nachrichteneingabe */}
	  {connected && (<>
      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Nachricht eingeben"
          style={{ padding: '0.5rem', width: '70%', marginRight: '0.5rem' }}
          disabled={!connected}
        />
        <button onClick={sendMessage} disabled={!connected || !input.trim()}>
          Senden
        </button>
      </div>
      <h2 style={{ marginTop: '2rem' }}>Empfangene Nachrichten:</h2>
      <div style={{
        border: '1px solid #ccc',
        padding: '1rem',
        height: '200px',
        overflowY: 'auto',
        background: '#f9f9f9'
      }}>
        {messages.length === 0 && <p>Keine Nachrichten</p>}
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '0.5rem' }}>{msg}</div>
        ))}
      </div>
	  </>)}
    </div>
  );
}
