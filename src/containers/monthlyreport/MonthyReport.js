import React, {createRef, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {useParams, useHistory} from "react-router-dom";

import styled from 'styled-components'
import {v4 as uuidv4} from 'uuid';
import {Transactions} from "./Transactions";
import {Categories} from "./Categories";
import {CategoryBarchart} from "./CategoryBarchart";


const DataEntrySection = styled.section`
  padding-top: 1em;
  padding-left: 3em;`;

const ContentDiv = styled.div`
  display: flex;
`;

const HelpContainer = styled.aside`
  position: fixed;
  padding: 1em;
  background: white;
  height: 27em;
  width: 40em;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid black;
  z-index: 2;

  h2 {
    text-align: center;
  }

  ol {
    list-style-type: none;

    li {
      padding: 1rem 2rem 1rem 2rem;
    }
  }
  ol.sublist {
    li {
      padding: 0.5rem 1rem 0.5rem 1rem;
    }
  }
`;

const classes = array => array.filter(i => i != null).reduce((a, b) => a + ' ' + b)

const round = n => Math.round((n + Number.EPSILON) * 100) / 100

const loadTransactions = (year, month) => fetch(`http://localhost:8080/api/transaction/${year}/${month}`)
    .then(response => response.json())
    .then(json => json.transactions.map(t => {
        return {
            id: t.id,
            feed: t.feed,
            uuid: uuidv4(),
            description: t.description,
            account: t.account,
            day: t.day,
            month: t.month,
            year: t.year,
            category: t.category,
            amount: t.amount
        }
    }))

const loadCurrentMonth = (year, month) => fetch(`http://localhost:8080/api/month/${year}/${month}`)
    .then(response => response.ok && response.json())

const toMonthName = month => {
    if (month === 1) return 'January'
    if (month === 2) return 'February'
    if (month === 3) return 'March'
    if (month === 4) return 'April'
    if (month === 5) return 'May'
    if (month === 6) return 'June'
    if (month === 7) return 'July'
    if (month === 8) return 'August'
    if (month === 9) return 'September'
    if (month === 10) return 'October'
    if (month === 11) return 'November'
    if (month === 12) return 'December'
}

const dataEntryKeys = new RegExp("^[a-zA-Z0-9!>< \b,.-]$");

const passesFilter = (t, filter) => {
    if (!filter || filter.length == 0) return true;
    if (filter.startsWith(">")) {
        const number = parseInt( filter.substring(1) )
        return t.amount > number;
    }
    else if (filter.startsWith("<")) {
        const number = parseInt( filter.substring(1) )
        return t.amount < number;
    }
    else {
        for (var key in t) {
            if (t[key] && t[key].toString().toLowerCase().includes(filter.toLowerCase())) {
                return true;
            }
        }
    }
    return false;
}

export const MonthyReport = styled(({className, onChangeHeaderInfo}) => {
    const routeParams = useParams()
    const history = useHistory();
    const [changeCategoryFor, setChangeCategoryFor] = useState(null)
    const [monthData, setMonthData] = useState()
    const [categories, setCategories] = useState([])
    const [transactions, setTransactions] = useState([])
    const [filteredTransactions, setFilteredTransactions] = useState([])
    const [currentMonth, setCurrentMonth] = useState({
        month: parseInt(routeParams.month),
        year: parseInt(routeParams.year)
    })
    const [showChart, setShowChart] = useState(false)
    const [showHelp, setShowHelp] = useState(false)
    const [filter, setFilter] = useState("")
    const filterRef = useRef()

    const onKeyDown = e => {
        if (e.getModifierState('Control') && e.key.toLowerCase() === 'g') {
            setShowChart(!showChart)
            e.preventDefault()
            e.stopPropagation()
        }
        if (e.getModifierState('Control') && e.key.toLowerCase() === 'h') {
            setShowHelp(!showHelp)
            e.preventDefault()
            e.stopPropagation()
        }
        if (e.key === 'Escape') {
            setShowHelp(false)
            setShowChart(false)
        }
        if (e.key === 'End') {
            setNextMonth()
            e.preventDefault()
            e.stopPropagation()
        }
        if (e.key === 'Home') {
            setPrevMonth()
            e.preventDefault()
            e.stopPropagation()
        }
    }

    useEffect(() => {
        window.addEventListener("keydown", onKeyDown)
        return function cleanup() {
            window.removeEventListener("keydown", onKeyDown)
        }
    })

    useEffect(() => {
        return history.listen(location => {
            if (location.pathname.startsWith('/transactions')) {
                const results = location.pathname.match(/\/transactions\/(.+)\/(.+)/)
                if (results.length === 3) {
                    setCurrentMonth({month: parseInt(results[2]), year: parseInt(results[1])})
                }
            }
        })
    }, [history])

    useEffect(() => {
        if (transactions.length === 0) {
            filterRef.current && filterRef.current.focus()
        }
    }, [transactions.length])
    useEffect(() => {
        if (showChart) {
            filterRef.current && filterRef.current.focus()
        }
    }, [showChart])


    useEffect(() => {
        fetch(loadCurrentMonth(currentMonth.year, currentMonth.month))
            .then(json => setMonthData(json))
        fetch('http://localhost:8080/api/categories')
            .then(response => response.json())
            .then(json => setCategories(json.categories.sort((a, b) => a.name.localeCompare(b.name))))
            .then(_ => loadTransactions(currentMonth.year, currentMonth.month))
            .then(t => setTransactions(t))
    }, [])

    useEffect(() => {
        setFilteredTransactions(transactions.filter(t => passesFilter(t, filter)))
    }, [transactions, filter])


    useEffect(() => {
        onChangeHeaderInfo(<>
            <span>{toMonthName(currentMonth.month)} {currentMonth.year}</span>
        </>)
        loadTransactions(currentMonth.year, currentMonth.month).then(t => setTransactions(t))
        loadCurrentMonth(currentMonth.year, currentMonth.month).then(m => setMonthData(m))
    }, [currentMonth])


    useEffect(() => {
        if (filteredTransactions) {
            setCategories(categories.map(c => {
                const trans = filteredTransactions.filter(t => t.category === c.name)
                const newTotal = trans.map(t => t.amount).reduce((total, v) => total + v, 0)
                return c.total === newTotal ? c : {
                    id: c.id,
                    name: c.name,
                    total: newTotal,
                    count: trans.length
                }
            }))
        }
    }, [filteredTransactions, changeCategoryFor])


    useEffect(() => {
        if (filteredTransactions.length == 0) {
            filterRef.current && filterRef.current.focus()
        }
    }, [filteredTransactions])

    const updateFilter = (e) => {
        //console.log("update filter", filter, key)
        if (e.key === 'Escape') {
            setFilter(null)
            return
        }
        if (e.key === 'Backspace') {
            if (filter && filter.length > 1) {
                setFilter(filter.substring(0, filter.length - 1))
            } else {
                setFilter(null)
            }
            return
        }
        if (dataEntryKeys.test(e.key)) {
            if (filter) {
                setFilter(filter + e.key)
            } else {
                setFilter(e.key)
            }
        }
    }

    const addTransaction = i => {
        const t = [...transactions]
        t.splice(i, 0, {
            id: null,
            uuid: uuidv4(),
            account: 'Bank Austria',
            day: null,
            month: currentMonth.month,
            year: currentMonth.year,
            category: null,
            amount: null
        })
        setTransactions(t)
    }

    const setNextMonth = () => {
        let result
        if (currentMonth.month === 12) result = {year: currentMonth.year + 1, month: 1}
        else result = {year: currentMonth.year, month: currentMonth.month + 1}
        setCurrentMonth(result)
        history.push(`/transactions/${result.year}/${result.month}`)
    }
    const setPrevMonth = () => {
        let result
        if (currentMonth.month === 1) result = {year: currentMonth.year - 1, month: 12}
        else result = {year: currentMonth.year, month: currentMonth.month - 1}
        setCurrentMonth(result)
        history.push(`/transactions/${result.year}/${result.month}`)
    }

    const categoryChanged = cat => {
        transactions.filter(t => t.uuid === changeCategoryFor).forEach(t => t.category = cat)
        setChangeCategoryFor(null)
    }
    const quitCategoryMode = _ => {
        setChangeCategoryFor(null)
    }
    const getTransaction = uuid => transactions.find(t => t.uuid === uuid)
    const updateTransaction = (t, field, value) => {
        console.log("UT ", t, field, value)
        const newT = {...t}
        newT[field] = value
        setTransactions(transactions.map(x => x.uuid === newT.uuid ? newT : x))
    }

    const saveTransaction = (t_uuid) => {
        const t = transactions.find(t => t.uuid === t_uuid)
        console.log(t)
        if (t) {
            fetch(`http://localhost:8080/api/transaction`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(t)
            })
                .then(response => response.json())
                .then(savedT => {
                    const result = {...t, ...savedT}
                    setTransactions(transactions.map(x => x.uuid === result.uuid ? result : x))
                })
        }
    }

    const renderFilter = () => {
        return <header className='filter'>
            <label>Filtered <input ref={filterRef}
                                  readOnly={true}
                                  value={filter || ''}
                                 onKeyDown={updateFilter}/>
            </label>
        </header>
    }

    return (
        <DataEntrySection className={className}>
            {showHelp &&
                <HelpContainer className={className}>
                    <h2>HELP</h2>
                    <ol>
                        <li><b>Navigation:</b> ←, ↑, →, ↓, PageUp,PageDown</li>
                        <li><b>Filter Table data:</b> type when a table cell is highlighted
                            <ol className={'sublist'}>
                                <li><b>&gt;</b>&nbsp;&nbsp;filter on transactions with an amount higher than</li>
                                <li><b>&lt;</b>&nbsp;&nbsp;filter on transactions with an amount less than</li>
                            </ol>
                        </li>
                        <li><b>Prev/Next month:</b> Home/End</li>
                        <li><b>Sort Column:</b> CTRL + S</li>
                        <li><b>Toggle Graph:</b> CTRL + G</li>
                    </ol>
                </HelpContainer>}
            {showChart ? (<>
                {renderFilter()}
                <CategoryBarchart data={categories
                    .filter(c => c.total !== 0)}/>
            </>) : (
                <>
                    {(filter != null && filter.length > 0) && renderFilter()}
                    <ContentDiv>
                        <Transactions {...{
                            filter,
                            updateFilter,
                            transactions: filteredTransactions,
                            changeCategoryFor, setChangeCategoryFor,
                            updateTransaction,
                            addTransaction,
                            saveTransaction
                        }}/>
                        <Categories {...{
                            categories,
                            changeCategoryFor,
                            categoryChanged,
                            getTransaction,
                            quitCategoryMode
                        }}/>
                    </ContentDiv>
                    </>)}
            <footer>
                <dl>
                    <dt>Month Start</dt>
                    <dd>{monthData && round(monthData.startingBalance || 0)}</dd>
                    <dt>Month End</dt>
                    <dd>{monthData && round(transactions.map(t => t.amount).reduce((a, b) => a + b, monthData.startingBalance || 0))}</dd>
                </dl>
            </footer>
        </DataEntrySection>)
})`
  header.filter {
    position: absolute;
    display: inline-block;

    input {
      font-size: 1em;
      border: 1px solid black;
      padding-top: 5px;
      padding-left: 5px;
      padding-bottom: 5px;
    }

    background: #ffffff;
    z-index: 2;
  }

  th {
    padding-top: 0.3rem;
    width: 3rem;
    font-weight: normal;
    padding-right: 0;
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

`
