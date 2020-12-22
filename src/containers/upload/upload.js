import React, {useEffect, useReducer, useState} from 'react';
import styled from "styled-components";
import {v4 as uuidv4} from "uuid";
import {formatDDMMYYYY, formatHHMM} from "../util";
import {testdups} from "./testdups";


export const Upload = styled(({className}) => {

    const [accounts, setAccounts] = useState([])
    const [feeds, setFeeds] = useState([])
    const [statements, setStatements] = useState([])
    const [newAccountName, setNewAccountName] = useState([])
    const [uploadToAccount, setUploadToAccount] = useState(null)
    const [currentBalance, setCurrentBalance] = useState(null)
    const [file, setFile] = useState(null)
    const [dupsForFeed, setDupsForFeed] = useState(null)
    const [dups, dispatchDups] = useReducer(dupsReducer, [])

    const [categories, dispatchCat] = useReducer(categoriesReducer, []);

    useEffect(() => {
        loadAccounts()
        loadFeeds()
        loadStatements()
        loadCategories()
    }, [])

    function dupsReducer(state, action) {
        console.log(action)
        switch (action.type) {
            case 'set-dups':
                return action.duplicates;
            case 'change-dup':
                const v = Object.assign({}, state);
                v[action.hash] = state[action.hash].map(d => {
                    return  d.recordNumber === action.recordNumber ? {...d, duplicate: !d.duplicate} : d;
                })
                return v;
            case 'make-assumptions':
                Object.keys(state).forEach(k => {
                    if (state[k].length === 1) state[k][0].duplicate = true
                    else {
                        state[k][0].duplicate = false
                        state[k].slice(1).forEach(d => {
                            d.duplicate = true
                        })
                    }
                })
                return { ...state }
        }
    }

    function categoriesReducer(state, action) {
        switch (action.type) {
            case 'add-category':
                return [...state, { id: uuidv4(), name: null, matchers: []}]
            case 'remove-category':
                return state.filter(c => c.id !== action.categoryId)
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
        .then(json => dispatchCat({type: 'load', categories: json.categories}))

    const addAccount = () => fetch(`http://localhost:8080/account/${newAccountName}`, { method: 'PUT' })
        .then(response => response.ok && loadAccounts())

    const deleteAccount = (accountId) => fetch(`http://localhost:8080/account/${accountId}`, { method: 'DELETE' })
        .then(response => response.ok && loadAccounts())

    const deleteImport = (feedId) => fetch(`http://localhost:8080/feed/${feedId}`, { method: 'DELETE' })
        .then(response => response.ok && loadAccounts() && loadFeeds() && loadStatements())

    const duplicateCheck = (feedId) => fetch(`http://localhost:8080/duplicateCheck/${feedId}`, { method: 'GET' })
        .then(response => response.ok && response.json())
        .then(json => {
            setDupsForFeed(feedId)
            dispatchDups({type: 'set-dups', duplicates: groupByHash(json.duplicates)})
        })

    const saveCategories = () => fetch(`http://localhost:8080/category`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(categories)})
        .then(response => loadCategories())

    const saveDuplicates = () => fetch(`http://localhost:8080/duplicates/${dupsForFeed}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dups)})
        .then(response => response.ok && response.json())
        .then(json => dispatchDups({type: 'set-dups', duplicates: groupByHash(json.duplicates)}))


    const upload = (account) => {
        const formData = new FormData()
        formData.append('file', file)
        if (currentBalance)
            formData.append('currentBalance', currentBalance)
        fetch(`http://localhost:8080/upload/${account.name}`,{
            method: 'POST',
            body: formData
        }).then(response => response.json())
        .then(response => {
            if (!response.error) {
                setDupsForFeed(response.feedId)
                dispatchDups({type: 'set-dups', duplicates: groupByHash(response.duplicates)})
                loadAccounts();
                loadFeeds();
                setDupsForFeed(feeds.filter(f => f.file === file.name).first)
                loadStatements()
            }
        })
    }
    const groupByHash = duplicates => {
        const result = {}
        duplicates.forEach(d => result[d.contentHash] ? result[d.contentHash].push(d) : result[d.contentHash] = [d])
        return result
    }

    const setDuplicateAssumption = dup => {
        if (dup.length === 1) dup[0].duplicate = true
        else {
            dup[0].duplicate = false
            dup.slice(1).forEach(d => { d.duplicate = true})
        }
        return dup
    }

    const rowStyleFor = dup => { if (dup.duplicate) return 'duplicate-row'; else return ''; }

    return (<div className={className}>
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
                        <button onClick={() => duplicateCheck(f.id)}>duplicate check</button>
                        <button onClick={() => deleteImport(f.id)}>delete</button>
                        </li>))}
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
        { dups && Object.keys(dups).length > 0 && (<section>
            <h2>Duplicates</h2>
            <button name="assumptions" onClick={_ => dispatchDups({type: 'make-assumptions'})}>Assumptions</button>
            <table>
                <thead>
                <tr>
                    <th>line</th>
                    <th>content</th>
                    <th>Duplicate</th>
                </tr>
                </thead>
                <tbody>
                { Object.keys(dups).map((k, i) => <>
                        <tr key={`${i}-dashed}`}><td>----------------</td></tr>
                        { dups[k].map((d,j) =>  <tr key={`${i}-${j}`} className={rowStyleFor(d)}>
                            <td>{d.recordNumber}</td>
                            <td><label for={`duplicate-${i}-${j}`}>{d.content}</label></td>
                            <td>{d.count}</td>
                            <td><input id={`duplicate-${i}-${j}`}
                                       name={`duplicate-${i}-${j}`}
                                       type="checkbox"
                                       checked={d.duplicate}
                                       onChange={_ => dispatchDups(
                                           {   type: 'change-dup',
                                               hash: d.contentHash,
                                               recordNumber: d.recordNumber,
                                               duplicate: !d.duplicate})}/>
                            </td>
                        </tr>)}
                        </>)}
                </tbody>
            </table>
            <button name='save'onClick={() => saveDuplicates()}>Save</button>
        </section>)}

        <section>
            <h2>Categories</h2>
            <ul>
                { categories && categories.map(c => (<>
                    <li><input name={`category-${c.id}`} value={c.name} onChange={e => dispatchCat({type: 'update-category-name', categoryId: c.id, name: e.target.value})}/>
                        <button onClick={() => dispatchCat({type: 'remove-category', categoryId: c.id})}>X</button>
                    </li>
                    <ul>
                        { c.matchers && c.matchers.map(m => <li><input name={m.id} value={m.pattern} onChange={e => dispatchCat({type: 'update-matcher', categoryId: c.id, matcherId: m.id, pattern: e.target.value})}/>
                        <button onClick={() => dispatchCat({type: 'remove-matcher', categoryId: c.id, matcherId: m.id})}>X</button>
                        </li>)}
                        <li><button onClick={_ => dispatchCat({type: 'add-matcher', categoryId: c.id})}>Add</button></li>
                        </ul></>))}
                <li><button onClick={_ => dispatchCat({type: 'add-category'})}>Add</button></li>
            </ul>
            <button onClick={saveCategories}>Save</button>
        </section>
    </div>)
})` 

 .duplicate-row {
   text-decoration: line-through;
 }
 `