/**
 * @copyright Romain Bertrand 2018
 */

import ConnectionIndicator from './ConnectionIndicator';
import MessageInput from './MessageInput';
import Messages from './Messages';

const App = () => (
  <div className="App">
    <ConnectionIndicator />
    <Messages />
    <MessageInput />
  </div>
);

export default App;
