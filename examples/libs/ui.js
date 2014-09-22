var UI = {};

UI.showInfo = function (params) {

    //var info = document.getElementById("info");
    var info = document.createElement("div");
    document.body.appendChild(info);
    info.style["color"]="#FF0000";
    info.style["position"]="absolute";
    info.style["z-index"]="10000";
    info.style["padding"]="10px";
    info.style["margin-top"]="10px";
    info.style["margin-left"]="10px";
    info.style["background-color"]="black";
    info.style["opacity"]=0.5;
    info.style["opacity"]=0.5;

    var title = document.createElement("h3");
    title.textContent = params.title || "";
    info.appendChild(title);

    var description = document.createElement("p");
    description.textContent = params.description || "";
    info.appendChild(description);
};


