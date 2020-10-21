import React, {useEffect, useReducer, useState} from 'react';
import {v4 as uuidv4} from "uuid";
import {formatDDMMYYYY, formatHHMM} from "../util";

export const Upload = props => {

    const [accounts, setAccounts] = useState([])
    const [feeds, setFeeds] = useState([])
    const [statements, setStatements] = useState([])
    const [newAccountName, setNewAccountName] = useState([])
    const [uploadToAccount, setUploadToAccount] = useState(null)
    const [currentBalance, setCurrentBalance] = useState(null)
    const [file, setFile] = useState(null)

    const [categories, dispatch] = useReducer(categoriesReducer, []);


    const [newCategoryName, setNewCategoryName] = useState([])
    const [newCategoryMatcher, setNewCategoryMatcher] = useState({})


    useEffect(() => {
        loadAccounts()
        loadFeeds()
        loadStatements()
        loadCategories()
    }, [])

    function categoriesReducer(state, action) {
        switch (action.type) {
            case 'add-category':
                return [...state, { id: uuidv4(), name: null, matchers: []}]
            case 'update-category-name':
                return state.map(c => c.id === action.categoryId ? {
                    ...c,
                    name: action.name } : c )
            case 'add-matcher':
                return state.map(c => c.id === action.categoryId ? {
                    ...c,
                    matchers: [...c.matchers, {id : uuidv4(), pattern: null}]} : c)
            case 'remove-matcher':
                return state.map(c => c.id === action.categoryId ? {
                    ...c,
                    matchers: c.matchers.filter(m => m.id !== action.matcherId) } : c)
            case 'update-matcher':
                return state.map(c => c.id === action.categoryId ? {
                    ...c,
                    matchers: c.matchers.map(m => m.id === action.matcherId ? {
                        ...m,
                        pattern: action.pattern
                    } : m)} : c)
            case 'load':
                return action.categories
            default:
                throw new Error();
        }
    }

    const loadAccounts = () => fetch(`http://localhost:8080/account`)
        .then(response => response.json())
        .then(json => setAccounts(json.accounts))

    const loadFeeds = () => fetch(`http://localhost:8080/feed`)
        .then(response => response.json())
        .then(json => setFeeds(json.feeds))

    const loadStatements = () => fetch(`http://localhost:8080/statement`)
        .then(response => response.json())
        .then(json => setStatements(json.statements))

    const loadCategories = () => fetch(`http://localhost:8080/category`)
        .then(response => response.json())
        .then(json => dispatch({type: 'load', categories: json.categories}))

    const addAccount = () => fetch(`http://localhost:8080/account/${newAccountName}`, { method: 'PUT' })
        .then(response => response.ok && loadAccounts())

    const deleteAccount = (accountId) => fetch(`http://localhost:8080/account/${accountId}`, { method: 'DELETE' })
        .then(response => response.ok && loadAccounts())

    const deleteImport = (feedId) => fetch(`http://localhost:8080/feed/${feedId}`, { method: 'DELETE' })
        .then(response => response.ok && loadAccounts() && loadFeeds() && loadStatements())


    const upload = (account) => {
        const formData = new FormData()
        formData.append('file', file)
        if (currentBalance)
            formData.append('currentBalance', currentBalance)
        fetch(`http://localhost:8080/upload/${account.name}`,{
            method: 'POST',
            body: formData
        }).then(response => {loadAccounts(); loadFeeds(); loadStatements()})
    }

    return (<div>
        <section>
            <h2>Accounts</h2>
            <ul>
                { accounts && accounts.map(a => (<>
                <li>{a.name} - <button onClick={_ => deleteAccount(a.id)}>Delete</button><button onClick={_ => setUploadToAccount(a.id)}>Upload</button></li>
                <ul>
                    <li>Number of transactions: {a.numberOfTransactions}</li>
                    <li>Number of statements: {statements && statements.filter(s => s.accountId === a.id).length}</li>
                    <li>Uploads:</li>
                    { feeds.length > 0 && (<ol>
                        {feeds.map(f => (<li>{f.file} uploaded on {formatDDMMYYYY(new Date(f.dateImported))} at {formatHHMM(new Date(f.dateImported))}
                        <button onClick={() => deleteImport(f.id)}>delete</button></li>))}
                    </ol>) }
                    { uploadToAccount === a.id && (<ol>

                        { statements.filter(s => s.accountId === a.id).length === 0 && <li>Please specify the most current balance
                            <input name='balance'
                                   type='input'
                                   value={currentBalance !== null ? currentBalance : ''}
                                   onChange={e => setCurrentBalance(e.target.value)}/></li> }
                        <li>Please select file  to upload
                                <input name='upload'
                                       type='file'
                                       onChange={e => setFile(e.target.files[0])}/></li>
                        <li><button onClick={() => upload(a)}>Go!</button></li>
                    </ol>)}
                </ul></>)) }

                <li>New: <input name='newAccount' value={newAccountName} onChange={e => setNewAccountName(e.target.value)}/>
                    <button onClick={_ => addAccount()}>Add</button></li>
            </ul>
        </section>
        <section>
            <h2>Categories</h2>
            <ul>
                { categories && categories.map(c => (<>
                    <li><input name={`category-${c.id}`} value={c.name} onChange={e => dispatch({type: 'update-category-name', categoryId: c.id, name: e.target.value})}/></li>
                    <ul>
                        { c.matchers && c.matchers.map(m => <li><input name={m.id} value={m.pattern} onChange={e => dispatch({type: 'update-matcher', categoryId: c.id, matcherId: m.id, pattern: e.target.value})}/>
                        <button onClick={() => dispatch({type: 'remove-matcher', categoryId: c.id, matcherId: m.id})}>X</button>
                        </li>)}
                        <li><button onClick={_ => dispatch({type: 'add-matcher', categoryId: c.id})}>Add</button></li>
                        </ul></>))}
                <li><button onClick={_ => dispatch({type: 'add-category'})}>Add</button></li>
            </ul>
        </section>
    </div>)
}