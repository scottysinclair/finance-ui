import React, {useEffect, useState} from "react";

import styled from "styled-components";
import {ResponsiveLine} from "@nivo/line";

export const CategoriesReport = props => {

    const [filter, setFilter] = useState(null)
    const [total, setTotal] = useState(0)
    const [min, setMin] = useState(1)
    const [data, setData] = useState(null)
    const [filteredData, setFilteredData] = useState(null)

    useEffect(() =>{
        fetch(`http://localhost:8080/timeseries/categories`)
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
    }, [])

    useEffect(() => {
        setFilteredData(data ? filterData(data) : null)
    }, [data, filter, total, min])

    const filterData = data => data
        .filter(d => !filter || d.id.toLowerCase().includes(filter))
        .filter(d => Math.abs(d.data.map(z => z.y).reduce((a,b) => a+b, 0)) >= total)
        .filter(d => Math.abs(d.data.map(z => z.y).reduce((a,b) => a > b ? a : b, 0)) >= min)

    return (<div>
        Category: <input name='category' value={filter} onChange={e => setFilter(e.target.value.toLowerCase())}/>
        Total Over Period: <input name='total' value={total} onChange={e => e.target.value  && setTotal(parseInt(e.target.value))}/>
        Min Every Month: <input name='min' value={min} onChange={e => e.target.value  && setMin(parseInt(e.target.value))}/>
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
  width: 85vw;
`
