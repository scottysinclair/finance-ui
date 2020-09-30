import React, {createRef, useEffect, useRef, useState} from 'react';
import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid';
import FocusTrap from "focus-trap-react";


const DataEntrySection = styled.section`  
`;

const ContentDiv = styled.div`
    display: flex;
`;

const classes = array => array.filter(i => i != null).reduce((a, b) => a + ' ' + b)

export const DataEntry = ({onChangeHeaderInfo}) => {
    onChangeHeaderInfo("January 2020")
    const  [changeCategoryFor, setChangeCategoryFor] = useState(null)
    const [categories, setCategories] = useState([])
    const [transactions, setTransactions] = useState([])
    useEffect(() => {
        fetch('http://localhost:8080/categories')
            .then(response => response.json())
            .then(json => setCategories(json.categories.sort((a, b) => a.name.localeCompare( b.name))))
            .then(_ => fetch('http://localhost:8080/transactions/2019/1'))
            .then(response => response.json())
            .then(json => json.transactions.map(t =>
            { return {
                id: t.id,
                uuid: uuidv4(),
                date: t.date.substring(8,10),
                comment: t.comment,
                category: t.category,
                amount: t.amount
            }}))
            .then(transactions => {
                setTransactions(transactions)
            })
    }, [])

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
        console.log("update T ", t, field, value)
        const newT = {...t}
        newT[field] = value
        console.log(newT)
        setTransactions(transactions.map(x => x.uuid === newT.uuid ? newT : x))
    }
    return (
        <DataEntrySection>
            <ContentDiv>
                <Transactions {...{transactions, changeCategoryFor, setChangeCategoryFor, updateTransaction}}/>
                <Categories {...{categories,  changeCategoryFor, categoryChanged, getTransaction, quitCategoryMode}}/>
            </ContentDiv>
        </DataEntrySection>)
}

