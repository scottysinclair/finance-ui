import styled from "styled-components";
import React, {createRef, useEffect, useLayoutEffect, useRef, useState} from "react";

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

const classes = (...array) => array.filter(i => i != null).reduce((a, b) => {
    return a && b ? (a + ' ' + b) : a ? a : b ? b : null;
}, null)
const round = n => Math.round((n + Number.EPSILON) * 100) / 100
const createRefs1d = (existingArray, n) => Array(n).fill(null).map((_, i) => existingArray[i] || createRef())

export const Transactions = styled(({
                                        className,
                                        filter,
                                        updateFilter,
                                        updateSort,
                                        transactions,
                                        changeCategoryFor,
                                        setChangeCategoryFor,
                                        updateTransaction,
                                        addTransaction,
                                        saveTransaction
                                    }) => {
    const [dateRefs, setDateRefs] = useState([]);
    const [descriptionRefs, setDescriptionRefs] = useState([]);
    const [categoryRefs, setCategoryRefs] = useState([]);
    const [amountRefs, setAmountRefs] = useState([]);
    const [activeCell, setActiveCell] = useState(null);
    const prev = usePrevious({changeCategoryFor, activeCell, filter});
    const tableContainerRef = useRef(null);

    const focusRef1d = (refArray, i, options) => {
        if (refArray && refArray[i] && refArray[i].current) {
            if (tableContainerRef.current) {
                tableContainerRef.current.scrollTop = 0
                refArray[i].current.setSelectionRange(0, 0);
                refArray[i].current.focus()
            }
        }
    };

    useEffect(() => {
        setDateRefs(createRefs1d(dateRefs, Math.max(transactions.length, dateRefs.length)));
        setDescriptionRefs(createRefs1d(descriptionRefs, Math.max(transactions.length, descriptionRefs.length)));
        setCategoryRefs(createRefs1d(categoryRefs, Math.max(transactions.length, categoryRefs.length)));
        setAmountRefs(createRefs1d(amountRefs, Math.max(transactions.length, amountRefs.length)));
    }, [transactions.length]);

    useLayoutEffect(() => {
        if (transactions.length > 0) {
            focusField('description', 0)
        }
    }, [transactions.length])


    useEffect(() => {
        if (!changeCategoryFor && prev && prev.changeCategoryFor) {
            saveTransaction(prev.changeCategoryFor)
            if (transactions.findIndex(t => t.uuid === prev.changeCategoryFor) >= 0) {
                focusRef1d(categoryRefs, withUuid(prev.changeCategoryFor))
            } else {
                focusRef1d(categoryRefs, 0)
            }
        }
    }, [changeCategoryFor])

    useEffect(() => {
        if (activeCell && activeCell.commit && activeCell.t) {
            saveTransaction(activeCell.t.uuid)
            setActiveCell(null)
        }
    }, [activeCell])

    const focusField = (field, i) => {
        if (field === 'day' && dateRefs[i] && dateRefs[i].current) {
            dateRefs[i].current.setSelectionRange(0, 0);
            dateRefs[i].current.focus()
        }
        if (field === 'description' && descriptionRefs[i] && descriptionRefs[i].current) {
            descriptionRefs[i].current.setSelectionRange(0, 0);
            descriptionRefs[i].current.focus()
        }
        if (field === 'category' && categoryRefs[i] && categoryRefs[i].current) {
            categoryRefs[i].current.setSelectionRange(0, 0);
            categoryRefs[i].current.focus();
        }
        if (field === 'amount' && amountRefs[i] && amountRefs[i].current) {
            amountRefs[i].current.setSelectionRange(0, 0);
            amountRefs[i].current.focus()
        }
    }


    const withUuid = id => transactions.findIndex(t => t.uuid === id)

    const onKeyDown = (t, field, refArray, i, leftRefArray, rightRefArray) => {
        return e => {
            if (e.ctrlKey && e.key === "s") {
                e.stopPropagation()
                e.preventDefault()
                updateSort(field)
            }
            if (e.ctrlKey) {
                return;
            }
            if (e.key === 'Home' || e.key === 'End')
                if (isActive(t, field)) e.stopPropagation()
                else e.preventDefault()

            if (e.key === 'ArrowUp' && !isActive(t, field)) {
                focusRef1d(refArray, i - 1, {behavior: 'auto', block: 'center', inline: 'center'})
                e.preventDefault()
            }
            if (e.key === 'PageUp' && i > 0) {
                focusRef1d(refArray, i - 10 > 0 ? i - 10 : 0)
                e.preventDefault()
            }
            if (e.key === 'ArrowDown' && !isActive(t, field)) {
                focusRef1d(refArray, i + 1, {alignToTop: false})
                e.preventDefault()
            }
            if (e.key === 'PageDown' && i < refArray.length - 1) {
                focusRef1d(refArray, i + 10 < refArray.length ? i + 10 : refArray.length - 1)
                e.preventDefault()
            }
            if (e.key === 'ArrowLeft' && !isActive(t, field)) {
                focusRef1d(leftRefArray, i)
                e.preventDefault()
            }
            if (e.key === 'ArrowRight' && !isActive(t, field)) {
                focusRef1d(rightRefArray, i)
                e.preventDefault()
            }
            if (e.key === 'Enter') {
                if (field === 'category' && !changeCategoryFor) {
                    setChangeCategoryFor(t.uuid)
                }
            }
            if (e.key === 'Escape') {
                if (filter) updateFilter(e)
                else if (isActive(t, field)) setActiveCell(null)
            }
            if (!isActive(t, field)) onKeyDownForFilter(field)(e)
        }
    }

    const onKeyDownForFilter = () => e => {
        updateFilter(e)
    }

    const isActive = (t, field) => {
        return activeCell && activeCell.t.uuid === t.uuid && activeCell.field === field
    }

    const inputCell = (t, field, myRefs, i, value, {rightRefs, leftRefs}, other) => {
        return <InputCell key={`${t.uuid}_${field}`}
                          ref={myRefs[i]}
                          id={`${t.uuid}_${field}`}
                          isActive={() => isActive(t, field)}
                          className={classes(field, isActive(t, field) ? 'active' : null)}
                          onKeyDown={onKeyDown(t, field, myRefs, i, leftRefs, rightRefs)}
                          readOnly={!isActive(t, field)}
                          disabled={changeCategoryFor != null}
                          type='text'
                          autoFocus={i === 0 && field === 'description' ? true : false}
                          value={value != null ? value : ''}
                          onChange={e => updateTransaction(t, field, e.target.value)}
                          {...other}/>
    }

    const totalPlus = transactions.map(t => t.amount || 0).filter(a => a > 0).reduce((a, b) => a + b, 0)
    const totalMinus = transactions.map(t => t.amount || 0).filter(a => a < 0).reduce((a, b) => a + b, 0)
    const totalAmount = transactions.map(t => t.amount || 0).reduce((a, b) => a + b, 0)

    return <div className={className}>
        <div className='tableContainer' ref={tableContainerRef}>
            {transactions.length > 0 &&
                <table>
                    <thead>
                    <tr>
                        <th key='day-header'>Day</th>
                        <th key='description-header'>Description</th>
                        <th key='category-header'>Category</th>
                        <th key='amount-header'>Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    {transactions
                        .map((t, i) => (<tr key={t.uuid}>
                            <td key='day'>
                                {inputCell(t, 'day', dateRefs, i, t.day, {rightRefs: descriptionRefs}, {maxLength: 2})}
                            </td>
                            <td key='content'>
                                {inputCell(t, 'description', descriptionRefs, i, t.description, {
                                    leftRefs: dateRefs,
                                    rightRefs: categoryRefs
                                })}
                            </td>
                            <td key='category'>
                                {inputCell(t, 'category', categoryRefs, i, t.category, {
                                    leftRefs: descriptionRefs,
                                    rightRefs: amountRefs
                                })}
                            </td>
                            <td key='amount'>
                                {inputCell(t, 'amount', amountRefs, i, t.amount, {leftRefs: categoryRefs})}
                            </td>
                        </tr>))}
                    </tbody>
                </table>}
        </div>
        <dl>
            <dt>Income</dt>
            <dd>{round(totalPlus)}</dd>
            <dt>Expenses</dt>
            <dd>{round(totalMinus)}</dd>
            <dt>Difference</dt>
            <dd>{round(totalAmount)}</dd>
        </dl>
    </div>
})`

  position: relative;
  padding-top: 2rem;

  div.tableContainer {
    overflow-y: auto;
    max-height: 75vh;
  }

  th, td {
    text-align: left;
    border: 1px solid #ccc;
    font-weight: normal;
  }

  th {
    position: sticky;
    top: 0;
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
    width: 2.5rem;
  }

  input.description {
    width: 40rem;
  }

  input.amount {
    width: 4rem;
  }

  button {
    display: inline-block;
    border: none;
    width: 100%;
    height: 1.4rem;
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


const InputCell = React.forwardRef((props, ref) => {

    const {isActive, ...rest} = props
    const [value, setValue] = useState(props.value)

    useEffect(() => {
        setValue(props.value)
    }, [props.value])


    const onKeyDown = e => {
        if (isActive() && e.key === 'Enter') {
            props.onChange(e)
        }
        props.onKeyDown(e)
    }

    return <input ref={ref}
                  type='text'
                  {...rest}
                  value={value != null ? value : ''}
                  onChange={e => setValue(e.target.value)}
                  onKeyDown={onKeyDown}
    />

})