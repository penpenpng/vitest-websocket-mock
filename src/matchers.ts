/**
 * @copyright Romain Bertrand 2018
 * @copyright Akiomi Kamakura 2023
 */

import type { MatcherState, RawMatcherFn } from '@vitest/expect';
import { diff } from 'jest-diff';
import { expect } from 'vitest';

import WS from './websocket';
import { DeserializedMessage } from './websocket';

export type ReceiveMessageOptions = {
  timeout?: number;
};

interface CustomMatchers<R = unknown> {
  toReceiveMessage<TMessage = object>(message: DeserializedMessage<TMessage>, options?: ReceiveMessageOptions): Promise<R>;
  toHaveReceivedMessages<TMessage = object>(messages: Array<DeserializedMessage<TMessage>>): R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends CustomMatchers<T> {}

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

const WAIT_DELAY = 1000;
const TIMEOUT = Symbol('timoeut');

const makeInvalidWsMessage = function makeInvalidWsMessage(this: MatcherState, ws: WS, matcher: string) {
  return (
    this.utils.matcherHint(this.isNot ? `.not.${matcher}` : `.${matcher}`, 'WS', 'expected') +
    '\n\n' +
    `Expected the websocket object to be a valid WS mock.\n` +
    `Received: ${typeof ws}\n` +
    `  ${this.utils.printReceived(ws)}`
  );
};

export const deriveToReceiveMessage = (name: string, fn: RawMatcherFn): RawMatcherFn => {
  return async function (ws: WS, expected: DeserializedMessage, options?: ReceiveMessageOptions) {
    const isWS = ws instanceof WS;
    if (!isWS) {
      return {
        pass: this.isNot, // always fail
        message: makeInvalidWsMessage.bind(this, ws, name),
      };
    }

    const waitDelay = options?.timeout ?? WAIT_DELAY;

    const messageOrTimeout = await Promise.race([
      ws.nextMessage,
      new Promise((resolve) => setTimeout(() => resolve(TIMEOUT), waitDelay)),
    ]);

    if (messageOrTimeout === TIMEOUT) {
      return {
        pass: this.isNot, // always fail
        message: () =>
          this.utils.matcherHint(`${this.isNot ? '.not' : ''}.${name}`, 'WS', 'expected') +
          '\n\n' +
          `Expected the websocket server to receive a message,\n` +
          `but it didn't receive anything in ${waitDelay}ms.`,
      };
    } else {
      const received = messageOrTimeout;
      const result = await Promise.resolve(fn.bind(this)(received, expected, options));

      return { name, ...result };
    }
  };
};

const toReceiveMessage = deriveToReceiveMessage('toReceiveMessage', function (received, expected) {
  const pass = this.equals(received, expected);

  const message = pass
    ? () =>
        this.utils.matcherHint('.not.toReceiveMessage', 'WS', 'expected') +
        '\n\n' +
        `Expected the next received message to not equal:\n` +
        `  ${this.utils.printExpected(expected)}\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(received)}`
    : () => {
        const diffString = diff(expected, received, { expand: this.expand });
        return (
          this.utils.matcherHint('.toReceiveMessage', 'WS', 'expected') +
          '\n\n' +
          `Expected the next received message to equal:\n` +
          `  ${this.utils.printExpected(expected)}\n` +
          `Received:\n` +
          `  ${this.utils.printReceived(received)}\n\n` +
          `Difference:\n\n${diffString}`
        );
      };

  return {
    actual: received,
    expected,
    message,
    pass,
  };
});

export const deriveToHaveReceivedMessage = (name: string, fn: RawMatcherFn): RawMatcherFn => {
  return function (ws: WS, expected: Array<DeserializedMessage>) {
    const isWS = ws instanceof WS;
    if (!isWS) {
      return {
        pass: this.isNot, // always fail
        message: makeInvalidWsMessage.bind(this, ws, name),
      };
    }

    const result = fn.bind(this)(ws.messages, expected);
    return { name, ...result };
  };
};

const toHaveReceivedMessages = deriveToHaveReceivedMessage(
  'toHaveReceivedMessages',
  function (received: Array<DeserializedMessage>, expected: Array<DeserializedMessage>) {
    const equalities = expected.map((expectedMsg) =>
      // object comparison to handle JSON protocols
      received.some((receivedMsg) => this.equals(receivedMsg, expectedMsg))
    );
    const pass = this.isNot ? equalities.some(Boolean) : equalities.every(Boolean);

    const message = pass
      ? () =>
          this.utils.matcherHint('.not.toHaveReceivedMessages', 'WS', 'expected') +
          '\n\n' +
          `Expected the WS server to not have received the following messages:\n` +
          `  ${this.utils.printExpected(expected)}\n` +
          `But it received:\n` +
          `  ${this.utils.printReceived(received)}`
      : () => {
          return (
            this.utils.matcherHint('.toHaveReceivedMessages', 'WS', 'expected') +
            '\n\n' +
            `Expected the WS server to have received the following messages:\n` +
            `  ${this.utils.printExpected(expected)}\n` +
            `Received:\n` +
            `  ${this.utils.printReceived(received)}\n\n`
          );
        };

    return {
      actual: received,
      expected,
      message,
      pass,
    };
  }
);

expect.extend({
  toReceiveMessage,
  toHaveReceivedMessages,
});
