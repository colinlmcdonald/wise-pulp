import React, { Component } from 'react'

import './RepView.scss';

const RepresentativeDetails = ({representative}) => (
	<div className='row'>
			<div className='rep-info'>
				<div>Website:</div>
				<a href={representative.website} target="_blank">{representative.website}</a>
			</div>
		<div className='rep-info'>
				<div>Twitter:</div>
				<a href={'https://www.twitter.com/@' + representative.person.twitterid} target="_blank">@{representative.person.twitterid}</a>
		</div>
		<div className='rep-info'>
				<div>Email:</div>
				<a href={representative.extra.contact_form}>Contact Form</a>
		</div>
	</div>
)

export default RepresentativeDetails