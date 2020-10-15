import React, {useEffect, useState} from "react";

import {useParams} from "react-router-dom";
import {CategoryBarchart} from "../dataentry/CategoryBarchart";

export const YearReport = props =>  {

    const { year } = useParams()
    const [categories, setCategories] = useState(null)

    useEffect(() => {
        fetch(`http://localhost:8080/year/${year}/categories`)
            .then(response => response.json())
            .then(json => setCategories(json.data))
    }, [year])


    return (<div>
        <h2>Year report for {year}</h2>
        { categories &&  <CategoryBarchart data={categories}/> }
    </div>)
}