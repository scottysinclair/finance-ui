import React, {useEffect, useState} from "react";

import styled from "styled-components";
import {ResponsiveLine} from "@nivo/line";

export const CategoriesReport = props => {

    const [category, setCategory] = useState(null)
    const [comment, setComment] = useState(null)
    const [total, setTotal] = useState(0)
    const [min, setMin] = useState(1)
    const [data, setData] = useState(null)
    const [filteredData, setFilteredData] = useState(null)

    useEffect(() =>{
        loadData()
    }, [])

    useEffect(() =>{
        loadData()
    }, [comment])


    useEffect(() => {
        setFilteredData(data ? filterData(data) : null)
    }, [data, category, total, min])


    const loadData = _ => {
        var url = 'http://localhost:8080/timeseries/categories'
        if (comment) {
            url += `?comment=${comment}`
        }
        return fetch(url)
            .then(response => response.json())
            .then(json => json.data.map(d =>{ return {
                id: d.id,
                data: d.data.map(v => {
                    return {
                        x: v.date,
                        y: v.amount,
                    }})
            }}))
            .then(data => {
                setData(data)
            })
    }

    const filterData = data => data
        .filter(d => !category || d.id.toLowerCase().includes(category))
        .filter(d => isNaN(total) || Math.abs(d.data.map(z => z.y).reduce((a,b) => a+b, 0)) >= total)
        .filter(d => isNaN(min) || d.data.map(z => z.y).reduce((a,b) => {
            const [aa, ab] = [Math.abs(a), Math.abs(b)]
            return aa > ab  ? aa : ab }, 0) >= min)


    const onKeyDownCapture = e => {
        if (e.key === 'Escape') {
            setComment(null)
            setCategory(null)
            setTotal(0)
            setMin(1)
        }
    }

    return (<div onKeyDownCapture={onKeyDownCapture}>
        Comment: <input name='comment' value={comment || ''} onChange={e => setComment(e.target.value)}/>
        Category: <input name='category' value={category || ''} onChange={e => setCategory(e.target.value)}/>
        Total Over Period: <input name='total' value={total || ''} onChange={e => setTotal(parseInt(e.target.value)) }/>
        Can Exceed: <input name='min' value={min || ''} onChange={e =>  setMin(parseInt(e.target.value)) }/>
        {filteredData ? filteredData.length : 0 } Categories
        { filteredData  && <MyResponsiveLine data={filteredData}/> }
    </div>)
}

const MyResponsiveLine = styled(({className, data}) => <div className={className}>
    <ResponsiveLine
        data={data}
        margin={{ top: 50, right: 110, bottom: 100, left: 60 }}
        xScale={{
            type: 'time',
            format: '%Y-%m-%d',
            useUTC: false,
            precision: 'month'
        }}
        xFormat="time:%Y-%m-%d"
        yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
        curve="cardinal"
        lineWidth={4}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            orient: 'bottom',
            format: '%d %b %y',
            tickValues: 'every month',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 90,
            legend: 'time',
            legendOffset: 36,
            legendPosition: 'center'
        }}
        axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'count',
            legendOffset: -40,
            legendPosition: 'center'
        }}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabel="y"
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
            {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
    />
</div>)`
  height:90vh;
  width: 95%;
`
