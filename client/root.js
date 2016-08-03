import React from 'react';
import Child from './child';
var img = require('./favicon0.png');

export default class Root extends React.Component {
   render () {
      return <div>
         <input type='text' />
         <Child v='a'/>
         <Child v='b'/>
         <Child v='c'/>
         <Child v='d'/>
         <img src={img} />
      </div>
   }
}
