/**
 * @copyright Romain Bertrand 2018
 * @copyright Akiomi Kamakura 2023
 */

import { act } from 'react-dom/test-utils';
import { describe, it } from 'vitest';

describe('The index', () => {
  it('can be imported without errors', async () => {
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.appendChild(root);

    await act(async () => {
      await import('../index.tsx');
    });
  });
});
