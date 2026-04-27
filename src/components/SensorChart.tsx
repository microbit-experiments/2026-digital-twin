import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import * as d3 from "d3";
import { useEffect, useId, useRef, useState } from "react";

export type SensorPoint = {
  time: number;
  x: number;
  y: number;
  z: number;
};

type SensorChartProps = {
  data: SensorPoint[];
  title: string;
  maxVal: number;
  showLegend?: boolean;
};

export function SensorChart({ data, title, maxVal, showLegend = true }: SensorChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const clipId = useId().replace(/:/g, "");

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const width = Math.floor(entries[0]?.contentRect.width ?? 0);
      setChartWidth(width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || chartWidth <= 0) return;

    const height = 160;
    const margin = { top: 12, right: 18, bottom: 24, left: 42 };
    const innerWidth = Math.max(chartWidth - margin.left - margin.right, 1);
    const innerHeight = Math.max(height - margin.top - margin.bottom, 1);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", chartWidth).attr("height", height).attr("viewBox", `0 0 ${chartWidth} ${height}`);

    if (data.length === 0) {
      svg
        .append("text")
        .attr("x", chartWidth / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#718096")
        .style("font-size", "13px")
        .text("Waiting for accelerometer samples...");
      return;
    }

    const maxTime = data[data.length - 1]?.time ?? Date.now();
    const minTime = Math.max(data[0]?.time ?? maxTime, maxTime - 30_000);
    const xScale = d3
      .scaleLinear()
      .domain([minTime, maxTime === minTime ? minTime + 1000 : maxTime])
      .range([margin.left, margin.left + innerWidth]);

    const yScale = d3.scaleLinear().domain([-maxVal, maxVal]).range([margin.top + innerHeight, margin.top]);

    const xAxis = d3.axisBottom(xScale).ticks(0).tickSize(0);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    svg
      .append("g")
      .attr("transform", `translate(0, ${margin.top + innerHeight})`)
      .call(xAxis)
      .call((g) => g.selectAll("path,line").attr("stroke", "#A0AEC0"));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis)
      .call((g) => g.selectAll("text").attr("fill", "#4A5568"))
      .call((g) => g.selectAll("path,line").attr("stroke", "#A0AEC0"));

    const line = (key: "x" | "y" | "z") =>
      d3
        .line<SensorPoint>()
        .x((d) => xScale(d.time))
        .y((d) => yScale(d[key]))
        .curve(d3.curveMonotoneX);

    const series = [
      { key: "x" as const, color: "#E53E3E" },
      { key: "y" as const, color: "#3182CE" },
      { key: "z" as const, color: "#38A169" },
    ];

    const defs = svg.append("defs");
    defs
      .append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("x", margin.left + 2)
      .attr("y", margin.top)
      .attr("width", innerWidth - 2)
      .attr("height", innerHeight);

    const plotGroup = svg.append("g").attr("clip-path", `url(#${clipId})`);

    for (const item of series) {
      plotGroup
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", item.color)
        .attr("stroke-width", 2)
        .attr("d", line(item.key));
    }
  }, [chartWidth, clipId, data]);

  return (
    <Box ref={containerRef} w="100%">
      <Heading size="sm" mb={2} color="gray.700">
        {title}
      </Heading>
      <svg ref={svgRef} role="img" aria-label={`${title} graph for x y and z values over time`} />
      {showLegend && (
        <Flex gap={4} mt={2} justify="center" fontSize="sm" color="gray.600">
          <Text>
            <Box as="span" display="inline-block" w="10px" h="10px" bg="#E53E3E" borderRadius="full" mr={2} />
            x
          </Text>
          <Text>
            <Box as="span" display="inline-block" w="10px" h="10px" bg="#3182CE" borderRadius="full" mr={2} />
            y
          </Text>
          <Text>
            <Box as="span" display="inline-block" w="10px" h="10px" bg="#38A169" borderRadius="full" mr={2} />
            z
          </Text>
        </Flex>
      )}
    </Box>
  );
}
