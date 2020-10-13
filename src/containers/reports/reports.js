import React, {useEffect, useState} from "react";

import {BalanceReport} from "./BalanceReport";
import {CategoriesReport} from "./CategoriesReport";
import styled from "styled-components";
import {NavLink, Route, Switch} from "react-router-dom";

const ReportsContainer = styled.div`
 padding-left: 5rem;
`

export const Reports = props => {

return (<ReportsContainer>
       <BalanceReport/>
       <CategoriesReport/>
       </ReportsContainer>
            )
}
