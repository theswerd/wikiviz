var graph;
var simulation;

window.onload = () => {
  document.getElementById("graphic").setAttribute("width", window.innerWidth);
  document.getElementById("graphic").setAttribute("height", window.innerHeight);
};

window.onresize = () => {
  document.getElementById("graphic").setAttribute("width", window.innerWidth);
  document.getElementById("graphic").setAttribute("height", window.innerHeight);
};

document.getElementById("baseURL").addEventListener("input", (event) => {
  if (event.target.value.startsWith("https://en.wikipedia.org/wiki/")) {
    event.target.value = event.target.value.replace(
      "https://en.wikipedia.org/wiki/",
      ""
    );
  }
  event.target.size =
    event.target.value.length < 10 ? 10 : event.target.value.length;

  if (event.target.value.length >= 1) {
    document.getElementById("getConnections").className = "enabled";
  } else {
    document.getElementById("getConnections").className = "disabled";
  }
});

let getConnections = () => {
  if (document.getElementById("getConnections").className == "enabled") {
    const id = document.getElementById("baseURL").value;

    console.log(id);
    document.getElementById("enter_url").style.display = "none";

    const loading = document.getElementById("loadingMessage");
    loading.innerText = "";

    setGraph(id)
    
  }
};

let resetGraph = () => {
  graph = {
    links: [],
    nodes: [],
  };
  document.getElementById("graphic").innerHTML = "";
};

let setGraph = (id) => {
  fetch(
    "https://en.wikipedia.org/w/api.php?action=query&titles=Title&prop=links&pllimit=max&gpllimit=500&origin=*&format=json&formatversion=2&titles=" +
      id,
    {
      method: "GET",
    }
  )
    .then((response) => response.json())
    .then((json) => {
      console.log(json);

      resetGraph();

      graph.nodes.push({
        id: json.query.pages[0].title,
        group: 1,
      });

      for (index in json.query.pages[0].links) {
        console.log(index);
        graph.nodes.push({
          id: json.query.pages[0].links[index].title,
          group: 2,
        });
        graph.links.push({
          source: json.query.pages[0].title,
          target: json.query.pages[0].links[index].title,
          value: 1,
        });
      }

      var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

      var color = d3.scaleOrdinal(d3.schemeCategory20);

      simulation = d3
        .forceSimulation()
        .force(
          "link",
          d3.forceLink().id(function (d) {
            return d.id;
          })
        )
        .force("charge", d3.forceManyBody().strength(-1000))
        .force("center", d3.forceCenter(width / 2, height / 2));

      var link = svg
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("stroke-width", function (d) {
          return Math.sqrt(d.value);
        });

      var node = svg
        .append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter()
        .append("g");

      var circles = node
        .append("circle")
        .attr("r", 5)
        .attr("fill", function (d) {
          return color(d.group);
        })
        .on("mousedown", nodeClicked)
        .call(
          d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

      var lables = node
        .append("text")
        .text(function (d) {
          return d.id;
        })
        .attr("x", 6)
        .attr("y", 3);

      node.append("title").text(function (d) {
        return d.id;
      });

      simulation.nodes(graph.nodes).on("tick", ticked);

      simulation.force("link").links(graph.links);

      function ticked() {
        link
          .attr("x1", function (d) {
            return d.source.x;
          })
          .attr("y1", function (d) {
            return d.source.y;
          })
          .attr("x2", function (d) {
            return d.target.x;
          })
          .attr("y2", function (d) {
            return d.target.y;
          });

        node.attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
      }

      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function nodeClicked(d) {
        console.log(d);
        setGraph(d.id)
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      console.log(json);
    })
    .catch((error) => {
      loading.innerText = "Unable to load: " + error.message;
      console.log(error.message);
    });
};
