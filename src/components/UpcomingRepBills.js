import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getRoleBills, getSenateBillData, getHouseBillData } from '../actions/actionBills';
import BillList from '../components/BillList'
import Spinner from '../components/Spinner'

export default class UpcomingRepBills extends Component {

  voting(bill, val) {
    console.log(bill, val)
  }

  componentDidMount() {
    const { params, representatives, dispatch } = this.props
    representatives.map(function(rep) {
      if (rep.id === JSON.parse(params.id)) {
        dispatch(getRoleBills(rep.role_type))
      }
    }.bind(this))
  }

  render() {
    const { bills } = this.props;
    return (
      <div>
        { bills ? <BillList bills={bills} index={9} voting={this.voting} /> : <div><Spinner /></div> }
      </div>
    )
  }
}


function mapStateToProps(state) {
  const representatives = state.Representatives.representatives
  const bills = state.UpcomingBills.congress
  return {
    representatives,
    bills
  }
}

export default connect(mapStateToProps)(UpcomingRepBills);