import React, { Component } from 'react'

import './RepView.scss';

const RepresentativePicture = ({image}) => (
		<div>
			<img src={image} className='img-responsive rep-img'/>
		</div>
)

export default RepresentativePicture
