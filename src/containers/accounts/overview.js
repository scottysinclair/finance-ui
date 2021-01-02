import React, {useEffect, useState} from "react";
import { useParams } from "react-router-dom";

export const Overview = props => {
    const { accountName } = useParams()
    const [overview, setOverview] = useState(null)

    useEffect(() => {
        fetch(`http://localhost:8080/account/${accountName}/overview`)
            .then(response => response.ok && response.json())
            .then(json => setOverview(json))
    }, [])

    console.log(overview)
    return (<div>
        <h2>Overview</h2>
        { overview && (<dl>
            <dt>From</dt>
            <dd>{new Date(overview.fromDate).toLocaleDateString()}</dd>
            <dt>To</dt>
            <dd>{new Date(overview.toDate).toLocaleDateString()}</dd>
            <dt>Transactions</dt>
            <dd>{overview.numberOfTransactions}</dd>
            <dt>End of Month Statements Generated</dt>
            <dd>{overview.numberOfStatements}</dd>
        </dl>)
        }
    </div>)
}