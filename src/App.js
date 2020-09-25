import React from 'react';
import {BrowserRouter as Router, Link, Redirect, Route, Switch} from 'react-router-dom';
import './App.css';
import {DataEntry} from "./containers/dataentry/DataEntry";

function App() {
  return (
    <div className="App">
    <Router>
      <header className="App-header">
            Finance Application V0.1
            <ol>
                <li><Link to="/">Enter Data</Link></li>
                <li><Link to="/report/monthly">Monthly Report</Link></li>
                <li><Link to="/report/yearly">Yearly Report</Link></li>
            </ol>
      </header>
      <main>
          <Switch>
            <Route exact={true} key="route-1" path='/'>
              <DataEntry/>
            </Route>
              <Route exact={true} key="route-2" path='/report/monthly'>
                  <div>TODO: Monthly</div>
              </Route>
              <Route exact={true} key="route-2" path='/report/yearly'>
                  <div>TODO: Yearly</div>
              </Route>
          </Switch>
      </main>
    </Router>
    </div>
  );
}

export default App;
