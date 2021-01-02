import React, {useState} from 'react';
import {BrowserRouter as Router, NavLink, Route, Switch, Redirect} from 'react-router-dom';
import './App.css';
import {DataEntry} from "./containers/dataentry/DataEntry";
import styled from 'styled-components'
import {Reports} from "./containers/reports/reports";
import {Upload} from "./containers/upload/upload";
import {Accounts} from "./containers/accounts/accounts";

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

const StyledMain = styled.main`
`;

function App() {
    const [headerInfo, setHeaderInfo] = useState("")

  return (
    <div className="App">
    <Router>
      <StyledHeader className="App-header">
            <ol>
                <li><NavLink activeClassName='navActive' to="/accounts">Accounts</NavLink></li>
                <li><NavLink activeClassName='navActive' to="/month">Monthly</NavLink></li>
                <li><NavLink activeClassName='navActive' to="/reports">Reports</NavLink></li>
            </ol>
            <h1>{headerInfo}</h1>
      </StyledHeader>
      <StyledMain>
          <Switch>
            <Route exact={true} key="route-1" path='/month'>
              <DataEntry onChangeHeaderInfo={(text) => setHeaderInfo(text)}/>
            </Route>
            <Route exact={false} key="route-2" path='/reports'>
                <Reports/>
            </Route>
            <Route exact={false} key="route-3" path='/accounts'>
                <Accounts/>
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
