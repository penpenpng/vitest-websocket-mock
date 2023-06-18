/**
 * @copyright Romain Bertrand 2018
 * @copyright Akiomi Kamakura 2023
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { WS } from 'vitest-websocket-mock';

import App from './App';

let ws: WS;

beforeEach(async () => {
  ws = new WS('ws://localhost:8080');
});

afterEach(() => {
  WS.clean();
  document.getElementsByTagName('body')[0].innerHTML = ''; // Clear jsdom rendering
});

describe('The App component', () => {
  it('renders a dot indicating the connection status', async () => {
    render(<App />);
    expect(screen.getByTitle('disconnected')).toBeInTheDocument();

    await ws.connected;
    expect(await screen.findByTitle('connected')).toBeInTheDocument();

    ws.close();
    await ws.closed;
    expect(await screen.findByTitle('disconnected')).toBeInTheDocument();
  });

  it('sends and receives messages', async () => {
    const user = userEvent.setup();

    render(<App />);
    await ws.connected;

    const input = screen.getByPlaceholderText('type your message here...');
    await user.type(input, 'Hello there');
    await user.keyboard('[Enter]');

    await expect(ws).toReceiveMessage('Hello there');
    expect(await screen.findByText('(sent) Hello there')).toBeInTheDocument();

    ws.send('[echo] Hello there');
    expect(await screen.findByText('(received) [echo] Hello there')).toBeInTheDocument();
  });
});
