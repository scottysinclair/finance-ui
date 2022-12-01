import React, {useEffect, useReducer, useState} from "react";
import styled from "styled-components";


export const Duplicates2 = styled( ({className})  => {

    const [transactions, setTransactions] = useState(null   )

    const duplicateCheck = (feedId) => fetch(`http://localhost:8080/api/duplicateCheck2`, { method: 'GET' })
        .then(response => response.status === 200 && response.json())
        .then(json => {
            if (json && json.transactions) {
                setTransactions(json.transactions)
            }
        })

    const saveDuplicates = () => fetch(`http://localhost:8080/api/duplicates2/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ transactions: transactions.map(t => {
                return {id: t.id, duplicate: t.duplicate}
            })
        }
        )})
        .then(response => {
            setTransactions(null)
            duplicateCheck()
        })

    const rowStyleFor = transaction => { if (transaction.duplicate) return 'duplicate-row'; else return ''; }

    const suggestDuplicates = () => {
        alert("Duplicates based on:\n  matching transaction date & description & amount\n                   or\n  matching only transaction date & amount for amounts greater than 1000")
        setTransactions(transactions.map((t, i) => {
          t.duplicate = contentDuplicatesPrev(t, i)
          return t
        }))
    }

    const clearDuplicates = () => {
        setTransactions(transactions.map((t, i) => {
            t.duplicate = false
            return t
        }))
    }

    const setDuplicateStatus = (tranId, duplicate) => {
        setTransactions(transactions.map(t =>  {
            if (t.id != tranId) return t
            else {
                t.duplicate = duplicate
                return t;
            }
        }))
    }

    const contentDuplicatesPrev = (trans, i) => {
        if (i == 0) return false;
        if (trans.day != transactions[i-1].day) {
            return false;
        }
        if (trans.amount != transactions[i-1].amount) {
            return false;
        }
        if (trans.description != transactions[i-1].description) {
            if (trans.amount > 1000 || trans.amount < -1000) {
                return true;
            }
            else {
                return false;
            }
        }
        return true;
    }

    useEffect(() => {
        document.title = 'Find Duplicates' ;
        duplicateCheck()
    }, [])

    return (<section className={className}>
        <h2>Find Duplicates</h2>
        <p>Showing all transactions which have the same <u>date</u> and the same <u>amount</u></p>
        { transactions && transactions.length > 0 && <>
            <button name='suggest'onClick={() => suggestDuplicates()}>Suggest</button>
            <button name='clear'onClick={() => clearDuplicates()}>Clear</button>
            <button name='save'onClick={() => saveDuplicates()}>Save</button>
            <table>
                <thead>
                <tr>
                    <th>line</th>
                    <th>content</th>
                    <th>Duplicate</th>
                </tr>
                </thead>
                <tbody>
                { transactions.map((tran, i) => <tr key={`${tran.id}`} className={rowStyleFor(tran)}>
                    <td key={`day`} className={'day'}>{tran.day}.{tran.month + 1}.{tran.year}</td>
                    <td key={`description`} className={'description'}>{tran.description.substring(0, Math.min(150, tran.description.length))}</td>
                    <td key={`amount`} className={'amount'}>{tran.amount}</td>
                    <td key={`choice`} className='radio'>
                        <label>yes
                            <input name={`duplicate-${tran.id}`}
                                   type="radio"
                                   value="yes"
                                   checked={tran.duplicate === true}
                                   onChange={_ =>
                                    setDuplicateStatus(tran.id, true)
                            }/>
                        </label>
                        <label>no
                            <input name={`duplicate-${tran.id}`}
                                   type="radio"
                                   value="no"
                                   checked={tran.duplicate === false}
                                   onChange={_ =>
                                       setDuplicateStatus(tran.id, false)
                            }/>
                        </label>
                    </td>
                </tr>)}
                </tbody>
            </table>
        </> || <p>Loading....</p>}
        </section>)
})`
  
  button {
    margin-left: 20px;
  }


  td {
    cursor: default;
  }
  td.day {
    padding-right: 50px;
  }


  td.amount {
    padding-left: 50px;
  }

  td.radio {
    label {
      padding-left: 10px;
    }
    text-decoration: none;
  }

  .duplicate-row {
    td {
      font-weight: bold;
      text-decoration: line-through;
    }
  }
`;

