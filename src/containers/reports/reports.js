import React, {useEffect, useState} from "react";

import {BalanceReport} from "./BalanceReport";
import {CategoriesReport} from "./CategoriesReport";
import styled from "styled-components";
import {NavLink, Route, Switch} from "react-router-dom";
import {YearReport} from "./YearReport";

const ReportsContainer = styled.div`
    display: flex;
`


const ReportsNav = styled.div`
 flex-grow: 0;
 ol {
    list-style-type: none;
    li {
        padding: 1rem 2rem 1rem 2rem;
    } 
 }
`

const ReportsContent = styled.div`
 padding-left: 2rem;
 flex-grow: 2;
`

export const Reports = props => {

    const [years, setYears] = useState(null)

    useEffect(() =>{
        loadData()
    }, [])

    const loadData = () => {
        var url = 'http://localhost:8080/years'
        return fetch(url)
            .then(response => response.json())
            .then(json => setYears(json.years))
    }

    return (
    <ReportsContainer>
        <ReportsNav>
            <ol>
                <li><NavLink to='/reports/timeline'>Timeline</NavLink></li>
                { years && <ol>Year
                    { years.map(y => <li><NavLink to={`/reports/year/${y}`}>{y}</NavLink></li>) }
                </ol> }
            </ol>
        </ReportsNav>
        <ReportsContent>
            <Switch>
                <Route key='1' path='/reports/timeline'>
                    <BalanceReport/>
                    <CategoriesReport/>
                </Route>
                <Route key='1' path='/reports/year/:year'>
                    <YearReport/>
                </Route>
            </Switch>
        </ReportsContent>
   </ReportsContainer>)
}
