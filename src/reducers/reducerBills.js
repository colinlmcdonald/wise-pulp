import { GET_ROLE_BILLS, SENATE_BILL_DATA, HOUSE_BILL_DATA, YES_VOTE, NO_VOTE, BILL_VOTE } from '../actions/actionBills'
 
export default function upcomingBills(state = {
  yes: null,
  no: null
}, action) {
  switch (action.type) {
    case SENATE_BILL_DATA:
      return Object.assign({}, state, {
        senate: action.bill
      })
    case HOUSE_BILL_DATA:
      return Object.assign({}, state, {
        house: action.bill
      })
    case GET_ROLE_BILLS:
      return Object.assign({}, state, {
        congress: action.bill
      })
    case YES_VOTE:
      return Object.assign({}, state, {
        yes: action.payload,
        no: null
      })
    case NO_VOTE:
      return Object.assign({}, state, {
        no: action.payload,
        yes: null
      })
    case BILL_VOTE:
      return Object.assign({}, state, {
        bill: action.bill,
        vote: action.vote
      })
    default:
      return state
  }
}