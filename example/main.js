var NodelinkVisTimeDirected = NodelinkVisTimeDirected.NodelinkVisTimeDirected;
var json_fname = './Climate_change_network.json';

d3.json(json_fname, function(error, data) {
	var sel = d3.select("#graph");
	var vis = new NodelinkVisTimeDirected({element: sel, data: data});
});
