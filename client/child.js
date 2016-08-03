import React from 'react';

export default class Child extends React.Component {
   render () {
      return <div>{this.props.v}</div>
   }
}
