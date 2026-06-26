"use client";

import {
    useEffect,
    useMemo,
    useRef,
} from "react";

import * as d3 from "d3";

export default function GroupActivityChart({
    data = [],
    title = "Posts over time",
    averageValue = null,
}) {
    const svgRef = useRef(null);

    const totalPosts = useMemo(
        () =>
            data.reduce(
                (total, item) =>
                    total +
                    Number(item.value || 0),
                0
            ),
        [data]
    );

    useEffect(() => {
        const normalizedData = data.map(
            (item) => ({
                label: String(
                    item.label || ""
                ),
                value: Number(
                    item.value || 0
                ),
            })
        );

        const svg = d3.select(
            svgRef.current
        );

        svg.selectAll("*").remove();

        if (normalizedData.length === 0) {
            return;
        }

        const width = 760;
        const height = 370;

        const margin = {
            top: 30,
            right: 45,
            bottom: 65,
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

        const labels =
            normalizedData.map(
                (item) => item.label
            );

        const xScale = d3
            .scaleBand()
            .domain(labels)
            .range([0, chartWidth])
            .padding(0.2);

        const highestValue =
            d3.max(
                normalizedData,
                (item) => item.value
            ) || 0;

        const numericAverage =
            averageValue === null
                ? null
                : Number(averageValue);

        const yMaximum = Math.max(
            highestValue,
            Number.isFinite(
                numericAverage
            )
                ? numericAverage
                : 0,
            1
        );

        const yScale = d3
            .scaleLinear()
            .domain([0, yMaximum])
            .nice()
            .range([
                chartHeight,
                0,
            ]);

        const tickStep =
            normalizedData.length > 20
                ? 3
                : normalizedData.length >
                    10
                  ? 2
                  : 1;

        const visibleLabels =
            labels.filter(
                (_, index) =>
                    index % tickStep ===
                    0
            );

        chart
            .append("g")
            .attr(
                "transform",
                `translate(0, ${chartHeight})`
            )
            .call(
                d3
                    .axisBottom(xScale)
                    .tickValues(
                        visibleLabels
                    )
            );

        const yTickCount = Math.max(
            1,
            Math.min(
                Math.ceil(yMaximum),
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
            .selectAll(
                ".skillora-activity-bar"
            )
            .data(normalizedData)
            .join("rect")
            .attr(
                "class",
                "skillora-activity-bar"
            )
            .attr(
                "x",
                (item) =>
                    xScale(item.label)
            )
            .attr(
                "y",
                (item) =>
                    yScale(item.value)
            )
            .attr(
                "width",
                xScale.bandwidth()
            )
            .attr(
                "height",
                (item) =>
                    chartHeight -
                    yScale(item.value)
            )
            .attr("rx", 4);

        if (
            Number.isFinite(
                numericAverage
            )
        ) {
            const averageY =
                yScale(numericAverage);

            chart
                .append("line")
                .attr(
                    "class",
                    "skillora-chart-average-line"
                )
                .attr("x1", 0)
                .attr(
                    "x2",
                    chartWidth
                )
                .attr(
                    "y1",
                    averageY
                )
                .attr(
                    "y2",
                    averageY
                );

            chart
                .append("text")
                .attr(
                    "class",
                    "skillora-chart-average-label"
                )
                .attr(
                    "x",
                    chartWidth
                )
                .attr(
                    "y",
                    averageY - 8
                )
                .attr(
                    "text-anchor",
                    "end"
                )
                .text(
                    `Average: ${numericAverage.toFixed(
                        2
                    )}`
                );
        }
    }, [
        data,
        title,
        averageValue,
    ]);

    return (
        <section className="skillora-group-chart">
            <h2>{title}</h2>

            <p className="skillora-chart-summary">
                Total posts:{" "}
                <strong>
                    {totalPosts}
                </strong>

                {averageValue !== null && (
                    <>
                        {" "}
                        · Daily average:{" "}
                        <strong>
                            {Number(
                                averageValue
                            ).toFixed(2)}
                        </strong>
                    </>
                )}
            </p>

            {data.length === 0 ? (
                <p>
                    There is not enough
                    activity to display.
                </p>
            ) : (
                <svg ref={svgRef} />
            )}
        </section>
    );
}