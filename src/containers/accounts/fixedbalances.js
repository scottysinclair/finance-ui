import React, {useEffect, useState} from "react";
import { v4 as uuidv4 } from 'uuid';

import {useParams} from "react-router-dom";

export const FixedBalances = props => {
    const { accountName } = useParams()
    const [fixedBalances, setFixedBalances] = useState([])
    const [dateInput, setDateInput] = useState(null)
    const [amountInput, setAmountInput] = useState(null)

    useEffect(() => {
        document.title = `${accountName} Fixed Balances` ;
        loadFixedBalances()
    }, [])

    const loadFixedBalances = () => fetch(`http://localhost:8080/api/account/${accountName}/fixedbalance`)
        .then(response => response.ok && response.json())
        .then(json => setFixedBalances(json.balances))

    const saveFixedBalance = () => {
        fetch(`http://localhost:8080/api/account/${accountName}/fixedbalance`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: uuidv4(),
                time: dateInput,
                amount: amountInput
            })})
            .then(response => response.ok && response.json())
            .then(json => setFixedBalances(json.balances))
    }

    return (<div>
        <h2>Fixed Balances</h2>
        Date: <input name='date' type='text' value={dateInput} onChange={e => setDateInput(e.target.value)}/>
        Amount: <input name='amount' type='text' value={amountInput} onChange={e => setAmountInput(e.target.value)}/>
        <button name='save' onClick={_ => saveFixedBalance()}>Add</button>
        <table width='60%'>
            <thead>
            <tr>
                <th key='th0'>Date</th>
                <th key='th1'>Amount</th>
            </tr>
            </thead>
            <tbody>
            { fixedBalances && fixedBalances.map( fb => <tr>
                    <td>{new Date(fb.time).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })} {new Date(fb.time).toLocaleTimeString()}</td>
                    <td>{fb.amount}</td>
                </tr>)}
            </tbody>
        </table>
    </div>)
}