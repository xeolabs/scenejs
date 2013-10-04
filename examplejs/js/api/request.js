var request = new (function () {

    var prevHash;
    var hashParams;

    var searchParams;

    this.getHashStr = function() {
        return window.location.hash;
    };

    /**
     * Get all hash parameters
     */
    this.getHashParams = function () {
        if (!hashParams || prevHash != window.location.hash) {
            hashParams = {};
            var stringAfterHash = window.location.hash.slice(1);
            var paramsAfterHash = stringAfterHash.split('|');
            var tokens;
            for (var i = 0, len = paramsAfterHash.length; i < len; i++) {
                tokens = paramsAfterHash[i].split("=");
                hashParams[tokens[0]] = tokens[1];
            }
            prevHash = window.location.hash;
        }
        return hashParams;
    };

    /**
     * Get a selected hash parameter
     */
    this.getHashParam = function (key) {
        if (!hashParams || prevHash != window.location.hash) {
            this.getHashParams();
        }
        return hashParams[key];
    };

    this.getSearchStr = function() {
        return window.location.search;
    };

    /**
     * Get all search parameters
     */
    this.getSearchParams = function () {
        if (!searchParams) {
            searchParams = {};
            var search = window.location.search.slice(1);
            var params = search.split('&');
            var tokens;
            for (var i = 0, len = params.length; i < len; i++) {
                tokens = params[i].split("=");
                searchParams[tokens[0]] = tokens[1];
            }
        }
        return searchParams;
    };

    /**
     * Get a selected search parameter
     */
    this.getSearchParam = function (key) {
        if (!searchParams) {
            this.getSearchParams();
        }
        return searchParams[key];
    };

})();