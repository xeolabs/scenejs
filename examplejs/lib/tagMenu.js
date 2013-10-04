var TagMenu = function (element, cfg) {
        var tags = cfg.tags;
        var selectedTags = cfg.selectedTags || {};
        var selection = cfg.selection;
        var tagElems = {};

        var tagList = [];
        for (var tag in tags) {
            if (tags.hasOwnProperty(tag)) {
                tagList.push(tag);
            }
        }
        tagList.sort(function (a, b) {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        });

        for (var i = 0, len = tagList.length; i < len; i++) {
            var tag = tagList[i];
            var selected = !!selectedTags[tag];

            var elem = $("<div>" + tag + "</div>");
            elem.css({
                "user-select":"none",
                "cursor":"pointer",
                "-moz-border-radius":"1px",
                "border-radius":"1px",
                "color":selected ? "#226622" : "#777777",
                "float":"left",
                "padding-left":"3px",
                "padding-right":"3px",
                "padding-top":"1px",
                "padding-bottom":"1px",
                background:selected ? "#ccFFcc" : "#f5f5f5",
                margin:"3px",
                "margin-left":"5px",
                border:selected ? "1px solid rgb(101, 184, 101)" : "1px solid #DDDADA"
//                ,
//                width:"auto"
            });
            element.append(elem);

            (function () {
                var _tag = tag;
                var _elem = elem;
                elem.click(function (e) {
                    e.preventDefault();
                    var selected = !selectedTags[_tag];
                    selectedTags[_tag] = selected;
                    _elem.css({
                        background:selected ? "#ccFFcc" : "#f5f5f5",
                        border:selected ? "1px solid rgb(101, 184, 101)" : "1px  solid #DDDADA",
                        "color":selected ? "#226622" : "#444444"

                    });
                    selection(selectedTags);
                });
            })();

            tagElems[tag] = elem;
        }

        element.append("<div style='clear: left;'></div>");

        this.selectAll = function () {
            setSelected(true);
        };

        this.deselectAll = function () {
            setSelected(false);
        };

        this.select = function(tags) {
            var selected;
            for (var tag in tagElems) {
                if (tagElems.hasOwnProperty(tag)) {
                    selected = !!tags[tag];
                    tagElems[tag].css({
                        background:selected ? "#ccFFcc" : "#f5f5f5",
                        border:selected ? "1px solid rgb(101, 184, 101)" : "1px  solid #DDDADA",
                        "color":selected ? "#226622" : "#444444"
                    });
                    selectedTags[tag] = selected;
                }
            }
            //selection(selectedTags);
        };

        function setSelected(selected) {
            for (var tag in tagElems) {
                if (tagElems.hasOwnProperty(tag)) {
                    tagElems[tag].css({
                        background:selected ? "#ccFFcc" : "#f5f5f5",
                        border:selected ? "1px solid rgb(101, 184, 101)" : "1px  solid #DDDADA",
                        "color":selected ? "#226622" : "#444444"
                    });
                    selectedTags[tag] = selected;
                }
            }
            selection(selectedTags);
        }
    }
    ;