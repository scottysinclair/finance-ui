import styled from "styled-components";
import React, {createRef, useEffect, useRef, useState} from "react";

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

const classes = array => array.filter(i => i != null).reduce((a, b) => a + ' ' + b)
const round = n => Math.round((n + Number.EPSILON) * 100) / 100
const dataEntryKeys = new RegExp("^[a-zA-Z0-9! \b]$");
const createRefs1d = (existingArray, n) => Array(n).fill(null).map((_, i) => existingArray[i] || createRef())
const focusRef1d = (refArray, i) => refArray && refArray[i] && refArray[i].current && refArray[i].current.focus()


export const Transactions = styled(({className, filter, updateFilter, transactions, changeCategoryFor, setChangeCategoryFor, updateTransaction}) => {
    const [dateRefs, setDateRefs] = useState([]);
    const [commentRefs, setCommentRefs] = useState([]);
    const [categoryRefs, setCategoryRefs] = useState([]);
    const [amountRefs, setAmountRefs] = useState([]);
    const [activeCell, setActiveCell] = useState(null);
    const prev = usePrevious({changeCategoryFor, activeCell, filter});

    const focusField = (field, i) => {
        if (field === 'day' && dateRefs[i] && dateRefs[i].current) dateRefs[i].current.focus()
        if (field === 'comment' && commentRefs[i] && commentRefs[i].current) commentRefs[i].current.focus()
        if (field === 'category' && categoryRefs[i] && categoryRefs[i].current) categoryRefs[i].current.focus()
        if (field === 'amount' && amountRefs[i] && amountRefs[i].current) amountRefs[i].current.focus()
    }

    useEffect(() => {
        console.log('TRANS MOUNT')
    }, [])

    useEffect(() => {
        console.log('BUILDING REFS')
        setDateRefs( createRefs1d(dateRefs, transactions.length));
        setCommentRefs( createRefs1d(commentRefs, transactions.length));
        setCategoryRefs( createRefs1d(categoryRefs, transactions.length));
        setAmountRefs( createRefs1d(amountRefs, transactions.length));
    }, [transactions.length]);

    useEffect(() => {
        if (filter && filter['--source']) {
            const [transaction_uuid, field] = filter['--source'].split('_')
            const index = transactions.findIndex( t => t.uuid === transaction_uuid )
            if (index >= 0) focusField(field, index)
            else if (transactions.length > 0) focusField(field, 0)
        }
    }, [filter, transactions])

    useEffect(() => {
        if (!changeCategoryFor && prev && prev.changeCategoryFor) {
            if (transactions.findIndex(t => t.uuid === prev.changeCategoryFor) >= 0) {
                focusRef1d(categoryRefs, withUuid(prev.changeCategoryFor))
            }
            else {
                focusRef1d(categoryRefs, 0)
            }
        }
    }, [changeCategoryFor])


    const withUuid = id => transactions.findIndex(t => t.uuid === id)

    const onKeyDown = (t, field, refArray, i, leftRefArray, rightRefArray) => {
        return e => {
            console.log('KEYDOWN ', field)
            if (!isActive(t, field)) {
                if (e.key === 'Home' || e.key === 'end') e.preventDefault()
                if (e.key === 'ArrowUp') focusRef1d(refArray, i-1)
                if (e.key === 'PageUp') {
                    focusRef1d(refArray, i-10 > 0 ? i-10 : 0)
                    e.preventDefault()
                }
                if (e.key === 'ArrowDown') focusRef1d(refArray, i+1)
                if (e.key === 'PageDown')  {
                    focusRef1d(refArray, i+10 < refArray.length ? i+10 : refArray.length-1)
                    e.preventDefault()
                }
                if (e.key === 'ArrowLeft') focusRef1d(leftRefArray, i)
                if (e.key === 'ArrowRight') focusRef1d(rightRefArray, i)
                onKeyDownForFilter(field)(e)
            }
            if (e.key === 'Enter' && field !== 'category') {
                if (!isActive(t, field)) setActiveCell({t, field, ref: refArray[i]})
                else setActiveCell(null)
            }
            if (e.key === 'Enter' && field === 'category' && !changeCategoryFor) {
                setChangeCategoryFor(t.uuid)
            }
            if (e.key === 'Escape' && filter.text) updateFilter(field, null)
        }
    }
    const onKeyDownForFilter = (field) => e => {
        if (e.key === 'Backspace' && filter[field] && filter[field].length > 1 ) {
            updateFilter(field, filter[field].substring(0, filter[field].length - 1), e.target.id)
        }
        else if (e.key === 'Backspace' && filter[field] && filter[field].length > 0 ) {
            updateFilter(field, null, e.target.id)
        }
        if (dataEntryKeys.test(e.key)) {
            if (filter[field]) {
                updateFilter(field, filter[field] + e.key, e.target.id)
            }
            else {
                updateFilter(field, e.key, e.target.id)
            }
        }
    }

    const isActive = (t, field) => {
        if (t.id === 3 && field === 'description') {
            if (activeCell) console.log('ISACTIVE ', activeCell.t, activeCell.field, activeCell && activeCell.t === t && activeCell.field === field)
        }
        return activeCell && activeCell.t.uuid === t.uuid && activeCell.field === field
    }

    const categoryCell = (t, i) => {
        return <button id={`${t.uuid}_category`}
                       ref={categoryRefs[i]}
                       className={classes(['category', changeCategoryFor === t.uuid ? 'changeCategoryFor' : null])}
                       onKeyDown={onKeyDown(t, 'category', categoryRefs, i, commentRefs, amountRefs)}
                       disabled={changeCategoryFor != null}
                       onClick={e => e.preventDefault()}>{t.category}</button>
    }


    const inputCell = (t, field, myRefs, i, value, {rightRefs, leftRefs}, other) =>
        <input key={`${t.uuid}_${field}`}
               ref={myRefs[i]}
               id={`${t.uuid}_${field}`}
               className={classes([field, isActive(t, field) ? 'active' : null])}
               onKeyDown={onKeyDown(t, field, myRefs, i, leftRefs, rightRefs)}
               readOnly={!isActive(t, field)}
               disabled={changeCategoryFor != null}
               type='text'
               autoFocus={i === 0 && field === 'comment' ? true : false}
               value={value ? value : ''}
               onChange={e => updateTransaction(t, field, e.target.value)}
               {...other  }/>

    const totalPlus = transactions.map(t => t.amount || 0).filter(a => a > 0).reduce((a, b) => a + b, 0)
    const totalMinus = transactions.map(t => t.amount || 0).filter(a => a < 0).reduce((a, b) => a + b, 0)
    const totalAmount = transactions.map(t => t.amount || 0).reduce((a, b) => a + b, 0)

    return <div className={className}>
        <div className='tableContainer'>
            { transactions.length > 0 &&
            <table>
                <thead>
                <tr>
                    <th key='day-header'>Day</th>
                    <th key='comment-header'>Comment</th>
                    <th key='category-header'>Category</th>
                    <th key='amount-header'>Amount</th>
                </tr>
                </thead>
                <tbody>
                {   transactions
                    .map((t,i) => (<tr key={t.uuid}>
                        <td key='day'>
                            {inputCell(t, 'day', dateRefs, i, t.day, {rightRefs: commentRefs}, {maxLength: 2}) }
                        </td>
                        <td key='comment'>
                            {inputCell(t, 'comment', commentRefs, i, t.comment, {leftRefs: dateRefs, rightRefs: categoryRefs}) }
                        </td>
                        <td key='category'>
                            {categoryCell(t, i)}
                        </td>
                        <td key='amount'>
                            {inputCell(t, 'amount', amountRefs, i, t.amount, {leftRefs: categoryRefs}) }
                        </td>
                    </tr>)) }
                </tbody>
            </table> }
        </div>
        <dl>
            <dt>Income</dt>
            <dd>{round(totalPlus)}</dd>
            <dt>Expenses</dt>
            <dd>{round(totalMinus)}</dd>
            <dt>Delta</dt>
            <dd>{round(totalAmount)}</dd>
        </dl>
    </div>})`
    
  position: relative;

    div.tableContainer {
        overflow-y: auto; 
        max-height: 515px;      
    }
    
   th, td {
      text-align: left;
      border: 1px solid #ccc;
      font-weight: normal;
    }
    th {
      position: sticky; top: 0;
      z-index: 1;      
      background: #ffffff;
      padding-top: 0.3rem;
      padding-bottom: 0.3rem;
    }
            
   input {
      display: inline-block;
      height: 1.4rem;
      padding: 0.25rem;
      border: none;
   }
   input:focus {
       outline: 2px solid black;
   }
   input.active {
       outline: 2px solid blue;
   }
   input.day {
     width: 3rem;
   }
   input.comment {
     width: 30rem;
   }
   input.amount {
     width: 4rem;
   }
   button {
    border: none;
    width: 100%;
    height: 100%;
    padding: 0.25rem;
    background-color: transparent;
   }
   button.category {
     width: 10rem;
   }
   button:disabled {
    background-color: #fafafa;
   }   
   
   button.changeCategoryFor {
      background-color: white;
      outline: 2px solid blue;
   }
   
   dt {
     display: inline-block;
   }
   dt::after {
     content: ':';
   }
   dd {
     display: inline-block;
     margin-left: 0.3rem;
     margin-right: 3rem;
   }
`;
