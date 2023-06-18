/**
 * @copyright Romain Bertrand 2018
 * @copyright AKiomi Kamakura 2023
 */

import { connect } from 'react-redux';

const ConnectionIndicator = ({ connected }: { connected: boolean }) => (
  <div
    className={
      connected ? 'ConnectionIndicator ConnectionIndicator--connected' : 'ConnectionIndicator ConnectionIndicator--disconnected'
    }
    title={connected ? 'connected' : 'disconnected'}
  />
);

export default connect((state: { connected: boolean }) => ({ connected: state.connected }))(ConnectionIndicator);
