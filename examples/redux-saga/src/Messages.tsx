/**
 * @copyright Romain Bertrand 2018
 * @copyright AKiomi Kamakura 2023
 */

import { connect } from 'react-redux';

import type { Message as MessageT } from './store/reducer';

const Message = ({ text, side }: MessageT) => <div>{`(${side}) ${text}`}</div>;

const Messages = ({ messages }: { messages: MessageT[] }) => (
  <div className="Messages">
    {messages.map((message, i) => (
      <Message key={i} {...message} />
    ))}
  </div>
);

export default connect((state: { messages: MessageT[] }) => ({ messages: state.messages }))(Messages);
