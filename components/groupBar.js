class GB
{
    margin = {
        top: 10, right: 10, bottom: 40, left: 40
    }

    constructor(svg, tooltip, width = 250, height = 250) {
        this.svg = svg;
        this.width = width;
        this.height = height;
        this.tooltip = tooltip;

        this.colorScale = d3.scaleOrdinal()
        .domain(["Watch Time", "Stream Time"])
        .range(["skyblue", "#D0A9F5"]);
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.container = this.svg.append("g");
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
        this.legend = this.svg.append("g");

        this.xScale = d3.scaleBand();
        this.yScale = d3.scaleLinear();

        this.tooltip = d3.select(this.tooltip);

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        this.update([]);
    }

    update(data){

        this.container.selectAll(".barGroup").remove();
        
        const filterData = data.slice(0,6);

        const filterdata = filterData.map(d => ({
            Channel: d.Channel,
            "Watch time(Minutes)": parseInt(d["Watch time(Minutes)"]/432000),
            "Stream time(minutes)": parseInt(d["Stream time(minutes)"]/60),
            Language: d.Language
          }));

        console.log(filterdata);

        const watchTimeMin = d3.min(filterdata, d => d["Watch time(Minutes)"]);
        const watchTimeMax = d3.max(filterdata, d=> d["Watch time(Minutes)"]);
        const streamTimeMin = d3.min(filterdata, d => d["Stream time(minutes)"]);
        const streamTimeMax = d3.max(filterdata, d => d["Stream time(minutes)"]);

        const theSmallest = Math.min(watchTimeMin, streamTimeMin);
        const theBiggest = Math.max(watchTimeMax, streamTimeMax);


        this.xScale.domain(filterdata.map(d => d.Channel)).range([0, this.width]).padding(0.3);

        this.yScale.domain([theSmallest, theBiggest]).range([this.height, 0]);


        this.xAxis
        .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
        .call(d3.axisBottom(this.xScale))
        .selectAll("text")
        .attr("transform", "rotate(-35)")
        .attr("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em")
        .style("font-size", "6.5px")
        .style("font-weight", "bold");

        this.yAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .call(d3.axisLeft(this.yScale));

        const bars = this.container
        .selectAll(".barGroup")
        .data(filterdata)
        .join("g")
        .attr("class", "barGroup")
        .attr("transform", d => `translate(${this.xScale(d.Channel)}, 0)`);

        bars
        .append("rect")
        .attr("class", "watchTime")
        .attr("x", 0)
        .attr("y", d => this.yScale(d["Watch time(Minutes)"]))
        .attr("width", this.xScale.bandwidth()/2)
        .attr("height", d => this.height - this.yScale(d["Watch time(Minutes)"]))
        .attr("fill", "skyblue");

        bars
        .append("rect")
        .attr("class", "streamTime")
        .attr("x", this.xScale.bandwidth() / 2)
        .attr("y", d => this.yScale(d["Stream time(minutes)"]))
        .attr("width", this.xScale.bandwidth()/2)
        .attr("height", d => this.height - this.yScale(d["Stream time(minutes)"]))
        .attr("fill", "#D0A9F5");

        // 범례 표시
        const legend = this.legend.selectAll(".legend")
        .data(["Watch Time", "Stream Time"])
        .join("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(300, ${this.height + this.margin.bottom / 2 + 10 * i})`);

        legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", this.colorScale);

        legend.append("text")
        .attr("x", 15)
        .attr("y", 8)
        .style("font-size", "10px")
        .text((d) => d);

        this.circles = this.svg.selectAll(".barGroup")
        .data(filterdata)
        .join("rect")
        .on("mouseover", (e,d) => {
            this.tooltip.style("display", "block");
            this.tooltip.select(".tooltip-inner")
            .html(`Channel: ${d["Channel"]} <br/> Watch Time(Days): ${d["Watch time(Minutes)"]}<br /> Stream Time(Hours): ${d["Stream time(minutes)"]}`);
            Popper.createPopper(e.target, this.tooltip.node(), {
                placement: 'top',
                modifiers: [
                    {
                        name: 'arrow',
                        options: {
                            element: this.tooltip.select(".tooltip-arrow").node(),
                        },
                    },
                ],
            });
        })
        .on("mouseout", (d) => {
            this.tooltip.style("display", "none");
        });

    }

}