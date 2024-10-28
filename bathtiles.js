import * as d3 from 'd3';
import tippy from 'tippy.js';
import styles from './bathtiles.module.css';

var width = 900;
var height = 110;
var dx = 35;
var gridClass = 'js-date-grid day';
var CELL_SIZE = 14;
var NUMBER_OF_COLORS = 6;

class Bathtiles {
    constructor(json = null, mainColor = '#144e12') {
        console.log('Bathtiles.js - Constructing...')
        this.data = formatData(json);
        this.mainColor = mainColor
    }

    load(target) {
        console.log('Bathtiles.js - Loading...')
        console.log(target)
        // For Tippy
        var popperSRC = document.createElement('script');
        popperSRC.src = "https://unpkg.com/@popperjs/core@2";
        target.appendChild(popperSRC);
        var tippySRC = document.createElement('script');
        tippySRC.src = "https://unpkg.com/tippy.js@6";
        target.appendChild(tippySRC);

        //Heatmap
        var bathtilesHeatmap = document.createElement('div');
        bathtilesHeatmap.id = 'js-heatmap'
        target.appendChild(bathtilesHeatmap);
        //Months Label
        var bathtilesMonths = document.createElement('div');
        bathtilesMonths.id = 'js-months'
        target.appendChild(bathtilesMonths);
        //Months Label
        var bathtilesLegend = document.createElement('div');
        bathtilesLegend.id = 'js-legend'
        target.appendChild(bathtilesLegend);

        const yearFormat = d3.utcFormat('%Y');
        const startYear = yearFormat(this.data.startDate);
        const endYear = Number(yearFormat(new Date())) + 1;

        // Setup
        const width = 900;
        const height = 110;
        const dx = 35;
        const gridClass = 'js-date-grid day';
        const CELL_SIZE = 14;
        const NUMBER_OF_COLORS = 6;

        const formatColor = d3.scaleQuantize()
            .domain([0, this.data.maxCount])
            .range(d3.range(NUMBER_OF_COLORS).map((d) => styles[`color${d}`]));

        const heatmapSvg = d3.select('#js-heatmap')
            .selectAll('svg.heatmap')
            .data(d3.range(startYear, endYear))
            .enter()
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'color');

        // Add a grid for each day between the date range.
        const dates = Object.keys(this.data.dates);
        const rect = heatmapSvg.append('g')
            .attr('transform', `translate(${dx},0)`);

        // Add year label.
        rect.append('text')
            .attr('transform', `translate(-9,${CELL_SIZE * 3.5})rotate(-90)`)
            .style('text-anchor', 'middle')
            .text((d) => d);

        rect.selectAll('.day')
            .data((d) => d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)))
            .enter()
            .append('rect')
            .attr('class', (d) => `${styles.day} ${gridClass}`)
            .attr('width', CELL_SIZE)
            .attr('height', CELL_SIZE)
            .attr('x', (d) => d3.utcFormat('%U')(d) * CELL_SIZE)
            .attr('y', (d) => d.getDay() * CELL_SIZE)
            .datum(d3.utcFormat('%Y-%m-%d'))
            .attr('data-tippy-content', (d) => {
                const countData = this.data.dates[d];
                const date = d3.utcFormat('%b %d, %Y')(new Date(d));
                return !countData ? `No posts on ${date}` : `${countData} post${countData > 1 ? 's' : ''} on ${date}`;
            })
            .call((s) => tippy(s.nodes(), { offset: [0, 0] }))
            .filter((d) => dates.indexOf(d) > -1)
            .attr('class', (d) => `${styles.day} ${gridClass} ${formatColor(this.data.dates[d])}`);

        // Render x axis to show months
        d3.select('#js-months').selectAll('svg.months')
            .data([1])
            .enter()
            .append('svg')
            .attr('width', 800)
            .attr('height', 20)
            .append('g')
            .attr('transform', `translate(0,10)`)
            .selectAll('.month')
            .data(() => d3.range(12))
            .enter()
            .append('text')
            .attr('x', (d) => d * (4.5 * CELL_SIZE) + dx)
            .text((d) => d3.utcFormat('%b')(new Date(0, d + 1, 0)));

        // Render the grid color legend.
        const legendSvg = d3.select('#js-legend').selectAll('svg.legend')
            .enter()
            .append('svg')
            .data([1])
            .enter()
            .append('svg')
                .attr('width', 800)
                .attr('height', 20)
            .append('g')
            .attr('transform', `translate(644,0)`)
            .selectAll('.legend-grid')
            .data(() => d3.range(NUMBER_OF_COLORS))
            .enter()
            .append('rect')
            .attr('width', CELL_SIZE)
            .attr('height', CELL_SIZE)
            .attr('x', (d) => d * CELL_SIZE + dx)
            .attr('class', (d) => `${styles.day} ${styles[`color${d - 1}`]}`);
        console.log('Bathtiles.js - Finished!')
    }
};

// Formats the JSON data to be easily ready by d3.
function formatData(data) {
    console.log('Bathtiles.js - Formating Data...', data);
    if (!data || !data['submissionCalendar']) {
        // Return empty data structure
        console.log('Bathtiles.js - Formating Data: its empty FYI', data);
        const defaultStartDate = new Date();
        defaultStartDate.setFullYear(defaultStartDate.getFullYear());
        return {
            startDate: defaultStartDate, // Current date as the start date
            dates: {}, // Empty date table
            maxCount: 0 // Max count is zero
        };
    }
    const parsedData = JSON.parse(data['submissionCalendar']);
    const dateTable = {};
    let oldestDate = new Date();
    let maxCount = 0;
    const formatDate = d3.utcFormat('%Y-%m-%d');

    for (const [timestamp, count] of Object.entries(parsedData)) {
        const date = new Date(timestamp * 1000);
        const formattedDate = formatDate(date);
        dateTable[formattedDate] = count;

        // Update oldest date and max count
        if (timestamp < oldestDate) {
            oldestDate = formattedDate;
        }
        maxCount = Math.max(maxCount, dateTable[formattedDate]);
    }

    return {
        startDate: new Date(oldestDate),
        dates: dateTable,
        maxCount
    };
}

export { Bathtiles };
