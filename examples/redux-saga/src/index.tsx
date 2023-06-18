/**
 * @copyright Romain Bertrand 2018
 * @copyright Akiomi Kamakura 2023
 */

import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import './styles.css';
import makeStore from './store';
import App from './App';

const store = makeStore();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <App />
  </Provider>
);
