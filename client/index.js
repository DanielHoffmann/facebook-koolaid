import React from 'react';
import ReactDOM from 'react-dom';
import Root from './root';

let rootNode = document.createElement('div');
document.body.appendChild(rootNode);

ReactDOM.render(
  <Root></Root>,
  rootNode
);
