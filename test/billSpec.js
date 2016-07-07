import nock                         from 'nock'
import configureMockStore           from 'redux-mock-store'
import thunk                        from 'redux-thunk'
import { expect }                   from 'chai'
import deepFreeze                   from 'deep-freeze'
import sinon                        from 'sinon'
import React                        from 'react'
import { shallow, mount }           from 'enzyme'

import * as actions                 from '../src/actions/actionBills'
import { USER_LOGIN_SUCCESS }       from '../src/actions/actionLogin'
import bills                        from '../src/reducers/reducerBills'
import ConnectedUpcomingRepBills, { UpcomingRepBills } from '../src/components/Bills/UpcomingRepBills'
import * as BillList                from '../src/components/Bills/BillList'
import * as Spinner                 from '../src/components/Spinner/Spinner'
import * as Bill                    from '../src/components/Bills/Bill'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

const dummyData = [{_id: 1234567}, {_id: 12345}, {_id: 1234}, {_id: 123456}]
const dummyRepData = [{id: 1234567}, {id: 12345}, {id: 1234}, {id: 123456}]
const bill = {_id: 123456}

deepFreeze(bill)
deepFreeze(dummyData)
let getItem, setItem

describe('User Voting', () => {
  beforeEach(() => {
    getItem = sinon.stub(actions.localStorage, 'getItem', prop => {
      if (prop === 'token') {
        return 'blahblahblah'
      } else {
        return dummyData
      }
    })
    setItem = sinon.stub(actions.localStorage, 'setItem')
  })

  afterEach(() => {
    getItem.restore()
    setItem.restore()
    nock.cleanAll()
  })

  it('creates BILL_VOTE when posting a bill vote is done', () => {
    nock('https://localhost:3500', {
      reqheaders: {
        'Content-Type': 'application/json',
        'Authorization': 'blahblahblah'
      }
    })
      .post('/userOpinions', JSON.stringify({
        billNumber: 123456,
        opinion: true
      }))
      .reply(200, {_id: 123456, decision: true})

    const expectedActions = [{ type: actions.BILL_VOTE, payload: {_id: 123456, voted: true}}]

    const store = mockStore({ bills: [] })

    return store.dispatch(actions.userVotes({_id: 123456}, true, 'test', true))
      .then(() => {
        expect(store.getActions()).to.deep.equal(expectedActions)
      })
  })

  it('should update localStorage with users votes', done => {
    const userBill = {_id: 123456, decision: true}
    nock('https://localhost:3500', {
      reqheaders: {
        'Content-Type': 'application/json',
        'Authorization': 'blahblahblah'
      }
    })
    .get('/userOpinions')
    .reply(200, userBill)
    setItem.restore()
    setItem = sinon.spy(actions.localStorage, 'setItem')
    const store = mockStore()
    store.dispatch(actions.updateLocalStorage(true))
      .then(() => {
        expect(setItem.called).to.be.true
        expect(setItem.calledWith('bills', undefined)).to.be.true
        expect(setItem.calledWith('bills', JSON.stringify(userBill))).to.be.true
      })
      .then(done).catch(done)
  })
})

describe('Upcoming Bills', () => {

  beforeEach(() => {
    getItem = sinon.stub(actions.localStorage, 'getItem', prop => {
      if (prop === 'token') {
        return 'blahblahblah'
      } else {
        return 'undefined'
      }
    })
    setItem = sinon.stub(actions.localStorage, 'setItem')
  })

  afterEach(() => {
    getItem.restore()
    setItem.restore()
    nock.cleanAll()
  })

  it('creates BILL_DATA when retrieving house bills is done', () => {
    nock('https://localhost:3500')
      .get('/api/data/house_bills')
      .reply(200, dummyData)
    const expectedActions = [{ type: actions.BILL_DATA, payload: [{_id: 1234567, representative: true}, {_id: 12345, representative: true}, {_id: 1234, representative: true}, {_id: 123456, representative: true}] }]

    const store = mockStore({ bills: [] })

    return store.dispatch(actions.getHouseBillData(true))
      .then(() => {
        expect(store.getActions()).to.deep.equal(expectedActions)
      })
  })

  it('creates BILL_DATA when retrieving senate bills is done', () => {
    nock('https://localhost:3500')
      .get('/api/data/senate_bills')
      .reply(200, dummyData)
    const expectedActions = [{ type: actions.BILL_DATA, payload: [{_id: 1234567, senate: true}, {_id: 12345, senate: true}, {_id: 1234, senate: true}, {_id: 123456, senate: true}] }]

    const store = mockStore({ bills: [] })

    return store.dispatch(actions.getSenateBillData(true))
      .then(() => {
        expect(store.getActions()).to.deep.equal(expectedActions)
      })
  })

  it('should add a type property to each bill and return them if there is nothing in localStorage', () => {
    expect(actions.addBillType(dummyData, 'representative', true)).to.deep.equal([{_id: 1234567, representative: true}, {_id: 12345, representative: true}, {_id: 1234, representative: true}, {_id: 123456, representative: true}])
  })

  it('should add a type property to each bill and update those bills with the voted prop of each bill in localStorage', () => {
    getItem.restore()
    getItem = sinon.stub(actions.localStorage, 'getItem', () => {
      return JSON.stringify([{billNumber: 1234567, representative: true, decision: true}, {billNumber: 1234, representative: true, decision: false}, {billNumber: 123456, representative: true, decision: true}])
    })
    expect(actions.addBillType(dummyData, 'representative', true)).to.deep.equal([{_id: 1234567, representative: true, voted: true}, {_id: 12345, representative: true}, {_id: 1234, representative: true, voted: false}, {_id: 123456, representative: true, voted: true}])
  })
})


