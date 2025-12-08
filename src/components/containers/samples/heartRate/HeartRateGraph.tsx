import { HRSamples } from '../../../../constants/types'
import React, { useState, useEffect } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { parseISO, differenceInMinutes } from 'date-fns'
import '../../../../styles/CustomToolTip.css'

interface HeartRateGraphProps {
  bpm: HRSamples[]
  selectedDate: Date
}

function HeartRateGraph({ bpm, selectedDate }: HeartRateGraphProps) {
  const [chartData, setChartData] = useState<{ time: number, bpm: number | null }[]>([])
  const [gappedData, setGappedData] = useState<{ time: number, bpm: number | null }[]>([])
  const [hasData, setHasData] = useState<boolean>(true)

  const processChartData = (data: HRSamples[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      setHasData(false)
      return
    }

    const timezoneOffset = new Date().getTimezoneOffset() * 60000; // in milliseconds
    const newData = data.map(sample => {
      const date = new Date(parseISO(sample.timestamp.toString()).getTime() - timezoneOffset);
      return {
        time: date.getTime(),
        bpm: sample.bpm,
      }
    })

    const newGappedData = []
    for (let i = 0; i < newData.length; i++) {
      const currentSample = newData[i]
      const previousSample = newData[i - 1]

      if (i > 0) {
        const diffMinutes = differenceInMinutes(new Date(currentSample.time), new Date(previousSample.time))
        if (diffMinutes >= 20) {
          newGappedData.push({ time: currentSample.time, bpm: null }) // Insert null for gap
        }
      }
      newGappedData.push(currentSample)
    }

    setChartData(newData)
    setGappedData(newGappedData)
    setHasData(true)
  }

  useEffect(() => {
    processChartData(bpm)
  }, [bpm, selectedDate])

  const options = {
    chart: {
      type: 'line',
      zoomType: 'x'
    },
    title: {
      text: ''
    },
    credits: {
      enabled: false // Disable the Highcharts text
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        hour: '%H:%M',
        minute: '%H:%M',
        second: '%H:%M:%S'
      },
      lineWidth: 0, // Remove X-axis line
      title: {
        text: null // Remove X-axis title
      },
      labels: {
        y: 30 // Add more margin between X ticks values and the line
      }
    },
    yAxis: {
      title: {
        text: null // Remove Y-axis title
      }
    },
    legend: {
      enabled: false // Disable the legend
    },
    tooltip: {
      shared: false,
      useHTML: true,
      formatter: function (this: Highcharts.TooltipFormatterContextObject): string {
        return `<div class="custom-tooltip">
        <p>${Highcharts.dateFormat('%H:%M', this.x as number)}<span style="color:#a3a3a3;">:${Highcharts.dateFormat('%S', this.x as number)}</span></p>
                  <p style="margin-top: 12px; font-size: 16px;">${this.y} bpm </p>
                </div>`;
      },
      style: {
        fontSize: '12px',
        color: '#ffffff',
      },
      borderRadius: 0,
      padding: 2,
    },
    series: [
      {
        name: '',
        data: chartData.map(point => [point.time, point.bpm]),
        color: '#71717a', // Set line color to black
        lineWidth: 0.9, // Set the line width
        dashStyle: 'Dash', // Make this line dotted
        marker: {
          enabled: false, // Disable markers (dots) on the line
          states: {
            hover: {
              enabled: false // Disable hover state marker
            }
          }
        },
        states: {
          hover: {
            lineWidthPlus: 0 // Disable line width increase on hover
          }
        },
        connectNulls: true // Connect null points for the dotted line
      },
      {
        name: '',
        data: gappedData.map(point => [point.time, point.bpm]),
        color: 'black', // Set line color to black
        lineWidth: 1, // Set the line width
        marker: {
          enabled: false, // Disable markers (dots) on the line
          states: {
            hover: {
              enabled: false // Disable hover state marker
            }
          }
        },
        states: {
          hover: {
            lineWidthPlus: 0 // Disable line width increase on hover
          }
        },
        tooltip: {
          valueDecimals: 0,
          valueSuffix: ' BPM',
          xDateFormat: '%H:%M:%S'
        },
        connectNulls: false // Don't connect null points to create gaps
      },
    ]
  }

  return (
    <div style={{ userSelect: 'none', width: '100%' }} className=''>
      {hasData && (
        <HighchartsReact highcharts={Highcharts} options={options} />
      )}
    </div>
  )
}

export default HeartRateGraph
