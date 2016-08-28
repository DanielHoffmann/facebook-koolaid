// @flow

import React from 'react';
import Child from './child';
//import { Router, Route, Link, browserHistory } from 'react-router';

function sum(a: number, b: number): number {
   return a + b;
}
export default class Root extends React.Component {
   render () {
      let text: number = sum(1,3);
      return (
         <div>
            <input type='text' />
            <Child v={text} />
            <Child v='b' />
            <Child v='c' />
            <Child v='d' />
         </div>
      )
   }
}
