/**
 * @copyright Romain Bertrand 2018
 * @copyright Akiomi Kamakura 2023
 */

import './styles.css';

import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import App from './App';
import makeStore from './store';

const store = makeStore();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <App />
  </Provider>
);
