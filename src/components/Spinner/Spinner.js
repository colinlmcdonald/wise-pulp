import React, { Component } from 'react';
import ProgressLabel from 'react-progress-label';

//import './Spinner.scss';


export default class Spinner extends Component {

  render() {

    let textStyle = {
      'fill': 'black',
      'textAnchor': 'middle',
      'fontSize': 20
    }
    return (
      <div className="spinner">
        <ProgressLabel
          progress={this.props.progress}
          startDegree={0}
          progressWidth={8}
          trackWidth={20}
          cornersWidth={4}
          size={200}
          fillColor='white'
          trackColor='red'
          progressColor='blue' 
          >
          <text x='100' y='100' style={textStyle}>Loading</text>          
          </ProgressLabel>
      </div>
    )
  }
}



