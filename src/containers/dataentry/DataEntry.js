import React, {createRef, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {useParams, useHistory} from "react-router-dom";

import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid';
import {Transactions} from "./Transactions";
import {Categories} from "./Categories";
import {CategoryBarchart} from "./CategoryBarchart";


const DataEntrySection = styled.section`  
  padding-top: 3rem;
  padding-left: 4rem;`;

const ContentDiv = styled.div`
    display: flex;
`;

const HelpContainer = styled.aside`  
    position: absolute;
    background: white;
    border: 2px solid black;
    z-index: 2;
    ol {
        list-style-type: none;
        li {
            padding: 1rem 2rem 1rem 2rem;
        }
     }
`;

const classes = array => array.filter(i => i != null).reduce((a, b) => a + ' ' + b)

const round = n => Math.round((n + Number.EPSILON) * 100) / 100

const loadTransactions = (year, month) => fetch(`http://localhost:8080/transaction/${year}/${month}`)
    .then(response => response.json())
    .then(json => json.transactions.map(t =>
    { return {
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
    }}))

const loadCurrentMonth = (year, month) => fetch(`http://localhost:8080/month/${year}/${month}`)
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

const dataEntryKeys = new RegExp("^[a-zA-Z0-9! \b]$");
const focusRef1d = (refArray, i) => refArray && refArray[i] && refArray[i].current && refArray[i].current.focus()
const createRefs1d = (existingArray, n) => Array(n).fill(null).map((_, i) => existingArray[i] || createRef())


const passesFilter = (t, filter) =>  {
    const filterKeys = Object.keys(filter).filter(k => !k.startsWith('--'))
    return filterKeys.length === 0  ||
        filterKeys.map(k => { return { f: k, v: filter[k].toLowerCase()}})
        .filter(pair => t[pair.f] && ('' + t[pair.f]).toLowerCase().includes(pair.v))
        .length  === filterKeys.length
}

export const DataEntry = styled(({className, onChangeHeaderInfo}) => {
    const routeParams = useParams()
    const history = useHistory();
    const [changeCategoryFor, setChangeCategoryFor] = useState(null)
    const [monthData, setMonthData] = useState()
    const [categories, setCategories] = useState([])
    const [transactions, setTransactions] = useState([])
    const [filteredTransactions, setFilteredTransactions] = useState([])
    const [currentMonth, setCurrentMonth] = useState({ month: parseInt(routeParams.month), year: parseInt(routeParams.year)})
    const [showChart, setShowChart] = useState(false)
    const [showHelp, setShowHelp] = useState(false)
    const [filter, setFilter] = useState({})
    const dayFilterRef = useRef()
    const descriptionFilterRef = useRef()
    const categoryFilterRef = useRef()
    const amountFilterRef = useRef()

    useEffect(() => {
        return history.listen(location => {
            if (location.pathname.startsWith('/transactions')) {
                const results = location.pathname.match(/\/transactions\/(.+)\/(.+)/)
                if (results.length === 3) {
                    setCurrentMonth({month: parseInt(results[2]), year: parseInt(results[1])})
                }
            }
        })
    },[history])

    useEffect(() => {
        if (transactions.length === 0) {
            descriptionFilterRef.current && descriptionFilterRef.current.focus()
        }
    },[transactions.length])
    useEffect(() => {
        if (showChart) {
            if (filterSource()[1] === 'day')
                dayFilterRef.current && dayFilterRef.current.focus()
            else if (filterSource()[1] === 'description')
                descriptionFilterRef.current && descriptionFilterRef.current.focus()
            else if (filterSource()[1] === 'category')
                categoryFilterRef.current && categoryFilterRef.current.focus()
            else if (filterSource()[1] === 'amount')
                amountFilterRef.current && amountFilterRef.current.focus()
            else descriptionFilterRef.current && descriptionFilterRef.current.focus()
        }
    },[showChart])



    useEffect(() => {
        fetch(loadCurrentMonth(currentMonth.year, currentMonth.month))
            .then(json => setMonthData(json))
        fetch('http://localhost:8080/categories')
            .then(response => response.json())
            .then(json => setCategories(json.categories.sort((a, b) => a.name.localeCompare( b.name))))
            .then(_ => loadTransactions(currentMonth.year, currentMonth.month))
            .then(t => setTransactions(t))
    }, [])

    useEffect(() => {
        setFilteredTransactions(transactions.filter(t => passesFilter(t, filter)))
    },[transactions, filter])


    useEffect(() => {
        onChangeHeaderInfo(<>
            <span>{toMonthName(currentMonth.month)} {currentMonth.year}</span>
        </>)
        loadTransactions(currentMonth.year, currentMonth.month).then(t => setTransactions(t))
        loadCurrentMonth(currentMonth.year, currentMonth.month).then(m => setMonthData(m))
    }, [currentMonth])


    useEffect(() => {
        if (filteredTransactions) {
            setCategories((categories.map(c => {
                const newTotal = filteredTransactions.filter(t => t.category === c.name).map(t => t.amount).reduce((total, v) => total + v, 0)
                return c.total === newTotal ? c : {
                    id: c.id,
                    name: c.name,
                    total: newTotal
                }})))
        }

        if (filteredTransactions.length === 0 && filter['--source'] && !changeCategoryFor) {
            const x = getFilterRef(filter['--source'].split('_')[1]); x && x.current && x.current.focus()
        }
        else if (filteredTransactions.length === 0 && !filter['--source']) {
            const x = getFilterRef('description'); x && x.current && x.current.focus()
        }
    }, [filteredTransactions, changeCategoryFor])

    const getFilterRef = source => {
        if (source === 'day') return dayFilterRef
        if (source === 'description') return descriptionFilterRef
        if (source === 'category') return categoryFilterRef
        if (source === 'amount') return amountFilterRef
    }

    const updateFilter = (field, value, source) => {
        const x = {...filter }
        if (field && value) x[field] = value
        if (field && !value) delete x[field]
        if (!field) Object.keys(x).filter(k => !k.startsWith('--')).forEach(k => delete x[k])
        if (source) x['--source'] = source
        setFilter(x)
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
    const deleteTransaction = transactionUuid => setTransactions(transactions.filter(t => t.uuid != transactionUuid))

    const filterSource = () => (filter['--source'] && filter['--source'].split('_')) || [null, null]

    const onKeyDownForFilter = field => e => {
        if (e.key === 'Escape') updateFilter(null, null)

        if (filterSource()[1] && filterSource()[1] !== field) return
        if (e.key === 'Backspace' && filter[field] && filter[field].length > 1 ) {
                updateFilter(field, filter[field].substring(0, filter[field].length - 1))
        }
        else if (e.key === 'Backspace' && filter[field] && filter[field].length > 0 ) {
            updateFilter(field, null)
        }
        if (dataEntryKeys.test(e.key)) {
            if (filter[field]) {
                updateFilter(field, filter[field] + e.key)
            }
            else {
                updateFilter(field, e.key)
            }
        }
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
    const updateTransaction = (t, field,value) => {
        console.log("UT ", t, field, value)
        const newT = {...t}
        newT[field] = value
        setTransactions(transactions.map(x => x.uuid === newT.uuid ? newT : x))
    }

    const saveTransaction = (t_uuid) => {
        const t = transactions.find(t => t.uuid === t_uuid)
        console.log(t)
        if (t) {
            fetch(`http://localhost:8080/transaction`, {
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

    const onKeyDownCapture = e => {
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
        if (e.key ==='Escape' && showHelp) {
            setShowHelp(false)
            e.preventDefault()
            e.stopPropagation()
        }
    }

    const onKeyDownBubble = e => {
        if (e.key === 'End') {
            setNextMonth()
            e.preventDefault()
        }
        if (e.key === 'Home') {
            setPrevMonth()
            e.preventDefault()
        }
    }

    const renderFilter = () => {

    const causedEmptyTable = field => filteredTransactions.length === 0 && filterSource()[1] === field
    const causedEmptyTableOrNoData = field => causedEmptyTable(field) || transactions.length === 0

    return <header className='dataentry'>
            <table>
                <tr>
                    <th>Day</th>
                    <td className='day'>
                        <input ref={dayFilterRef}
                               readOnly={true}
                               disabled={!showChart && !causedEmptyTableOrNoData('day')}
                               value={filter.day || '' }
                               onKeyDown={onKeyDownForFilter('day')}
                               maxLength={1}/>
                    </td>
                </tr>
                <tr>
                    <th>Description</th>
                    <td className='description'>
                        <input ref={descriptionFilterRef}
                               readOnly={true}
                               disabled={!showChart && !causedEmptyTableOrNoData('description')}
                               value={filter.description || '' }
                               onKeyDown={onKeyDownForFilter('description')}
                               maxLength={1}/>
                    </td>
                </tr>
                <tr>
                    <th>Category</th>
                    <td className='category'>
                        <input ref={categoryFilterRef}
                               readOnly={true}
                               disabled={!showChart && !causedEmptyTable('category')}
                               value={filter.category || '' }
                               onKeyDown={onKeyDownForFilter('category')}
                               maxLength={1}/>
                    </td>
                </tr>
                <tr>
                    <th>Amount</th>
                    <td className='amount'>
                        <input ref={amountFilterRef}
                               readOnly={true}
                               disabled={!showChart && !causedEmptyTable('amount')}
                               value={filter.amount || '' }
                               onKeyDown={onKeyDownForFilter('amount')}
                               maxLength={1}/>
                    </td>
                </tr>
            </table>
        </header>
    }

    return (
        <DataEntrySection className={className} onKeyDownCapture={onKeyDownCapture} onKeyDown={onKeyDownBubble}>
            {showHelp &&
            <HelpContainer className={className}>
                <h2>HELP</h2>
                <ol>
                    <li>Navigation: ←, ↑, →, ↓, PageUp,PageDown</li>
                    <li>Prev/Next month:  Home/End</li>
                    <li>Insert Transaction:  Insert</li>
                    <li>Delete Transaction:  Delete + Enter</li>
                    <li>Toggle Graph:  CTRL G</li>
                </ol>
            </HelpContainer>}
            { showChart ? (<>
                { renderFilter()}
                <CategoryBarchart data={categories
                    .filter(c => c.total !== 0)}/>
            </>) : (
            <ContentDiv>
                { (transactions.length === 0 || Object.keys(filter).filter( k => !k.startsWith('--')).length > 0) && renderFilter() }

                <Transactions {...{
                    filter,
                    updateFilter,
                    transactions: filteredTransactions,
                    changeCategoryFor, setChangeCategoryFor,
                    updateTransaction,
                    deleteTransaction,
                    addTransaction,
                    saveTransaction}}/>
                <Categories {...{categories,  changeCategoryFor, categoryChanged, getTransaction, quitCategoryMode}}/>
            </ContentDiv>) }
            <footer>
                <dl>
                    <dt>Month Start</dt>
                    <dd>{monthData && round(monthData.startingBalance)}</dd>
                    <dt>Month End</dt>
                    <dd>{monthData && round(transactions.map(t => t.amount).reduce((a, b) => a + b, monthData.startingBalance))}</dd>
                </dl>
            </footer>
        </DataEntrySection> )
})`
 header.dataentry {
     position: absolute;
     left: 4rem;
     top: 4rem;
     display: block;
     border: 1px solid black;
     background: #ffffff;
     z-index: 2;
     
     th {
       padding-top: 0.3rem;
       width: 3rem;
       font-weight: normal;
       padding-right: 2rem;
     }
     
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
