function _truncateURL(url) {
    var parts = url.split("/");
    var path;
    if (parts.length <= 4) {
        path = url;
    } else {
        path = "";
        for (var i = 0; i < 3; i++) {
            path += parts[i] + "/";
        }
        path += "..." + url.substring(url.lastIndexOf("/"));
    }
    return path;
}