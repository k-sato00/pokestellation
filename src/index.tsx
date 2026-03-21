import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

document.body.style.margin = '0';
document.body.style.minHeight = '100vh';

const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.style.minHeight = '100vh';
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement
);