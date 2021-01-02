import React, {useEffect, useReducer, useState} from "react";
import {useParams} from "react-router-dom";
import {Duplicates} from "./duplicates";

export const Feeds = props => {
    const { accountName } = useParams()
    const [feeds, setFeeds] = useState([])
    const [activeFeed, setActiveFeed] = useState(null)

    useEffect(() => {
        loadFeeds()
    }, [])

    const loadFeeds = () => fetch(`http://localhost:8080/account/${accountName}/feed`)
        .then(response => response.ok && response.json())
        .then(json => setFeeds(json.feeds))

    const deleteImport = (feedId) => fetch(`http://localhost:8080/feed/${feedId}`, { method: 'DELETE' })
        .then(response => response.ok && loadFeeds() && setActiveFeed(null))

    const upload = (uploadFile) => {
        console.log(uploadFile)
        if (uploadFile) {
            const formData = new FormData()
            formData.append('file',uploadFile)
            fetch(`http://localhost:8080/account/${accountName}/feed`, {
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
            <thead>
              <tr>
                <th key="h9"> </th>
                <th key="h1">File</th>
                <th key="h2">Date Imported</th>
              </tr>
            </thead>
            <tbody>
            { feeds.map((f, i) => <tr key={`f0-${i}`}>
                 <td key={`f1-${i}`}><input type='radio' name='feed' onChange={_ => setActiveFeed(f)} checked={f === activeFeed}/></td>
                 <td key={`f2-${i}`}>{f.file}</td>
                 <td key={`f3-${i}`}>{new Date(f.dateImported).toLocaleDateString()} {new Date(f.dateImported).toLocaleTimeString()}</td>
             </tr>)}
            </tbody>
        </table>
        { activeFeed && (<>
            <div key='overview'>
                <dl>
                    <dt>From</dt>
                    <dd>{new Date(activeFeed.fromDate).toLocaleDateString()}</dd>
                    <dt>To</dt>
                    <dd>{new Date(activeFeed.toDate).toLocaleDateString()}</dd>
                    <dt>Transactions</dt>
                    <dd>{activeFeed.numberOfTransactions}</dd>
                </dl>
            </div>
            <button name='delete' onClick={ _ => deleteImport(activeFeed.feedId)}>Delete</button>
            <Duplicates feedId={activeFeed.feedId}/></>)}
    </div>)
}