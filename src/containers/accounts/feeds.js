import React, {useEffect, useReducer, useState} from "react";
import {useParams} from "react-router-dom";
import {Duplicates} from "./duplicates";

import styled from "styled-components";

export const Feeds = styled( ({className}) => {
    const { accountName } = useParams()
    const [feeds, setFeeds] = useState([])
    const [activeFeed, setActiveFeed] = useState(null)

    useEffect(() => {
        document.title = `${accountName} Feeds` ;
        loadFeeds()
    }, [])

    const loadFeeds = () => fetch(`http://localhost:8080/api/account/${accountName}/feed`)
        .then(response => response.ok && response.json())
        .then(json => setFeeds(json.feeds))

    const deleteImport = (feedId) => fetch(`http://localhost:8080/api/feed/${feedId}`, { method: 'DELETE' })
        .then(response => response.ok && loadFeeds() && setActiveFeed(null))

    const upload = (uploadFiles) => {
        const files = Array.from(uploadFiles).sort((a, b) => { return a.lastModified - b.lastModified })
        uploadNext(files, 0)
    }

    const uploadNext = (uploadFiles, i) => {
        if (i >= uploadFiles.length) return;
        const uploadFile = uploadFiles[i]
        console.log('Uploading ', uploadFile)
        if (uploadFile) {
            const formData = new FormData()
            formData.append('file',uploadFile)
            formData.append('timestamp', uploadFile.lastModified)
            fetch(`http://localhost:8080/api/account/${accountName}/feed`, {
                method: 'POST',
                body: formData
            }).then(response => response.json())
                .then(response => {
                    if (!response.error && i + 1 < uploadFiles.length) {
                            uploadNext(uploadFiles, i + 1)
                    }
                    else {
                        loadFeeds()
                    }
                })
        }

    }

    return (<div className={className}>
        <h2>Feeds</h2>
        <p>Upload files: <input type='file' name='upload' multiple={true} onChange={ e => upload(e.target.files)}/></p>
        <hr/>
        <table width="100%">
            <thead>
                <th></th>
                <th>File</th>
                <th># Transactions</th>
                <th>Date Start</th>
                <th>Date End</th>
                <th>File Date</th>
            </thead>
            <tbody>
            { feeds.map((f, i) => <tr key={`f0-${i}`}>
                 <td key={'1'}><input id={`f1-${i}`} type='radio' name='feed' onChange={_ => setActiveFeed(f)} checked={f === activeFeed}/></td>
                 <td key={'2'}><label htmlFor={`f1-${i}`}> {f.file}</label></td>
                 <td key={'3'}>{f.numberOfTransactions}</td>
                 <td key={'4'}>{new Date(f.dateImported).toLocaleDateString('en-uk', { year: 'numeric', month: 'numeric', day: 'numeric' })} {new Date(f.dateImported).toLocaleTimeString()}</td>
                 <td key={'5'}>{new Date(f.fromDate).toLocaleDateString('en-uk', { year: 'numeric', month: 'numeric', day: 'numeric' })}</td>
                 <td key={'6'}>{new Date(f.toDate).toLocaleDateString('en-uk', { year: 'numeric', month: 'numeric', day: 'numeric' })}</td>
             </tr>)}
            </tbody>
        </table>
        { activeFeed && (<>
            <button name='delete' onClick={ _ => deleteImport(activeFeed.feedId)}>Delete</button>
            <hr/>
            <FeedTransactions feedId={activeFeed.feedId}/>
        </>)}
    </div>)
})`
    th {
      text-align: left;
    }
    table {
       margin-bottom: 1rem;
    }
`



export const FeedTransactions = styled(({className, feedId}) => {
    const [transactions, setTransactions] = useState(null)

    const loadFeedTransactions = () => fetch(`http://localhost:8080/api/feed/${feedId}`)
        .then(response => response.ok && response.json())
        .then(json => json.transactions && setTransactions(json.transactions))

    const pad = (number) => {
        if (`${number}`.length == 1) {
            return `0${number}`
        }
        else return number
    }

    useEffect(() => {
        setTransactions(null)
        loadFeedTransactions(feedId)
    }, [feedId])

    return <>
        { transactions && transactions.length > 0 && <section className={className}>
        <table>
            <tbody>
            {
                transactions.map(t => <tr>
                    <td class={"day"}>{pad(t.day)}.{pad(t.month + 1)}.{t.year}</td>
                    <td class={"description"}>{t.description.substring(0, Math.min(100, t.description.length))}</td>
                    <td class={"amount"}>{t.amount}</td>
                </tr>)
            }
            </tbody>
        </table>
        </section> || <p>Loading...</p>
        }
    </>})`
  overflow-y: scroll;
  max-height: 60vh;
  
  td {
    font-family: monospace;
    font-size: larger;
  }
  
  td.day {
    padding-right: 2rem;
  }
  td.amount {
    padding-left: 2rem;
  }
`;