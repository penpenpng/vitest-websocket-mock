/**
 * @copyright Romain Bertrand 2018
 * @copyright AKiomi Kamakura 2023
 */

import { afterEach, describe, expect, it } from 'vitest';

import { render, screen, userEvent } from '../test-utils';
import App from '../App';

afterEach(async () => {
  document.getElementsByTagName('body')[0].innerHTML = ''; // Clear jsdom rendering
});

describe('The App component', () => {
  it('renders the app skeleton', async () => {
    const { container } = await render(<App />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a green dot when successfully connected', async () => {
    await render(<App />);
    expect(screen.getByTitle('connected')).toBeInTheDocument();
  });

  it('renders a red dot when not connected', async () => {
    const { ws } = await render(<App />);
    ws.close();
    expect(await screen.findByTitle('disconnected')).toBeInTheDocument();
  });

  it('sends the message when submitting the form', async () => {
    const user = userEvent.setup();

    const { ws } = await render(<App />);
    const input = screen.getByPlaceholderText('type your message here...');
    await user.type(input, 'Hello there');
    await user.keyboard('[Enter]');
    expect(await screen.findByText('(sent) Hello there')).toBeInTheDocument();
    await expect(ws).toReceiveMessage('Hello there');

    ws.send('[echo] Hello there');
    expect(await screen.findByText('(received) [echo] Hello there')).toBeInTheDocument();
  });
});
