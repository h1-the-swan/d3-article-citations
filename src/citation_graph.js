import * as d3 from 'd3';
import jQuery from 'jquery';
const $ = jQuery;

class CitationVis {
	constructor(opts = {}) {
		const defaults = {
			element: null,
			data: null,
			width: 960,
			// color: d3.scaleOrdinal(d3.schemeCategory10),
			// forceStrength: -2,
		};
		Object.assign(this, defaults, opts);  // opts will overwrite defaults
		this._data = this.data;
		this.data = this.updateData;
		if (typeof this.height === 'undefined' || this.height === null) {
			this.height = Math.floor(.4167 * this.width);
		}
		// this.manyBody = d3.forceManyBody()
		// 					.strength(this.forceStrength);
		this.init = false;
		console.log(this._data);
		if (this.element !== null && this._data !== null) {
			this.draw(this.element);
			this.init = true;
		}
	}

	updateData(value) {
		if (!arguments.length) return this._data;
		this._data = value;
		if (this.init === false) {
			this.draw(this.element);
			this.init = true;
		} else {
			// this.updateData();
			// NOT IMPLEMENTED
			console.log("UPDATING DATA NOT YET IMPLEMENTED");
		}
		// console.log(typeof updateData);
		// if (typeof updateData === 'function') updateData();
		return this;
	};

