import React, {createRef, useEffect, useLayoutEffect, useRef, useState} from 'react';
import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid';
import FocusTrap from 'focus-trap-react';
import {ResponsiveBar} from "nivo";
import {Transactions} from "./Transactions";
import {Categories} from "./Categories";
import {Barchart} from "./Barchart";


const DataEntrySection = styled.section`  
`;

const ContentDiv = styled.div`
    display: flex;
`;

const classes = array => array.filter(i => i != null).reduce((a, b) => a + ' ' + b)

const round = n => Math.round((n + Number.EPSILON) * 100) / 100

const loadTransactions = (year, month) => fetch(`http://localhost:8080/transactions/${year}/${month}`)
    .then(response => response.json())
    .then(json => json.transactions.map(t =>
    { return {
        id: t.id,
        uuid: uuidv4(),
        fullDate : t.day,
        day: t.dayInMonth,
        comment: t.comment,
        category: t.category,
        amount: t.amount
    }}))

const loadCurrentMonth = (year, month) => fetch(`http://localhost:8080/month/${year}/${month}`)
     .then(response => response.json())

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
        .filter(pair => t[pair.f] && t[pair.f].toLowerCase().includes(pair.v))
        .length  === filterKeys.length
}

export const DataEntry = styled(({className, onChangeHeaderInfo}) => {
    const [changeCategoryFor, setChangeCategoryFor] = useState(null)
    const [monthData, setMonthData] = useState()
    const [categories, setCategories] = useState([])
    const [transactions, setTransactions] = useState([])
    const [filteredTransactions, setFilteredTransactions] = useState([])
    const [currentMonth, setCurrentMonth] = useState({ month: 1, year: 2019})
    const [showChart, setShowChart] = useState(false)
    const [filter, setFilter] = useState({})
    const dayFilterRef = useRef()
    const commentFilterRef = useRef()
    const categoryFilterRef = useRef()
    const amountFilterRef = useRef()

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
    }, [filteredTransactions, changeCategoryFor])

    const getFilterRef = source => {
        if (source === 'day') return dayFilterRef
        if (source === 'comment') return commentFilterRef
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
        if (currentMonth.month === 12) setCurrentMonth({year: currentMonth.year + 1, month: 1})
        else setCurrentMonth({year: currentMonth.year, month: currentMonth.month + 1})
    }
    const setPrevMonth = () => {
        if (currentMonth.month === 1) setCurrentMonth({year: currentMonth.year - 1, month: 12})
        else setCurrentMonth({year: currentMonth.year, month: currentMonth.month - 1})
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
        const newT = {...t}
        newT[field] = value
        setTransactions(transactions.map(x => x.uuid === newT.uuid ? newT : x))
    }

    const onKeyDown = e => {
        if (e.key === 'Home') {
            setPrevMonth()
            e.preventDefault()
        }
        if (e.key === 'End') {
            setNextMonth()
            e.preventDefault()
        }
        if (e.key === 'F2') {
            setShowChart(true)
            e.preventDefault()
        }
        if (e.getModifierState('Control') && e.key.toLowerCase() === 'g') {
            setShowChart(!showChart)
            e.preventDefault()
            e.stopPropagation()
        }
    }

    const renderFilter = (passive) => {
        return <header className='infoHeader'>
            <table>
                <tr>
                    <th className='day'>
                        <input ref={dayFilterRef}
                               readOnly={true}
                               disabled={passive && filterSource()[1] !== 'day'}
                               value={filter.day || '' }
                               onKeyDown={onKeyDownForFilter('day')}
                               maxLength={1}/>
                    </th>
                    <th className='comment'>
                        <input ref={commentFilterRef}
                               readOnly={true}
                               autoFocus={!passive}
                               disabled={passive && filterSource()[1] !== 'comment'}
                               value={filter.comment || '' }
                               onKeyDown={onKeyDownForFilter('comment')}
                               maxLength={1}/>
                    </th>
                    <th className='category'>
                        <input ref={categoryFilterRef}
                               readOnly={true}
                               disabled={passive && filterSource()[1] !== 'category'}
                               value={filter.category || '' }
                               onKeyDown={onKeyDownForFilter('category')}
                               maxLength={1}/>
                    </th>
                    <th className='amount'>
                        <input ref={amountFilterRef}
                               readOnly={true}
                               disabled={passive && filterSource()[1] !== 'amount'}
                               value={filter.amount || '' }
                               onKeyDown={onKeyDownForFilter('amount')}
                               maxLength={1}/>
                    </th>
                </tr>
            </table>
        </header>
    }

    return (
        <DataEntrySection className={className} onKeyDownCapture={onKeyDown}>
            { showChart ? (<>
                { renderFilter(false)}
                <Barchart data={categories
                    .filter(c => c.total !== 0)}/>
            </>) : (
            <ContentDiv>
                { (transactions.length === 0 || Object.keys(filter).filter( k => !k.startsWith('--')).length > 0) && renderFilter(true) }

                <Transactions {...{filter, updateFilter, transactions: filteredTransactions, changeCategoryFor, setChangeCategoryFor, updateTransaction, deleteTransaction}}/>
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
 header {
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
