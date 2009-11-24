var initSceneJsHome = function() {
    $(".info").hide();
    $("ul#nav a").click(function() {
        var infoPanel = $("#" + $(this).text().toLowerCase());

        $('ul#nav a').removeClass('active');

        if (infoPanel.is(':visible')) {
            $(".info:visible").slideUp(100);
        }
        else {
            $(".info:visible").slideUp(100);
            $(this).addClass('active');
            $("#" + $(this).text().toLowerCase()).animate({opacity:1}, 100).slideDown(250);
        }
        return false;
    });


    TwitterAPI.Statuses.user_timeline("xeolabs", function(json, status) {
        var content = "";
        $.each(json, function(i) {
            var tweet = chat_string_create_urls(this['text']);
            var tweetDate = get_relative_time(this['created_at']);
            content += "<p class=\"tweets\">" + tweet + " <span class=\"date\">tweeted " + tweetDate + "</span></p>";
        });
        $("#twitter div#tweets").html(content);
    });

    RSSFeed.Entries("http://feeds2.feedburner.com/theezpzway", function(json, status) {
        var content = "";
        $.each(json, function(i) {
            var publishedDate = new Date();
            publishedDate.setTime(Date.parse(this['y:published']['month'] + '/' + this['y:published']['day'] + '/' + this['y:published']['year']));
            var postTitle = "<a href=\"" + this.link + "\">" + this.title + "</a>";

            content += "<p class=\"posts\">" + postTitle + " <span class=\"date\">posted on " + publishedDate.format('F jS, Y') + "</span></p>";
        })

        $("#blog div#posts").html(content);
    });

    //    GitHubAPI.Repos("xeolabs", function(json, status) {
    //        var content = "";
    //        $.each(json, function(i) {
    //            var projectName = "<a href=\"" + this.url + "\">" + this.name + "</a>";
    //            var projectDescription = this.description;
    //            var stats = this.watchers + " watchers";
    //            if (this.forks > 0) {
    //                stats += ", " + this.forks + " forks";
    //            }
    //            content += "<p class=\"project\">" + projectName + " <span class=\"date\">" + stats + "</span><br/>" + projectDescription + "</p>";
    //        });
    //        $("#github #projects").html(content);
    //    });
    //

    GitHubAPI.Commits("xeolabs", "scenejs", function(json, status) {
        var content = "";
        $.each(json, function(i) {
            var committer = "<a href=\"" + this.committer.email + "\">" + this.committer.name + "</a>";
            //            this.author
            //            this.authored_date
            //            this.committed_date
            //            this.committer.email
            //            this.committer.name
            //            this.id
            //            this.message
            
            content += "<div class=\"commit\"><div class=\"signature\"><a href=\"xxx\">" +
                       this.committer.name +
                       "</a> committed <a href=\"\">" +
                       this.id.substring(0, 10) +
                       "</a> " +
                       get_relative_time(this.committed_date) +
                       "</div>" +
                       "<div class=\"message\">&quot;" +
                       this.message.substring(1) +
                       "&quot;</div></div>";
        });
        $("#github-commits-list").html(content);
    });
};