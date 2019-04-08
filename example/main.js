var NodelinkVisTimeDirected = NodelinkVisTimeDirected.NodelinkVisTimeDirected;
var json_fname = './Climate_change_network.json';

d3.json(json_fname, function(error, data) {
	NodelinkVisTimeDirected(data);
});
