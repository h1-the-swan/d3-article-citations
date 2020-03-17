// var CitationVis = CitationVis.NodelinkVisTimeDirected;
// var json_fname = './Climate_change_network.json';
// var json_fname = './data/test_msrc_autoreview_noyearfeature.json';
// var json_fname = './data/test_msrc_autoreview.json';
var json_fname = './data/msrc_seed_papers.json';

d3.json(json_fname, function(error, data) {
	var sel = d3.select("#graph");
	var vis = new CitationVis({element: sel, data: data, width: 1800, height: 1000});
});
