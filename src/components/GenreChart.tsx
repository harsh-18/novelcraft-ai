import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NovelConcept } from '../lib/firebase';

interface GenreChartProps {
  concepts: NovelConcept[];
}

function extractGenre(theme: string): string {
  const lowerTheme = theme.toLowerCase();
  if (lowerTheme.includes('fantasy') || lowerTheme.includes('magic') || lowerTheme.includes('dragon')) return 'Fantasy';
  if (lowerTheme.includes('sci-fi') || lowerTheme.includes('space') || lowerTheme.includes('cyberpunk') || lowerTheme.includes('future')) return 'Sci-Fi';
  if (lowerTheme.includes('romance') || lowerTheme.includes('lovers') || lowerTheme.includes('love')) return 'Romance';
  if (lowerTheme.includes('horror') || lowerTheme.includes('scary') || lowerTheme.includes('ghost')) return 'Horror';
  if (lowerTheme.includes('mystery') || lowerTheme.includes('detective') || lowerTheme.includes('murder')) return 'Mystery';
  if (lowerTheme.includes('thriller') || lowerTheme.includes('suspense')) return 'Thriller';
  return 'Mixed/Other';
}

export function GenreChart({ concepts }: GenreChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current || concepts.length === 0) return;

    // Process data
    const genreCounts = d3.rollup(
      concepts,
      (v) => v.length,
      (d) => extractGenre(d.theme)
    );

    const data = Array.from(genreCounts, ([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);

    // Dimensions
    const width = wrapperRef.current.clientWidth;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous render
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.genre))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Axes
    const xAxis = d3.axisBottom(x).tickSizeOuter(0);
    const yAxis = d3.axisLeft(y).ticks(Math.min(5, d3.max(data, d => d.count) || 5)).tickFormat(d3.format('d'));

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('class', 'font-sans text-[10px] uppercase tracking-widest font-bold fill-[#1a1a1a]')
      .attr('y', 15);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .attr('class', 'font-sans text-[10px] font-bold fill-gray-500');

    // Style axis paths and lines
    g.selectAll('.domain').attr('stroke', '#1a1a1a').attr('stroke-width', 2);
    g.selectAll('.tick line').attr('stroke', '#1a1a1a');

    // Grid lines for y-axis
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('.tick line')
      .attr('stroke', '#f3f4f6')
      .attr('stroke-dasharray', '2,2');
    
    g.selectAll('.grid .domain').remove();

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.genre) || 0)
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.count))
      .attr('fill', '#1a1a1a')
      .attr('opacity', 0.9)
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.9);
      });

    // Bar labels
    g.selectAll('.label')
      .data(data)
      .enter().append('text')
      .attr('class', 'label')
      .attr('x', d => (x(d.genre) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.count) - 5)
      .attr('text-anchor', 'middle')
      .attr('class', 'font-serif text-[10px] font-bold fill-[#1a1a1a]')
      .text(d => d.count);

  }, [concepts]);

  // Re-render on window resize
  useEffect(() => {
    const handleResize = () => {
      // Trigger a tiny state update to re-run the chart effect, or we can just rely on wrapperRef width.
      // D3 will redraw when the effect runs again, but React won't re-run the effect unless dependencies change.
      // Easiest is to force a re-render.
      window.dispatchEvent(new Event('d3-resize'));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="bg-white border border-[#1a1a1a] p-8 mb-8" ref={wrapperRef}>
      <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4 mb-6">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Genre Distribution</h3>
        <span className="text-[10px] font-serif italic text-gray-400">{concepts.length} Concepts Analyzed</span>
      </div>
      <svg ref={svgRef} className="w-full overflow-visible"></svg>
    </div>
  );
}
