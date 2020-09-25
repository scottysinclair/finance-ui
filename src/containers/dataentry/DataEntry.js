import React, {createRef, useEffect, useRef, useState} from 'react';
import styled from 'styled-components'

const DataEntrySection = styled.section`
  color: palevioletred;
`;

const ContentDiv = styled.div`
    display: flex;
`;

export const DataEntry = () => {
    const  [changeCategoryFor, setChangeCategoryFor] = useState(null)
    const categoryChanged = cat => {
        transactions.filter(t => t.id === changeCategoryFor).forEach(t => t.category = cat)
        setChangeCategoryFor(null)
    }
    return (
        <DataEntrySection>DATA ENTRY
            <header>January 2020</header>
            <ContentDiv>
                <Transactions {...{transactions, changeCategoryFor, setChangeCategoryFor, }}/>
                <Categories {...{categories,  changeCategoryFor, categoryChanged}}/>
            </ContentDiv>
        </DataEntrySection>)
}

const Transactions = styled(({className, transactions, changeCategoryFor, setChangeCategoryFor}) => {
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
    { transactions.map(t => (<tr key={t.id}>
        <td key='date'><input type='text' value={t.date}/></td>
        <td key='description'><input type='text' value={t.description}/></td>
        <td key='category'>{changeCategoryFor === t.id ? t.category : <button onClick={() => setChangeCategoryFor(t.id) }>{t.category}</button>}</td>
        <td key='amount'><input type='text' value={t.amount}/></td>
    </tr>)) }
    </tbody>
</table>})`
   input {
       font-weight: bold;
       color: red;
   }
`;



const Categories = ({categories, changeCategoryFor, categoryChanged}) => {
    const [selectCatRefs, setSelectCatRefs] = React.useState([]);

    useEffect(() => {
        // rebuild refs when the categories change
        setSelectCatRefs(r => (
            Array(categories.length).fill().map((_, i) => selectCatRefs[i] || createRef())
        ));
    }, [categories.length]);

    useEffect(() => {
        //focus on the first category when changing the category for a transaction
        if (changeCategoryFor && selectCatRefs[0].current) selectCatRefs[0].current.focus()
    }, [changeCategoryFor])

    return <table>
    <thead>
    <tr>
        <th key='name-header'>Name</th>
        <th key='total-header'>Total</th>
    </tr>
    </thead>
    <tbody>
    {  categories.map((c, i) => (<tr key={c.id}>
        <td key='name'>{changeCategoryFor ? <button ref={selectCatRefs[i]} onClick={() =>categoryChanged(c.name)}>{c.name}</button> : c.name }</td>
        <td key='total'>{c.total}</td>
    </tr>)) }
    </tbody>
</table>}

const categories = [
    { id: 1, name: "Food", total: 100},
    { id: 2, name: "School", total: 200},
    { id: 3, name: "Car", total: 300}
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