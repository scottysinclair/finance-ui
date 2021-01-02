import React, {useEffect, useState} from "react";

import styled from "styled-components";
import {NavLink, Route, Switch} from "react-router-dom";
import {Overview} from "./overview";
import {FixedBalances} from "./fixedbalances";
import {Feeds} from "./feeds";

const AccountsContainer = styled.div`
    display: flex;
`

const AccountsContent = styled.div`
 padding-left: 2rem;
 flex-grow: 2;
`

const AccountsNav = styled.div`
 flex-grow: 0;
 padding-left: 2rem;
 ol {
    list-style-type: none;
    padding-left: 0;
 }
 ol > li  ol > li  {
    padding-left: 2rem;
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
`


export const Accounts = props => {

    const [accounts, setAccounts] = useState([])

    useEffect(() =>{
        loadData()
    }, [])

    const loadData = () => {
        var url = 'http://localhost:8080/account'
        return fetch(url)
            .then(response => response.json())
            .then(json => setAccounts(json.accounts))
    }

    return (
        <AccountsContainer>
            <AccountsNav>
                <ol>
                    { accounts && accounts.map(a => <li key={a.name}>
                        <NavLink activeClassName='navActive' to={`/accounts/${a.name}`}>{a.name}</NavLink>
                        <ol>
                            <li><NavLink activeClassName='navActive' to={`/accounts/${a.name}/feeds`}>Feeds</NavLink></li>
                            <li><NavLink activeClassName='navActive' to={`/accounts/${a.name}/fixedbalances`}>FixedBalances</NavLink></li>
                        </ol>
                    </li>) }
                </ol>
            </AccountsNav>
            <AccountsContent>
                <Switch>
                    <Route key='route-2' path='/accounts/:accountName/feeds'>
                        <Feeds/>
                    </Route>
                    <Route key='route-3' path='/accounts/:accountName/fixedbalances'>
                        <FixedBalances/>
                    </Route>
                    <Route key='route-3' path='/accounts/:accountName'>
                        <Overview/>
                    </Route>
                </Switch>
            </AccountsContent>
        </AccountsContainer>)
}
