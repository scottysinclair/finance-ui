import React, {useEffect, useReducer, useState} from "react";
import {v4 as uuidv4} from "uuid";

export const Categories = props => {

    const [categories, dispatchCat] = useReducer(categoriesReducer, []);


    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = () => fetch(`http://localhost:8080/api/category`)
        .then(response => response.json())
        .then(json => dispatchCat({type: 'load', categories: json.categories}))

    const saveCategories = () => fetch(`http://localhost:8080/api/category`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(categories)})
        .then(response => loadCategories())

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

    return (<section>
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
    )
}