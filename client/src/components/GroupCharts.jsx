"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function GroupCharts({
    data = [],
    title = "Posts per member",
}) {
    const svgRef = useRef(null);

    useEffect(() => {
        const normalizedData = data
            .map((item) => ({
                label: String(
                    item.label || ""
                ),
                value: Number(
                    item.value || 0
                ),
            }))
            .filter(
                (item) =>
                    item.label &&
                    Number.isFinite(
                        item.value
                    )
            );

        const svg = d3.select(
            svgRef.current
        );

        svg.selectAll("*").remove();

        if (normalizedData.length === 0) {
            return;
        }

        const width = 720;
        const height = 360;

        const margin = {
            top: 25,
            right: 25,
            bottom: 80,
            left: 55,
        };

        const chartWidth =
            width -
            margin.left -
            margin.right;

        const chartHeight =
            height -
            margin.top -
            margin.bottom;

        svg.attr(
            "viewBox",
            `0 0 ${width} ${height}`
        )
            .attr("width", "100%")
            .attr("role", "img")
            .attr(
                "aria-label",
                title
            );

        const chart = svg
            .append("g")
            .attr(
                "transform",
                `translate(${margin.left}, ${margin.top})`
            );

        const xScale = d3
            .scaleBand()
            .domain(
                normalizedData.map(
                    (item) =>
                        item.label
                )
            )
            .range([0, chartWidth])
            .padding(0.25);

        const highestValue =
            d3.max(
                normalizedData,
                (item) => item.value
            ) || 0;

        const yScale = d3
            .scaleLinear()
            .domain([
                0,
                Math.max(
                    highestValue,
                    1
                ),
            ])
            .nice()
            .range([
                chartHeight,
                0,
            ]);

        chart
            .append("g")
            .attr(
                "transform",
                `translate(0, ${chartHeight})`
            )
            .call(
                d3.axisBottom(xScale)
            )
            .selectAll("text")
            .attr(
                "transform",
                "rotate(-35)"
            )
            .style(
                "text-anchor",
                "end"
            );

        const yTickCount = Math.max(
            1,
            Math.min(
                highestValue,
                6
            )
        );

        chart
            .append("g")
            .call(
                d3
                    .axisLeft(yScale)
                    .ticks(yTickCount)
                    .tickFormat(
                        d3.format("d")
                    )
            );

        chart
            .selectAll(".skillora-chart-bar")
            .data(normalizedData)
            .join("rect")
            .attr(
                "class",
                "skillora-chart-bar"
            )
            .attr(
                "x",
                (item) =>
                    xScale(
                        item.label
                    )
            )
            .attr(
                "y",
                (item) =>
                    yScale(
                        item.value
                    )
            )
            .attr(
                "width",
                xScale.bandwidth()
            )
            .attr(
                "height",
                (item) =>
                    chartHeight -
                    yScale(
                        item.value
                    )
            )
            .attr("rx", 5);

        chart
            .selectAll(
                ".skillora-chart-value"
            )
            .data(normalizedData)
            .join("text")
            .attr(
                "class",
                "skillora-chart-value"
            )
            .attr(
                "x",
                (item) =>
                    xScale(
                        item.label
                    ) +
                    xScale.bandwidth() /
                        2
            )
            .attr(
                "y",
                (item) =>
                    yScale(
                        item.value
                    ) - 8
            )
            .attr(
                "text-anchor",
                "middle"
            )
            .text(
                (item) =>
                    item.value
            );
    }, [data, title]);

    return (
        <section className="skillora-group-chart">
            <h2>{title}</h2>

            {data.length === 0 ? (
                <p>
                    There is not enough
                    data to display this
                    chart.
                </p>
            ) : (
                <svg ref={svgRef} />
            )}
        </section>
    );
}