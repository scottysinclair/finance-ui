import React from 'react';

export const DataEntry = () => {
    return (
        <section>DATA ENTRY
            <header>January 2020</header>
            <Table data={transactions}/>
            <Categories data={categories}/>
        </section>)
}

const Table = props =>
<table>
    <thead>
    <tr>
        <th>Day</th>
        <th>Description</th>
        <th>Category</th>
        <th>Amount</th>
    </tr>
    </thead>
    <tbody>
    { props.data.map(t => (<tr>
        <td><input type='text' value={t.date}/></td>
        <td><input type='text' value={t.description}/></td>
        <td><button>{t.category.name}</button></td>
        <td><input type='text' value={t.amount}/></td>
    </tr>)) }
    </tbody>
</table>

const Categories = props =>
<table>
    <thead>
    <tr>
        <th>Name</th>
        <th>Total</th>
    </tr>
    </thead>
    <tbody>
    { props.data.map(c => (<tr>
        <td>{c.name}</td>
        <td>{c.total}</td>
    </tr>)) }
    </tbody>
</table>

const categories = [
    { id: 1, name: "Food", total: 100},
    { id: 2, name: "School", total: 200},
    { id: 3, name: "Car", total: 300}
]

const transactions = [
    {
        date: " 01",
        description: "Lidl",
        category: { id: 1, name: "Food" },
        amount: 113.0,
    },
    {
        date: "02",
        description: "Spar",
        category: { id: 1, name: "Food" },
        amount: 21.0,
    },
    {
        date: "03",
        description: "Lidl",
        category: { id: 1, name: "Food" },
        amount: 11.0,
    },
    {
        date: "03",
        description: "Penny",
        category: { id: 1, name: "Food" },
        amount: 123.0,
    },
    {
        date: "04",
        description: "Lidl",
        category: { id: 1, name: "Food" },
        amount: 13.0
    }
];