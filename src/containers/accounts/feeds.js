import React, {useEffect, useReducer, useState} from "react";
import {useParams} from "react-router-dom";
import {Duplicates} from "./duplicates";

import styled from "styled-components";

const StyledDt = styled.dt`
    display: inline-block;
`

const StyledDd = styled.dd`
    margin-left: 4pt;
    display: inline-block;
`

export const Feeds = props => {
    const { accountName } = useParams()
    const [feeds, setFeeds] = useState([])
    const [activeFeed, setActiveFeed] = useState(null)

    useEffect(() => {
        loadFeeds()
    }, [])

    const loadFeeds = () => fetch(`http://localhost:8080/api/account/${accountName}/feed`)
        .then(response => response.ok && response.json())
        .then(json => setFeeds(json.feeds))

    const deleteImport = (feedId) => fetch(`http://localhost:8080/api/feed/${feedId}`, { method: 'DELETE' })
        .then(response => response.ok && loadFeeds() && setActiveFeed(null))

    const upload = (uploadFile) => {
        console.log(uploadFile)
        if (uploadFile) {
            const formData = new FormData()
            formData.append('file',uploadFile)
            fetch(`http://localhost:8080/api/account/${accountName}/feed`, {
                method: 'POST',
                body: formData
            }).then(response => response.json())
                .then(response => {
                    if (!response.error) {
                        loadFeeds();
                    }
                })
        }
    }

    return (<div>
        <h2>Feeds</h2>
        <input type='file' name='upload' onChange={ e => upload(e.target.files[0])}/>
        <table width="100%">
            <tbody>
            { feeds.map((f, i) => <tr key={`f0-${i}`}>
                 <td key={`f1-${i}`}><input id={`f1-${i}`} type='radio' name='feed' onChange={_ => setActiveFeed(f)} checked={f === activeFeed}/></td>
                 <td key={`f2-${i}`}><label htmlFor={`f1-${i}`}> {f.file}</label></td>
                 <td key={`f3-${i}`}>{new Date(f.dateImported).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })} {new Date(f.dateImported).toLocaleTimeString()}</td>
             </tr>)}
            </tbody>
        </table>
        { activeFeed && (<>
            <div key='overview'>
                <dl>
                    <StyledDt>From:</StyledDt>
                    <StyledDd>{new Date(activeFeed.fromDate).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}</StyledDd>
                </dl>
                    <StyledDt>To:</StyledDt>
                    <StyledDd>{new Date(activeFeed.toDate).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}</StyledDd>
                <dl>
                    <StyledDt>Transactions:</StyledDt>
                    <StyledDd>{activeFeed.numberOfTransactions}</StyledDd>
                </dl>
            </div>
            <button name='delete' onClick={ _ => deleteImport(activeFeed.feedId)}>Delete</button>
            <Duplicates feedId={activeFeed.feedId}/></>)}
    </div>)
}