	draw(selection) {
		var obj = this;
		var w = this.width;
		var h = this.height;
		var data = this._data;
		selection.each(function() {
			var selItem = this;

			console.log(graph);

			var opacityVals = {
				'nodeNormal': 1,
				'nodeFaded': .1,
				'linkNormal': .6,
				'linkFaded': .05
			}
			var efScale = d3.scale.linear()
				// .domain(d3.extent(data.nodes, function(d) { return d.eigenfactor_score; }))
				.domain(d3.extent(data.nodes, function(d) { return d.node_rank; }))
				.range([0, 10]);

			var force = d3.layout.force()
				.charge(-100)
				.linkDistance(80)
				.size([w,h]);
			// http://stackoverflow.com/questions/17953106/why-does-d3-js-v3-break-my-force-graph-when-implementing-zooming-when-v2-doesnt/17976205#17976205
			var drag = force.drag()
				.on("dragstart", function() { d3.event.sourceEvent.stopPropagation(); });

			console.log(data);
			// get links as references
			// https://stackoverflow.com/questions/16824308/d3-using-node-attribute-for-links-instead-of-index-in-array
			var links = [];
			data.links.forEach(function(e) { 
				// Get the source and target nodes
				var sourceNode = data.nodes.filter(function(n) { return n.id === e.source; })[0],
					targetNode = data.nodes.filter(function(n) { return n.id === e.target; })[0];

				// Add the edge to the array
				links.push({source: sourceNode, target: targetNode});
			});
			console.log(links);
			force.nodes(data.nodes)
				// .links(data.links)
				.links(links)
				.start();

			var chart = d3.select(selItem)
				.append("svg")
				.attr("width", w)
				.attr("height", h)
				.attr("class", "chart");
			// http://bl.ocks.org/tomgp/d59de83f771ca2b6f1d4
			chart.append("defs").append("marker")
				.attr({
					"id": "arrow",
					"viewBox": "0 -5 10 10",
					"refX": 15,
					"refY": 0,
					"markerWidth": 8,
					"markerHeight": 8,
					"orient": "auto"
				})
				.append("path")
			// .attr("d", "M0,-5L10,0L0,5 L10,0 L0, -5")
				.attr("d", "M0,-5L10,0L0,5")
				.attr("class", "arrowHead");

			var group = chart.append("g");

			var link = group.selectAll(".link")
				// .data(data.links)
				.data(links)
				.enter().append("line")
				.attr("class", "link")
			// draw arrowhead (see defs above)
				.style("marker-end", "url(#arrow)")
				.style("opacity", opacityVals.linkNormal);

			var node = group.selectAll(".nodeG")
				.data(data.nodes)
				.enter().append("g");
			node.append("circle")
				.attr("class", "node")
				.attr("r", function(d) {
					// d.radius = 2 + efScale(d.eigenfactor_score);
					d.radius = 2 + efScale(d.node_rank);
					return d.radius;
				})
				.style("fill", "darksalmon")
			// .call(force.drag);
				.call(drag);

			node.attr("title", function(d) {
				// for tooltip
				var text = d.title
					+ ", "
					// + d.authors.join(", ")
					+ d.display_authors
					+ ", "
					+ d.venue
					+ ", "
					+ d.year;
				return text;
			});

			// force.on("tick", function() {
			// 	link.attr("x1", function(d) { return d.source.x; })
			// 		.attr("y1", function(d) { return d.source.y; })
			// 		.attr("x2", function(d) { return d.target.x; })
			// 		.attr("y2", function(d) { return d.target.y; });
			// 	
			// 	// node.attr("cx", function(d) { return d.x; })
			// 	// 	.attr("cy", function(d) { return d.y; });
			// 	node.attr("transform", function(d) {
			// 		return "translate(" + d.x + "," + d.y + ")";
			// 	});
			// });
			// force.on("tick", tick);
			force.on("tick", function() {
				tick();
			});

			function tick(dur) {
				if (typeof dur === 'undefined') {
					dur = 0;
				}
				link.transition().duration(dur)
					.attr("x1", function(d) { return d.source.x; })
					.attr("y1", function(d) { return d.source.y; })
					.attr("x2", function(d) { return d.target.x; })
					.attr("y2", function(d) { return d.target.y; });

				// node.attr("cx", function(d) { return d.x; })
				// 	.attr("cy", function(d) { return d.y; });
				node.transition().duration(dur)
					.attr("transform", function(d) {
						return "translate(" + d.x + "," + d.y + ")";
					});
			}

			var label = node.append("text")
				.attr("class", "nodeLabel")
				.text(function(d) {
					// var AuthorName = d.authors[0].split(" ").slice(-1);
					// var AuthorName = d.display_authors;
					// var AuthorName = "";
					var AuthorName = d.display_authors.split(",")[0].split(" ").slice(-1)[0]; // last name of first author
					return AuthorName + "," + d.year;
				});

			// http://stackoverflow.com/questions/8739072/highlight-selected-node-its-links-and-its-children-in-a-d3-force-directed-grap
			var linkedByIndex = {};
			link.each(function(d) {
				linkedByIndex[d.source.index + "," + d.target.index] = 1;
			});
			function neighboring(a, b) {
				return linkedByIndex[a.index + "," + b.index];
			}

			var zoom = d3.behavior.zoom().scaleExtent([.85,10]).on("zoom", zoomed);
			chart.call(zoom)
				.call(zoom.event)
				.on("dblclick.zoom", null);
			// chart.call(d3.behavior.zoom()
			// 	.scaleExtent([.85,10])
			// 	.on('zoom', zoomed)
			// );
			function zoomed() {
				// console.log(d3.event);
				group.attr(
					'transform',
					'translate(' + d3.event.translate + ')' +
					'scale(' + d3.event.scale + ')'
				);
				d3.selectAll(".node")
					.attr("r", function(d) {return d.radius/d3.event.scale;})
					.style("stroke-width", 1/d3.event.scale);
				d3.selectAll(".link")
					.style("stroke-width", 1/d3.event.scale);
				d3.selectAll(".nodeLabel")
					.style("font-size", function(d) {console.log((.4/(Math.sqrt(d3.event.scale))) + "em"); return (.6/(Math.sqrt(d3.event.scale))) + "em";});
			}
			function zoom2(x, y) {
				// console.log(d3.event);
				group.attr(
					'transform',
					'translate(485,307)' +
					'scale(1.5)'
				);
				d3.selectAll(".node")
					.attr("r", function(d) {return d.radius/d3.event.scale;})
					.style("stroke-width", 1/d3.event.scale);
				d3.selectAll(".link")
					.style("stroke-width", 1/d3.event.scale);
				d3.selectAll(".nodeLabel")
					.style("font-size", function(d) {console.log((.4/(Math.sqrt(d3.event.scale))) + "em"); return (.6/(Math.sqrt(d3.event.scale))) + "em";});
			}
			// node.on("mouseover", function(d) {
			// 		d3.selectAll(".nodeLabel").remove();
			// 		d3.select(this).append("text")
			// 			.text(d.title + ", " + d.year)
			// 			.attr("class", "nodeLabel")
			// 			.on("click", function(dd) {
			// 				var url = "http://labs.jstor.org" + d.stable_url;
			// 				window.open(url,'_blank');
			// 			});
			// 	});

			// Add a checkbox to remove links:
			d3.select("#linksCheckBox").on("change", linksCheckBoxChange);
			// $( '.link' ).addClass( 'hidden' );
			// $('line').addClass('dd');

			function linksCheckBoxChange() {
				// note: modifying SVG classes only works in jQuery 3+
				// TODO: updating jQuery broke jQuery UI. need to try updating jQuery UI
				$( '.link' ).toggleClass( 'hidden' );
			}

			// Only show links to/from selected node on mouseover
			node.on("mouseover", function(d) {
				$( '.link' ).addClass( 'hidden' );
				link.filter(function(dd) { return dd.source===d || dd.target===d; })
					.each(function(dd) { $( this ).removeClass( 'hidden' ); });
			})
				.on("mouseout", function(d) {
					if ($( '#linksCheckBox' ).is( ':checked' )) {
						$( '.link' ).removeClass( 'hidden' );
					} else {
						$( '.link' ).addClass('hidden');
					}
				})
			// .on("click", clicked);
				.on("dblclick", clicked);

			function clicked(d) {
				var x = d.x,
					y = d.y,
					scale = 3,
					translate = [w / 2 - scale * x, h / 2 - scale * y];
				chart.transition().duration(750)
					.call(zoom.translate(translate).scale(scale).event);
				link.style("opacity", opacityVals.linkFaded)
					.filter(function(dd) { return dd.source===d || dd.target===d; })
					.style("opacity", opacityVals.linkNormal);
				node.style("opacity", function(dd) {
					return neighboring(d, dd) || neighboring(dd, d) ? opacityVals.nodeNormal : opacityVals.nodeFaded;
				});
				// also highlight clicked node:
				d3.select(this).style("opacity", opacityVals.nodeNormal);
				var nudge = 50;
				node.each(function(dd) {
					if (neighboring(dd, d)) {
						dd.x = d.x + nudge;
					} else if (neighboring(d, dd)) {
						dd.x = d.x - nudge;
					}
					// force.tick();
					// return "translate(" + dd.x + "," + dd.y + ")";
				});
				tick(1000);
				force.stop();
				d3.event.stopPropagation();
			}

			d3.select("#testButton").on("click", function() {
				// chart.call(d3.behavior.zoom().translate([5,5], 1.5).scale(1.5).event);
				//
				// manual zoom
				// http://bl.ocks.org/mbostock/9656675
				chart.transition().duration(750)
				// .call(zoom.translate([5,5], 1.5).scale(1.5).event);
					.call(zoom.translate([5,5]).scale(1.5).event);
			});	
			chart.on("click", function() {
				// console.log(d3.event);
			});

			var resetButton = d3.select("body").append("button")
				.text("resetButton")
				.on("click", resetChart);

			chart.on("dblclick", resetChart);

			function resetChart() {
				chart.transition().duration(750)
					.call(zoom.translate([0,0]).scale(1).event);
				node.style("opacity", opacityVals.nodeNormal);
				link.style("opacity", opacityVals.linkNormal);
				force.start();
			}

		});
		return this;
	}

}

// export { CitationVis };
export default CitationVis;
