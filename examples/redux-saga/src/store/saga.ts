/**
 * @copyright Romain Bertrand 2018
 */

import type { Action } from 'redux';
import type { EventChannel } from 'redux-saga';
import { END, eventChannel } from 'redux-saga';
import { call, cancel, delay, fork, put, take } from 'redux-saga/effects';
import { Effect } from 'redux-saga/effects';

import { actions } from './reducer';

const RECONNECT_TIMEOUT = 6000;

function websocketInitChannel(connection: WebSocket): EventChannel<Action<unknown>> {
  return eventChannel((emitter) => {
    const closeCallback = () => {
      emitter(actions.connectionLost());
      return emitter(END);
    };

    connection.onmessage = (e) => {
      return emitter(actions.storeReceivedMessage(e.data));
    };

    connection.onclose = closeCallback;
    connection.onerror = closeCallback;

    return () => {
      // unsubscribe function
      connection.close();
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function* sendMessage<A>(connection: WebSocket): Generator<Effect, A, any> {
  while (true) {
    const { payload } = yield take(actions.send);
    yield put(actions.storeSentMessage(payload));
    yield call([connection, connection.send], payload);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function* saga<A>(): Generator<Effect, A, any> {
  const connection = new WebSocket(`ws://${window.location.hostname}:8080`);
  const channel = yield call(websocketInitChannel, connection);
  yield put(actions.connectionSuccess());
  const sendMessageTask = yield fork(sendMessage, connection);
  try {
    while (true) {
      const action = yield take(channel);
      yield put(action);
    }
  } finally {
    // cancel background tasks...
    channel.close();
    yield cancel(sendMessageTask);
    // ...and start again
    yield delay(RECONNECT_TIMEOUT);
    yield call(saga);
  }
}
