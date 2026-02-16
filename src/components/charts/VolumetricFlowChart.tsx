import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AggregateResult } from '../../model/types';

export interface ChartAnnotation {
    x: number; // Timestep
    label: string;
    color?: string;
    type?: 'event' | 'milestone' | 'warning';
}

interface VolumetricFlowChartProps {
    data: AggregateResult[];
    width?: number;
    height?: number;
    annotations?: ChartAnnotation[];
}

export const VolumetricFlowChart: React.FC<VolumetricFlowChartProps> = ({
    data,
    width = 800,
    height = 400,
    annotations = []
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!data || data.length === 0 || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous render

        const margin = { top: 20, right: 30, bottom: 30, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // X Scale: Time
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, (d: AggregateResult) => d.t) || 0])
            .range([0, innerWidth]);

        // Y Scale: Volume (Minted vs Burned)
        const yMax = d3.max(data, (d: AggregateResult) => Math.max(d.dailyMintUsd.mean, d.dailyBurnUsd.mean)) || 1000;
        const y = d3.scaleLinear()
            .domain([0, yMax])
            .range([innerHeight, 0]);

        // Area Generators
        const areaMint = d3.area<AggregateResult>()
            .x(d => x(d.t))
            .y0(innerHeight)
            .y1(d => y(d.dailyMintUsd.mean))
            .curve(d3.curveMonotoneX);

        const areaBurn = d3.area<AggregateResult>()
            .x(d => x(d.t))
            .y0(innerHeight)
            .y1(d => y(d.dailyBurnUsd.mean))
            .curve(d3.curveMonotoneX);

        // Draw Mint Area (Supply Expansion)
        g.append("path")
            .datum(data)
            .attr("fill", "rgba(52, 211, 153, 0.3)") // Green-ish
            .attr("stroke", "#34D399")
            .attr("stroke-width", 1.5)
            .attr("d", areaMint);

        // Draw Burn Area (Deflationary Pressure)
        g.append("path")
            .datum(data)
            .attr("fill", "rgba(239, 68, 68, 0.3)") // Red-ish
            .attr("stroke", "#EF4444")
            .attr("stroke-width", 1.5)
            .attr("d", areaBurn);

        // Axes
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d => `Week ${d}`));

        g.append("g")
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${d}`));

        // Labels
        g.append("text")
            .attr("x", innerWidth - 10)
            .attr("y", y(data[data.length - 1].dailyMintUsd.mean) - 5)
            .attr("text-anchor", "end")
            .attr("fill", "#34D399")
            .style("font-size", "12px")
            .text("Minted Value (Incentives)");

        g.append("text")
            .attr("x", innerWidth - 10)
            .attr("y", y(data[data.length - 1].dailyBurnUsd.mean) - 5)
            .attr("text-anchor", "end")
            .attr("fill", "#EF4444")
            .style("font-size", "12px")
            .text("Burned Value (Revenue)");

        // --- ANNOTATIONS ---
        annotations.forEach(note => {
            const xPos = x(note.x);
            const color = note.color || '#FBBF24'; // Warning Yellow default

            // Line
            g.append("line")
                .attr("x1", xPos)
                .attr("x2", xPos)
                .attr("y1", 0)
                .attr("y2", innerHeight)
                .attr("stroke", color)
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "4,4");

            // Label Background
            const text = g.append("text")
                .attr("x", xPos + 5)
                .attr("y", 15)
                .attr("fill", color)
                .style("font-size", "10px")
                .style("font-weight", "bold")
                .text(note.label);
        });

    }, [data, width, height, annotations]);

    return <svg ref={svgRef} width={width} height={height} className="rounded-lg border bg-card/50 shadow-sm" />;
};
