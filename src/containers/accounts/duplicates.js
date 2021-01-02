import React, {useEffect, useReducer, useState} from "react";
import styled from "styled-components";


export const Duplicates = styled( ({className, feedId})  => {

    const [dupsForFeed, setDupsForFeed] = useState(null)
    const [dups, dispatchDups] = useReducer(dupsReducer, [])

    console.log(feedId)

    const duplicateCheck = (feedId) => fetch(`http://localhost:8080/duplicateCheck/${feedId}`, { method: 'GET' })
        .then(response => response.status === 200 && response.json())
        .then(json => {
            if (json) {
                setDupsForFeed(feedId)
                dispatchDups({type: 'set-dups', duplicates: groupByHash(json.duplicates)})
            }
        })

    const saveDuplicates = () => fetch(`http://localhost:8080/duplicates/${dupsForFeed}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dups)})
        .then(response => response.ok && response.json())
        .then(json => dispatchDups({type: 'set-dups', duplicates: groupByHash(json.duplicates)}))

    const groupByHash = duplicates => {
        const result = {}
        duplicates.forEach(d => result[d.contentHash] ? result[d.contentHash].push(d) : result[d.contentHash] = [d])
        return result
    }

    const rowStyleFor = dup => { if (dup.duplicate) return 'duplicate-row'; else return ''; }

    useEffect(() => {
        duplicateCheck(feedId)
    }, [feedId])

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

    return dups && Object.keys(dups).length > 0 && (<section className={className}>
            <h2>Duplicates</h2>
            <button name="assumptions" onClick={_ => dispatchDups({type: 'make-assumptions'})}>Assumptions</button>
            <button name='save'onClick={() => saveDuplicates()}>Save</button>
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
                        <td key={`d1-${i}-${j}`}>{d.recordNumber}</td>
                        <td key={`d2-${i}-${j}`}><label for={`duplicate-${i}-${j}`}>{d.content}</label></td>
                        <td key={`d3-${i}-${j}`}>{d.count}</td>
                        <td key={`d4-${i}-${j}`}><input id={`duplicate-${i}-${j}`}
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
        </section>)
})` 

 .duplicate-row {
   text-decoration: line-through;
 }
 `