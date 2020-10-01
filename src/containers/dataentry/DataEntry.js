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
        day: t.date.substring(8,10),
        comment: t.comment,
        category: t.category,
        amount: t.amount
    }}))

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

export const DataEntry = ({onChangeHeaderInfo}) => {
    const [changeCategoryFor, setChangeCategoryFor] = useState(null)
    const [categories, setCategories] = useState([])
    const [transactions, setTransactions] = useState([])
    const [currentMonth, setCurrentMonth] = useState({ month: 1, year: 2019})
    const [showChart, setShowChart] = useState(false)
    const [filter, setFilter] = useState({})
    const [filterChart, setFilterChart] = useState(null)

    const updateFilter = (field, value) => setFilter({...filter, field: value})

    const setNextMonth = () => {
        if (currentMonth.month === 12) setCurrentMonth({year: currentMonth.year + 1, month: 1})
        else setCurrentMonth({year: currentMonth.year, month: currentMonth.month + 1})
    }
    const setPrevMonth = () => {
        if (currentMonth.month === 1) setCurrentMonth({year: currentMonth.year - 1, month: 12})
        else setCurrentMonth({year: currentMonth.year, month: currentMonth.month - 1})
    }

    useEffect(() => {
        fetch('http://localhost:8080/categories')
            .then(response => response.json())
            .then(json => setCategories(json.categories.sort((a, b) => a.name.localeCompare( b.name))))
            .then(_ => loadTransactions(2019, 1))
            .then(t => setTransactions(t))
    }, [])

    useEffect(() => {
        onChangeHeaderInfo(<>
            <button onClick={() => setPrevMonth()}>PREV</button>
            <span>{toMonthName(currentMonth.month)} {currentMonth.year}</span>
            <button onClick={_ => setNextMonth()}>NEXT</button>
        </>)
        loadTransactions(currentMonth.year, currentMonth.month).then(t => setTransactions(t))
    }, [currentMonth])


    useEffect(() => {
        if (transactions) {
            setCategories((categories.map(c => {
                return {
                    id: c.id,
                    name: c.name,
                    total: transactions.filter(t => t.category === c.name).map(t => t.amount).reduce((total, v) => total + v, 0)
                }})))
        }
    }, [transactions])

    const categoryChanged = cat => {
        transactions.filter(t => t.uuid === changeCategoryFor).forEach(t => t.category = cat)
        setChangeCategoryFor(null)
    }
    const quitCategoryMode = _ => {
        setChangeCategoryFor(null)
    }
    const getTransaction = uuid => transactions.find(t => t.uuid === uuid)
    const updateTransaction = (t, field,value) => {
        console.log('update T ', t, field, value)
        const newT = {...t}
        newT[field] = value
        console.log(newT)
        setTransactions(transactions.map(x => x.uuid === newT.uuid ? newT : x))
    }

    const onKeyDown = e => {
        console.log('TOP KEYDOWN', e.getModifierState('Shift'), e.key)
        if (e.key === 'Home') {
            setPrevMonth()
            e.preventDefault()
        }
        if (e.key === 'End') {
            setNextMonth()
            e.preventDefault()
        }
        if (e.key === 'F1') {
            setShowChart(true)
            e.preventDefault()
        }
        if (e.key === 'Escape' && showChart) {
            setShowChart(false)
            e.preventDefault()
        }
    }

    return (
        <DataEntrySection onKeyDown={onKeyDown}>
            { showChart ? <>
                <input name='chartCategories' autoFocus={true} value={filterChart} onChange={e => setFilterChart(e.target.value)}/>
                <Barchart data={categories
                    .filter(c => c.total !== 0)
                    .filter(c => !filterChart || c.name.toLowerCase().includes(filterChart.toLowerCase()))}/>
            </>: (
            <ContentDiv>
                <Transactions {...{transactions, changeCategoryFor, setChangeCategoryFor, updateTransaction}}/>
                <Categories {...{categories,  changeCategoryFor, categoryChanged, getTransaction, quitCategoryMode}}/>
            </ContentDiv>) }
        </DataEntrySection>)
}





