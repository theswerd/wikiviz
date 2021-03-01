console.log("Welcome to WikiViz");

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

document.getElementById("depth").addEventListener("input", (event) => {
  if (event.target.value < 1) {
    event.target.value = 1;
  } else if (event.target.value > 6) {
    event.target.value = 6;
  }
});

let getConnections = () => {
  if (document.getElementById("getConnections").className == "enabled") {
    const url = document.getElementById("baseURL").value;

    console.log(url);

    const loading = document.getElementById("loadingMessage");
    loading.innerText = "Loading " + url;
    fetch(
      "https://en.wikipedia.org/w/api.php?action=query&generator=links&gpllimit=500&origin=*&format=json&formatversion=2&titles=" +
        url,
      {
        method: "GET",
      }
    )
      .then((response) => response.json())
      .then((json) => {
                  loading.innerText = "Loaded: " + json;

        console.log(json);
      })
      .catch((error) => {
        loading.innerText = "Unable to load: " + error.message;
        console.log(error.message);
      });
  }
};
