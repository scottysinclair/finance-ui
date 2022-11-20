import React, {useState} from 'react';
import {BrowserRouter as Router, NavLink, Route, Switch, Redirect} from 'react-router-dom';
import './App.css';
import {MonthyReport} from "./containers/monthlyreport/MonthyReport";
import styled from 'styled-components'
import {Reports} from "./containers/reports/reports";
import {Upload} from "./containers/upload/upload";
import {Accounts} from "./containers/accounts/accounts";
import {Categories} from "./containers/categories/categories";

const StyledHeader = styled.header`
  display: flex;

  ol {
    display: flex;
    margin: 0;
    list-style-type: none;

    li {
      padding-right: 1rem;
    }

    a {
      text-align: center;
      display: block;
      color: black;
      height: 3rem;
      line-height: 3rem;
      text-decoration: none;
    }

    .navActive {
      background-color: #DCDCDD;
    }
  }

  h1 {
    margin: 0;
    margin-left: 5rem;
  }

  border-bottom: solid black 1px;
`;

const InfoBar = styled.div`
  padding-top: 0.9em;
  margin-left: 10rem;

  //    position: absolute;
  //   right: 30vw;
`;


const StyledMain = styled.main`
`;

function App() {
    const [headerInfo, setHeaderInfo] = useState("")
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    return (
        <div className="App">
            <Router>
                <StyledHeader className="App-header">
                    <ol>
                        <li><NavLink activeClassName='navActive' to="/accounts">Accounts</NavLink></li>
                        <li><NavLink activeClassName='navActive' to="/categories">Categories</NavLink></li>
                        <li><NavLink activeClassName='navActive' to="/transactions">Monthly</NavLink></li>
                        <li><NavLink activeClassName='navActive' to="/reports">Reports</NavLink></li>
                    </ol>
                    <h1>{headerInfo}</h1>
                    <InfoBar>Press CTRL+H for help</InfoBar>
                </StyledHeader>
                <StyledMain>
                    <Switch>
                        <Route exact={true} key="route-1" path='/transactions'>
                            <Redirect to={`/transactions/${currentYear}/${currentMonth}`}/>
                        </Route>
                        <Route exact={true} key="route-1" path='/transactions/:year/:month'>
                            <MonthyReport onChangeHeaderInfo={(text) => setHeaderInfo(text)}/>
                        </Route>
                        <Route exact={false} key="route-2" path='/reports'>
                            <Reports/>
                        </Route>
                        <Route exact={false} key="route-3" path='/accounts'>
                            <Accounts/>
                        </Route>
                        <Route exact={false} key="route-3" path='/categories'>
                            <Categories/>
                        </Route>
                        <Route exact={false} key="route-3" path='/upload'>
                            <Upload/>
                        </Route>
                        <Route>
                            <Redirect to='enterdata'/>
                        </Route>
                    </Switch>
                </StyledMain>
            </Router>
        </div>
    );
}

export default App;