const Transactions = styled(({className, transactions, changeCategoryFor, setChangeCategoryFor, updateTransaction}) => {
    const [dateRefs, setDateRefs] = useState([]);
    const [commentRefs, setCommentRefs] = useState([]);
    const [categoryRefs, setCategoryRefs] = useState([]);
    const [amountRefs, setAmountRefs] = useState([]);
    const [focusedField, setFocusedField] =  useState(null)
    const [activeCell, setActiveCell] = useState(null);
    const filterPanelRef = useRef()
    const [filter, setFilter] = useState({});
    const prev = usePrevious({changeCategoryFor, activeCell, filter});

    const focusField = (field, i) => {
        if (field === 'date' && dateRefs[i] && dateRefs[i].current) dateRefs[i].current.focus()
        if (field === 'comment' && commentRefs[i] && commentRefs[i].current) commentRefs[i].current.focus()
        if (field === 'category' && categoryRefs[i] && categoryRefs[i].current) categoryRefs[i].current.focus()
    }

    useEffect(() => {
        console.log("TRANS MOUNT")
    }, [])

    useEffect(() => {
        setDateRefs( createRefs1d(dateRefs, transactions.length));
        setCommentRefs( createRefs1d(commentRefs, transactions.length));
        setCategoryRefs( createRefs1d(dateRefs, transactions.length));
        setAmountRefs( createRefs1d(dateRefs, transactions.length));
    }, [transactions.length]);

    useEffect(() => {
        if (!changeCategoryFor && prev && prev.changeCategoryFor) {
            if (filteredTransactions().findIndex(t => t.uuid === prev.changeCategoryFor) >= 0) {
                focusRef1d(categoryRefs, withUuid(prev.changeCategoryFor))
            }
            else {
                focusRef1d(categoryRefs, 0)
            }
        }
    }, [changeCategoryFor])

    useEffect(() => {
        if (activeCell)
            activeCell.ref && activeCell.ref.current && activeCell.ref.current.focus()
        else
            prev && prev.activeCell && prev.activeCell.ref && prev.activeCell.ref.current && prev.activeCell.ref.current.focus()
    }, [activeCell])

    useEffect(() => {
        if (filter.field) {
            console.log("FILTER")
            const ft = filteredTransactions()
            const index = ft.findIndex(t => t.uuid  === focusedField.t.uuid)
            if (ft.length > 0 && index > -1) focusField(focusedField.field, index)
            if (ft.length > 0 && index === -1) focusField(filter.field, 0)
            if (ft.length === 0 && index === -1 && filterPanelRef.current) filterPanelRef.current.focus()
        }
        else {
            console.log("OUT")
            prev && prev.filter && prev.filter.field && focusField(prev.filter.field, 0)
        }
    }, [filter])


    const filteredTransactions = () => transactions.filter(t => filter.field == null || (t[filter.field] + "").toLowerCase().includes(filter.text.toLowerCase()))

    const withUuid = id => filteredTransactions().findIndex(t => t.uuid === id)

    const onKeyDown = (t, field, refArray, i, leftRefArray, rightRefArray) => {
        return e => {
            if (!isActive(t, field)) {
                if (e.key === "ArrowUp") focusRef1d(refArray, i-1)
                if (e.key === "PageUp") {
                    focusRef1d(refArray, i-10)
                    e.preventDefault()
                }
                if (e.key === "ArrowDown") focusRef1d(refArray, i+1)
                if (e.key === "PageDown")  {
                    focusRef1d(refArray, i+10)
                    e.preventDefault()
                }
                if (e.key === "ArrowLeft") focusRef1d(leftRefArray, i)
                if (e.key === "ArrowRight") focusRef1d(rightRefArray, i)
                onKeyDownForFilter(field)(e)
            }
            if (e.key === 'Enter' && field !== 'category') {
                if (!isActive(t, field)) setActiveCell({t, field, ref: refArray[i]})
                else setActiveCell(null)
            }
            if (e.key === 'Escape' && filter.text) setFilter({})
        }
    }
    const onKeyDownForFilter = (field) => e => {
        if (e.key === 'Backspace' && filter.text && filter.text.length > 1 ) {
            setFilter({field, text: filter.text.substring(0, filter.text.length - 1)})
        }
        else if (e.key === 'Backspace' && filter.text && filter.text.length > 0 ) {
            setFilter({})
        }
        if (e.key >= 'a' && e.key <= 'z') {
            if (filter.field === field) {
                setFilter({ field, text: filter.text + e.key})
            }
            else {
                setFilter({field, text: e.key})
            }
        }
    }

    const isActive = (t, field) => {
        if (t.id === 3 && field === 'description') {
            if (activeCell) console.log("ISACTIVE ", activeCell.t, activeCell.field, activeCell && activeCell.t === t && activeCell.field === field)
        }
        return activeCell && activeCell.t.uuid === t.uuid && activeCell.field === field
    }

    const categoryCell = (t, i) => {
        return <button ref={categoryRefs[i]}
                       className={classes(['category', changeCategoryFor === t.uuid ? 'changeCategoryFor' : null])}
                       onKeyDown={onKeyDown(t, 'category', categoryRefs, i, dateRefs, amountRefs)}
                       disabled={changeCategoryFor != null}
                       onClick={() => setChangeCategoryFor(t.uuid) }>{t.category}</button>
    }


    const inputCell = (t, field, myRefs, i, value, {rightRefs, leftRefs}, other) =>
        <input key={`${t.uuid}-${field}`} ref={myRefs[i]}
               className={classes([field, isActive(t, field) ? 'active' : null])}
               onKeyDown={onKeyDown(t, field, myRefs, i, leftRefs, rightRefs)}
               readOnly={!isActive(t, field)}
               onFocus={_ => setFocusedField({ t: t, field: field})}
               disabled={changeCategoryFor != null}
               type='text'
               value={value}
               onChange={e => updateTransaction(t, field, e.target.value)}
               {...other  }/>

    return <div className={className}>
        {filter.text && <header>
            <input ref={filterPanelRef}
                   readOnly={true}
                   value={filter.text}
                   onKeyDown={filter.field && onKeyDownForFilter(filter.field)} />
        </header>}
        <div className='tableContainer'>
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
            {   filteredTransactions()
                .map((t,i) => (<tr key={t.uuid}>
                <td key='date'>
                    {inputCell(t, 'date', dateRefs, i, t.date, {rightRefs: commentRefs}, {maxLength: 2}) }
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
        </table>
        </div>
    </div>})`
    
  position: relative;

   header {
     position: absolute;
     left: 0px;
     top: -10px;
     display: block;
     border: 1px solid black;
     background: #ffffff;
     z-index: 2;
   }


    div.tableContainer {
        overflow-y: auto; 
        max-height: 500px;      
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
   input.date {
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
`;


function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

const createRefs1d = (existingArray, n) => Array(n).fill(null).map((_, i) => existingArray[i] || createRef())
const focusRef1d = (refArray, i) => refArray && refArray[i] && refArray[i].current && refArray[i].current.focus()

const Categories = styled(({className, categories, changeCategoryFor, categoryChanged, getTransaction, quitCategoryMode}) => {
    const [selectCatRefs, setSelectCatRefs] = useState([]);
    const filterTextRef = useRef()
    const [filterText, setFilterText] = useState(null);

    const filteredCategories = () => categories.filter(c => !filterText || c.name.toLowerCase().includes(filterText.toLowerCase()))
    const indexOf = categoryName => filteredCategories().findIndex(c => c.name === categoryName)

    useEffect(() => {
        setSelectCatRefs(createRefs1d(selectCatRefs, categories.length));
    }, [categories.length]);

    useEffect(() => {
        //focus on the first category when changing the category for a transaction
        if (changeCategoryFor) {
            if (filteredCategories().length === 0 && filterTextRef.current) {
                filterTextRef.current.focus()
            }
            else {
                const index = indexOf(getTransaction(changeCategoryFor).category)
                if (index >= 0) {
                    if (changeCategoryFor && selectCatRefs[0].current) selectCatRefs[index].current.focus()
                } else if (filterText && index === -1) {
                    if (changeCategoryFor && selectCatRefs[0].current) selectCatRefs[0].current.focus()
                }
            }
        }
        else {
            setFilterText(null)
        }
    }, [changeCategoryFor, filterText])

    const SelectButton = ({i, name}) => {
        const props = changeCategoryFor ? {
            onKeyDown: e => {
                if (e.key === "ArrowUp") focusRef1d(selectCatRefs, i-1)
                if (e.key === "ArrowDown") focusRef1d(selectCatRefs, i+1)
                return true
            },
            className: "selectMode",
            onClick: () => categoryChanged(name)
        } : {
            disabled: true
        }
        return <button ref={selectCatRefs[i]} {...props} >{name}</button>
    }

    const tableKeyEvents = e => {
        if (e.key === "Escape"  && filterText) setFilterText(null)
        if (e.key === "Escape") quitCategoryMode()
        if (e.key === "Backspace" && filterText) setFilterText(filterText.length > 0 ? filterText.substring(0, filterText.length-1) : null)
        if (e.key >= 'a' && e.key<='z') {
            setFilterText(filterText ? filterText + e.key : e.key)
        }
    }

    return <FocusTrap active={changeCategoryFor}>
        <div className={className} onKeyDown={tableKeyEvents}>
            { filterText && <header>
                <input readOnly={true} ref={filterTextRef} value={filterText}/>
            </header> }
            <div className='tableContainer'>
                <table>
                    <thead>
                    <tr>
                        <th key='name-header'>Name</th>
                        <th key='total-header'>Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {  filteredCategories()
                        .map((c, i) => (<tr key={c.id}>
                        <td key='name'><SelectButton i={i} name={c.name}/></td>
                        <td key='total'><span>{c.total}</span></td>
                    </tr>)) }
                    </tbody>
                </table>
            </div>
        </div>
    </FocusTrap>})` 
   position: relative; 
   margin-left: 5rem;
   div.tableContainer {
    overflow-y: auto; 
    max-height: 500px;
    }    
   
   header {
     position: absolute;
     left: 0px;
     top: -30px;
     display: block;
     border: 1px solid black;
     background: #ffffff;
     z-index: 2;
   }
   
   th, td {
      position: relative;
      text-align: left;
      font-weight: normal;
      border: 1px solid #ccc;
    }
   th {
      position: sticky; top: 0;
      background: #ffffff;   
      padding-top: 0.3rem;
      padding-bottom: 0.3rem;
      padding-left: 1rem;
      padding-right: 1rem;
      z-index: 1;
   } 
   span {
    padding: 0.25rem;    
    padding-left: 1rem;
    padding-right: 1rem;
   } 
   button {
    display: inline-block;
    border: none;
    height: 1.7rem;    
    width: 100%;
    padding: 0.25rem;    
    padding-left: 1rem;
    padding-right: 1rem;
    background-color: transparent;
   }   
   button:focus {
    background-color: light-grey;
   }
   button:disabled {
    color: black;
   }
   selectMode:focus {
     outline: none
   }
`;


const loadedCategories = [
    { id: 1, name: "Food", total: 100 },
    { id: 2, name: "School", total: 200 },
    { id: 3, name: "Car", total: 300 }
]

let loadedTransactions = [
    {
        id: 1,
        uuid: uuidv4(),
        date: " 01",
        comment: "",
        category: "Food",
        amount: 113.0,
    },
    {
        id: 2,
        uuid: uuidv4(),
        date: "02",
        comment: "",
        category: "Food",
        amount: 21.0,
    },
    {
        id: 3,
        uuid: uuidv4(),
        date: "03",
        comment: "",
        category: "Food",
        amount: 11.0,
    },
    {
        id: 4,
        uuid: uuidv4(),
        date: "03",
        comment: "",
        category: "Food",
        amount: 123.0,
    },
    {
        id: 5,
        uuid: uuidv4(),
        date: "04",
        comment: "",
        category: "Food",
        amount: 13.0
    }
];