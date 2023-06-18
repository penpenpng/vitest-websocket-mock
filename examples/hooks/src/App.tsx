/**
 * @copyright Romain Bertrand 2018
 * @copyright Akiomi Kamakura 2023
 */

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';

type MessageProps = { text: string; side: 'sent' | 'received' };
const Message = ({ text, side }: MessageProps) => <div>{`(${side}) ${text}`}</div>;

function App({ port = 8080 }: { port?: number }) {
  const wsRef = useRef<WebSocket>();
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:${port}`);
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => setMessages((m) => [{ side: 'received', text: event.data }, ...m]);
    wsRef.current = ws;
  }, [port]);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => setCurrentMessage(event.target.value);
  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!wsRef.current) {
      throw new Error('wsRef.current is undefind');
    }

    wsRef.current.send(currentMessage);
    setCurrentMessage('');
    setMessages((m) => [{ side: 'sent', text: currentMessage }, ...m]);
  };

  return (
    <div className="App">
      <div
        className={
          connected
            ? 'ConnectionIndicator ConnectionIndicator--connected'
            : 'ConnectionIndicator ConnectionIndicator--disconnected'
        }
        title={connected ? 'connected' : 'disconnected'}
      />

      <div className="Messages">
        {messages.map((message, i) => (
          <Message key={i} {...message} />
        ))}
      </div>

      <form className="MessageForm" onSubmit={send}>
        <input
          autoFocus
          className="MessageInput"
          value={currentMessage}
          onChange={onChange}
          placeholder="type your message here..."
        />
      </form>
    </div>
  );
}

export default App;
