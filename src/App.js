import React, {useState} from 'react';
import {BrowserRouter as Router, NavLink, Route, Switch, Redirect} from 'react-router-dom';
import './App.css';
import {DataEntry} from "./containers/dataentry/DataEntry";
import styled from 'styled-components'

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
  padding-top: 2rem;
  padding-left: 4rem;
`;

function App() {
    const [headerInfo, setHeaderInfo] = useState("")

  return (
    <div className="App">
    <Router>
      <StyledHeader className="App-header">
            <ol>
                <li><NavLink activeClassName='navActive' to="/enterdata">Enter Data</NavLink></li>
                <li><NavLink activeClassName='navActive' to="/report/monthly">Monthly Report</NavLink></li>
                <li><NavLink activeClassName='navActive' to="/report/yearly">Yearly Report</NavLink></li>
            </ol>
            <h1>{headerInfo}</h1>
      </StyledHeader>
      <StyledMain>
          <Switch>
            <Route exact={true} key="route-1" path='/enterdata'>
              <DataEntry onChangeHeaderInfo={(text) => setHeaderInfo(text)}/>
            </Route>
              <Route exact={true} key="route-2" path='/report/monthly'>
                  <div>TODO: Monthly</div>
              </Route>
              <Route exact={true} key="route-2" path='/report/yearly'>
                  <div>TODO: Yearly</div>
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
