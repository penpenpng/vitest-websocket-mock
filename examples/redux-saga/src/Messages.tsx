/**
 * @copyright Romain Bertrand 2018
 * @copyright AKiomi Kamakura 2023
 */

import { connect } from 'react-redux';

import type { Message } from './store/reducer';

const Message = ({ text, side }: Message) => <div>{`(${side}) ${text}`}</div>;

const Messages = ({ messages }: { messages: Message[] }) => (
  <div className="Messages">
    {messages.map((message, i) => (
      <Message key={i} {...message} />
    ))}
  </div>
);

export default connect((state: { messages: Message[] }) => ({ messages: state.messages }))(Messages);