describe('Representatives Voting History', () => {

  afterEach(() => {
    nock.cleanAll()
  })

  it('creates REP_VOTING_HISTORY when retrieving a reps voting history is done', () => {
    nock('https://www.govtrack.us')
      .get('/api/v2/vote_voter?order_by=-created&person=123456')
      .reply(200, {objects: dummyRepData})

    const expectedActions = [{ type: actions.REP_VOTING_HISTORY, payload: dummyRepData}]
    const store = mockStore({ repVotes: [] })

    return store.dispatch(actions.getVotingHistory(123456))
      .then(() => {
        expect(store.getActions()).to.deep.equal(expectedActions)
      })
  })
})

describe('Login Checking', () => {
  it('should check that the user is logged in and set the bill to true if so', () => {
    
    const expectedActions = { type: actions.LOGIN_CHECK, payload: {_id: 123456, login: true} }

    expect(actions.loginCheck(true, bill)).to.deep.equal(expectedActions)
  })

  it('should check that the user is logged in and set the bill to false if so', () => {
    const expectedActions = { type: actions.LOGIN_CHECK, payload: {_id: 123456, login: false} }

    expect(actions.loginCheck(false, bill)).to.deep.equal(expectedActions)
  })
})

describe('Bills Reducer', () => {
  it('reducer returns the initial state', () => {
    expect(bills(undefined, {})
      ).to.deep.equal({
        billsToShow: 9,
        yes: null,
        no: null,
        bills: [],
        repVotes: [],
        role: null
      })
  })

  it('should handle SET_REP_ROLE', () => {
    expect(
      bills({role: null}, {
        type: actions.SET_REP_ROLE,
        payload: 'representative'
      })).to.deep.equal({
        role: 'representative'
      })
  })

  it('should handle YES_VOTE', () => {
    expect(
      bills({yes: null, no: null}, 
      {type: actions.YES_VOTE, payload: bill}
      )).to.deep.equal({
        yes: bill,
        no: null
      })
  })

  it('should handle NO_VOTE', () => {
    expect(
      bills({yes: null, no: null}, 
      {type: actions.NO_VOTE, payload: bill}
      )).to.deep.equal({
        yes: null,
        no: bill
      })
  })

  it('should handle BILL_VOTE', () => {
    expect(
      bills({bills: dummyData}, {
        type: actions.BILL_VOTE,
        payload: {
          _id: 123456,
          voted: true
        }
      })).to.deep.equal({bills: [{_id: 1234567}, {_id: 12345}, {_id: 1234}, {_id: 123456, voted: true}] })
  })

  it('should handle BILL_DATA', () => {
    expect(
      bills({bills: []}, {
        type: actions.BILL_DATA,
        payload: dummyData
      })).to.deep.equal({bills: dummyData})
  })

  it('should handle REP_VOTING_HISTORY', () => {
    expect(
      bills({repVotes: []}, {
        type: actions.REP_VOTING_HISTORY,
        payload: dummyRepData
      })).to.deep.equal({repVotes: dummyRepData})
  })

  it('should handle LOGIN_CHECK', () => {
    expect(
      bills({bills: dummyData}, {
        type: actions.LOGIN_CHECK,
        payload: {
          _id: 123456,
          login: true
        }
      })).to.deep.equal({bills: [{_id: 1234567}, {_id: 12345}, {_id: 1234}, {_id: 123456, login: true}] })
  })

  it('should handle ADD_TO_BILLS', () => {
    expect(
      bills({billsToShow: 9}, {type: actions.ADD_TO_BILLS}))
        .to.deep.equal({billsToShow: 19})
  })

  it('should handle USER_LOGIN_SUCCESS', () => {
    expect(
      bills(
        {bills: [{_id: 1234567, login: false}, {_id: 12345, login: true}, {_id: 1234, login: false}, {_id: 123456, login: true}]},
        {type: USER_LOGIN_SUCCESS})
      ).to.deep.equal({bills: [{_id: 1234567, login: true}, {_id: 12345, login: true}, {_id: 1234, login: true}, {_id: 123456, login: true}]})
  })
})

