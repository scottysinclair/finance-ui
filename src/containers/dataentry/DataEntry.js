import React, {createRef, useEffect, useRef, useState} from 'react';
import styled from 'styled-components'

const DataEntrySection = styled.section`  
`;

const ContentDiv = styled.div`
    display: flex;
`;

export const DataEntry = ({onChangeHeaderInfo}) => {
    onChangeHeaderInfo("January 2020")
    const  [changeCategoryFor, setChangeCategoryFor] = useState(null)
    const categoryChanged = cat => {
        transactions.filter(t => t.id === changeCategoryFor).forEach(t => t.category = cat)
        setChangeCategoryFor(null)
    }
    const getTransaction = id => transactions.find(t => t.id === id)
    return (
        <DataEntrySection>
            <ContentDiv>
                <Transactions {...{transactions, changeCategoryFor, setChangeCategoryFor, }}/>
                <Categories {...{categories,  changeCategoryFor, categoryChanged, getTransaction}}/>
            </ContentDiv>
        </DataEntrySection>)
}

const Transactions = styled(({className, transactions, changeCategoryFor, setChangeCategoryFor}) => {
    const [dateRefs, setDateRefs] = useState([]);
    const [descriptionRefs, setDescriptionRefs] = useState([]);
    const [categoryRefs, setCategoryRefs] = useState([]);
    const [amountRefs, setAmountRefs] = useState([]);
    const prev = usePrevious({changeCategoryFor});
    const [render, setRender] = useState(0);


    useEffect(() => {
        setDateRefs( createRefs1d(dateRefs, transactions.length));
        setDescriptionRefs( createRefs1d(dateRefs, transactions.length));
        setCategoryRefs( createRefs1d(dateRefs, transactions.length));
        setAmountRefs( createRefs1d(dateRefs, transactions.length));
    }, [transactions.length]);

    useEffect(() => {
        if (!changeCategoryFor && prev && prev.changeCategoryFor) {
            focusRef1d(categoryRefs, withId(prev.changeCategoryFor))
        }
    }, [changeCategoryFor])

    const withId = id => transactions.findIndex(e => e.id === id)

    const onKeyDown = (refArray, i) => {
        return e => {
            if (e.key === "ArrowUp") focusRef1d(refArray, i-1)
            if (e.key === "ArrowDown") focusRef1d(refArray, i+1)
            return true
        }
    }

    const CategoryCell = ({t, i}) => {
        return <button ref={categoryRefs[i]}
                    className={changeCategoryFor === t.id ? 'changeCategoryFor' : null}
                    onKeyDown={onKeyDown(categoryRefs, i)}
                    onClick={() => setChangeCategoryFor(t.id) }>{t.category}</button>
    }


    return <table className={className}>
    <thead>
    <tr>
        <th key='day-header'>Day</th>
        <th key='description-header'>Description</th>
        <th key='category-header'>Category</th>
        <th key='amount-header'>Amount</th>
    </tr>
    </thead>
    <tbody>
    { transactions.map((t,i) => (<tr key={t.id}>
        <td key='date'><input ref={dateRefs[i]} onKeyDown={onKeyDown(dateRefs, i)} type='text' defaultValue={t.date}/></td>
        <td key='description'>
            <input ref={descriptionRefs[i]}
                   onKeyDown={onKeyDown(descriptionRefs, i)}
                   type='text'
                   defaultValue={t.description}/></td>
        <td key='category'><CategoryCell {...{t, i}}/></td>
        <td key='amount'><input ref={amountRefs[i]} onKeyDown={onKeyDown(amountRefs, i)} type='text' defaultValue={t.amount}/></td>
    </tr>)) }
    </tbody>
</table>})`
   border-collapse: collapse;
   th, td {
      position: relative;
      text-align: left;
      border: 1px solid #ccc;
      font-weight: normal;
    }
    th {
      padding-top: 0.3rem;
      padding-bottom: 0.3rem;
    }
    
   input {
      padding: 0.25rem;
      border: none;
   }
   
   button {
    border: none;
    width: 100%;
    height: 100%;
    padding: 0.25rem;
    background-color: transparent;
   }   
   button.changeCategoryFor {
    background-color: #DCDCDD;
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
const createRefs2d = (existingArray, n, m) => Array(n).fill(null).map((_, i) => existingArray[i] || createRefs1d([], m))
const focusRef1d = (refArray, i) => refArray && refArray[i] && refArray[i].current && refArray[i].current.focus()

const Categories = styled(({className, categories, changeCategoryFor, categoryChanged, getTransaction}) => {
    const [selectCatRefs, setSelectCatRefs] = useState([]);

    const indexOf = categoryName => categories.findIndex(c => c.name === categoryName)

    useEffect(() => {
        setSelectCatRefs(createRefs1d(selectCatRefs, categories.length));
    }, [categories.length]);

    useEffect(() => {
        //focus on the first category when changing the category for a transaction
        if (changeCategoryFor && selectCatRefs[0].current) selectCatRefs[indexOf(getTransaction(changeCategoryFor).category)].current.focus()
    }, [changeCategoryFor])

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

    return <table className={className}>
    <thead>
    <tr>
        <th key='name-header'>Name</th>
        <th key='total-header'>Total</th>
    </tr>
    </thead>
    <tbody>
    {  categories.map((c, i) => (<tr key={c.id}>
        <td key='name'><SelectButton i={i} name={c.name}/></td>
        <td key='total'><span>{c.total}</span></td>
    </tr>)) }
    </tbody>
</table>})`
   margin-left: 5rem;
   border-collapse: collapse;
   th, td {
      position: relative;
      text-align: left;
      font-weight: normal;
      border: 1px solid #ccc;
    }
   th {
    padding-top: 0.3rem;
    padding-bottom: 0.3rem;
    padding-left: 1rem;
    padding-right: 1rem;
   } 
   span {
    padding: 0.25rem;    
    padding-left: 1rem;
    padding-right: 1rem;
   } 
   button {
    border: none;
    width: 100%;
    height: 100%;
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


const categories = [
    { id: 1, name: "Food", total: 100 },
    { id: 2, name: "School", total: 200 },
    { id: 3, name: "Car", total: 300 }
]

const transactions = [
    {
        id: 1,
        date: " 01",
        description: "Lidl",
        category: "Food",
        amount: 113.0,
    },
    {
        id: 2,
        date: "02",
        description: "Spar",
        category: "Food",
        amount: 21.0,
    },
    {
        id: 3,
        date: "03",
        description: "Lidl",
        category: "Food",
        amount: 11.0,
    },
    {
        id: 4,
        date: "03",
        description: "Penny",
        category: "Food",
        amount: 123.0,
    },
    {
        id: 5,
        date: "04",
        description: "Lidl",
        category: "Food",
        amount: 13.0
    }
];