import React from 'react';
import Child from './child';
import { Router, Route, Link, browserHistory } from 'react-router';

export default class Root extends React.Component {
   render () {
      return (
         <div>
           <input type='text' />
            <Child v='a' />
            <Child v='b' />
            <Child v='c' />
            <Child v='d' />
         </div>
      )
   }
}