describe('UpcomingRepBills Component', () => {
  function randomNum() {
    return Math.floor(Math.random() * 1000)
  }
  const randomRep = randomNum()
  function mockRepresentatives() {
    return [{person: {
              id: randomRep,
              role_type: 'representative'
              }
            }]
  }
  function mockParams() {
    return {id: randomRep}
  }
  function mockBills() {
    const mockedBills = []
    for (var i = 0; i < 10; i++) {
      mockedBills.push({
        sponsor: 'Clinton',
        billNumber: randomNum,
        billName: 'World Peace',
        fullTextLink: 'www.worldpeace.com',
      })
    }
    return mockedBills
  }
  const bills           = mockBills()
  const representatives = mockRepresentatives()
  const params          = mockParams()
  let SpinnerStub, BillListStub

  let dispatch = sinon.spy()
  sinon.spy(UpcomingRepBills.prototype, 'componentWillMount')
  let getRoleBills = sinon.spy(actions, 'getRoleBills')
  let wrapper           = shallow(<UpcomingRepBills params={params} dispatch={dispatch} representatives={representatives} bills={mockBills()} />)


  beforeEach(() => {
    SpinnerStub = sinon.stub(Spinner, 'default')
    BillListStub = sinon.stub(BillList, 'BillList')
    
  })
  
  afterEach(() => {
    SpinnerStub.restore()
    BillListStub.restore()
  })

  it('grabs the representative role type from the router on comopnentWillMount', () => {
    expect(UpcomingRepBills.prototype.componentWillMount.calledOnce).to.be.true
    expect(getRoleBills.calledWith(representatives.role_type)).to.be.true
    getRoleBills.restore()
  })

  it('shows a Spinner when there are no bills', () => {
    expect(BillListStub).to.not.have.been.called
    expect(SpinnerStub).to.have.been.calledOnce
  })

  it('shows the BillList when there are bills', () => {
    expect(SpinnerStub).to.not.have.been.called
    expect(BillListStub).to.have.been.calledOnce
  })
})

describe('BillList and Bills components', () => {
  function randomNum() {
    return Math.floor(Math.random() * 1000)
  }
  function mockBills() {
    const mockedBills = []
    for (var i = 0; i < 5; i++) {
      mockedBills.push({
        sponsor: 'Clinton',
        billNumber: randomNum,
        billName: 'World Peace',
        fullTextLink: 'www.worldpeace.com',
        representative: true
      })
    }
    for (var i = 0; i < 5; i++) {
      mockedBills.push({
        sponsor: 'Clinton',
        billNumber: randomNum,
        billName: 'World Peace',
        fullTextLink: 'www.worldpeace.com',
        senate: true
      })
    }
    return mockedBills
  }
  const bills = mockBills()
  let role = 'representative'
  let dispatch = sinon.spy()
  let wrapper = mount(<BillList.BillList role={role} dispatch={dispatch} bills={bills} billsToShow={10}/>)

  it('if a role is specified, displays Bills for that type', () => {
    let children = wrapper.children()
    let newChildren = children.filterWhere(node => {
      if(node.props('bill').bill) {
        return node.props('bill').bill.representative === true
      }
    })
    expect(newChildren).to.have.length(5)
  })

  it('if no role is specified, displays all Upcoming Bills', () => {
    wrapper = mount(<BillList.BillList dispatch={dispatch} bills={bills} billsToShow={10}/>)
    let children = wrapper.children()
    let newChildren = children.filterWhere(node => node.props('bill').type === undefined)
    expect(newChildren).to.have.length(10)
  })

  it('dispatches an update of the Yes vote when Yes is clicked on for that bill', () => {
    console.log(wrapper.filterWhere(node => node.props('key') === 0))
  })

  it('dispatches an update of the No vote when No is clicked on for that bill', () => {

  })

  it('displays an error message if the user is not logged in when they try to vote', () => {

  })

  it('votes on a bill when a user is logged in', () => {

  })
})
