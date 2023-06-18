/**
 * @copyright Romain Bertrand 2018
 * @copyright Akiomi Kamakura 2023
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, describe, expect, it } from 'vitest';
import { WS } from 'vitest-websocket-mock';

import App from './App';

// TODO: Reuse ws instance in each test case
const ws1: WS = new WS('ws://localhost:8080');
const ws2: WS = new WS('ws://localhost:8081');

afterEach(async () => {
  document.getElementsByTagName('body')[0].innerHTML = ''; // Clear jsdom rendering
});

afterAll(() => {
  WS.clean();
});

describe('The App component', () => {
  it('renders a dot indicating the connection status', async () => {
    render(<App port={8080} />);
    expect(screen.getByTitle('disconnected')).toBeInTheDocument();

    await ws1.connected;
    expect(await screen.findByTitle('connected')).toBeInTheDocument();

    ws1.close();
    expect(await screen.findByTitle('disconnected')).toBeInTheDocument();
  });

  it('sends and receives messages', async () => {
    const user = userEvent.setup();

    render(<App port={8081} />);
    await ws2.connected;

    const input = screen.getByPlaceholderText('type your message here...');
    await user.type(input, 'Hello there');
    await user.keyboard('[Enter]');

    await expect(ws2).toReceiveMessage('Hello there');
    expect(await screen.findByText('(sent) Hello there')).toBeInTheDocument();

    ws2.send('[echo] Hello there');
    expect(await screen.findByText('(received) [echo] Hello there')).toBeInTheDocument();
  });
});
