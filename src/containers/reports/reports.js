import React, {useEffect, useState} from "react";

import {BalanceReport} from "./BalanceReport";
import {CategoriesReport} from "./CategoriesReport";
import styled from "styled-components";
import {NavLink, Route, Switch} from "react-router-dom";
import {YearReport} from "./YearReport";

const ReportsContainer = styled.div`
    display: flex;
`

const ReportsContent = styled.div`
 padding-left: 2rem;
 flex-grow: 2;
`

const ReportsNav = styled.div`
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


export const Reports = props => {

    const [years, setYears] = useState(null)

    useEffect(() =>{
        loadData()
    }, [])

    const loadData = () => {
        var url = 'http://localhost:8080/api/years'
        return fetch(url)
            .then(response => response.json())
            .then(json => setYears(json.years))
    }

    return (
    <ReportsContainer>
        <ReportsNav>
            <ol>
                <li><NavLink activeClassName='navActive' to='/reports/timeline'>Overview</NavLink></li>
               { years && years.map(y => <li key={y}><NavLink activeClassName='navActive' to={`/reports/year/${y}`}>{y}</NavLink></li>) }
            </ol>
        </ReportsNav>
        <ReportsContent>
            <Switch>
                <Route key='1' path='/reports/year/:year'>
                    <YearReport/>
                </Route>
                <Route key='1' path='/reports'>
                    <BalanceReport/>
                    <CategoriesReport/>
                </Route>
            </Switch>
        </ReportsContent>
   </ReportsContainer>)
}
