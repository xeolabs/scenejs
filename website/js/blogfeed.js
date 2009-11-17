/** Loads a post list from the SceneJS blog into the given page element
 *
 * @param elementId
 */
var SceneJsWeb = {};

SceneJsWeb.getBlogPosts = function(elementId) {
    var content = document.getElementById(elementId);
    var bloggerService = new google.gdata.blogger.BloggerService('com.appspot.interactivesampler');
    var feedUri = 'http://www.blogger.com/feeds/7777974556843437542/posts/default';

    var handleBlogPostFeed = function(postsFeedRoot) {
        var posts = postsFeedRoot.feed.getEntries();
        var html = '';


        //        html += '<dl>'
        //                + '<dt><strong>Blog:</strong> '
        //                + '<a href="'
        //                + postsFeedRoot.feed.getLink('alternate').getHref()
        //                + '">'
        //                + postsFeedRoot.feed.getTitle().getText()
        //                + '</a></dt>';


        for (var i = 0, post; post = posts[i]; i++) {
            var postTitle = post.getTitle().getText();
            var postURL = post.getHtmlLink().getHref();
            var published = post.getPublished();

            html += '<div id="blogPost" style="display: block;">' +
                    '<div id="blogPostHeader"><a href="' + postURL + '">' + postTitle + '</a></div>' +
                    '<div id="blogPostDate">' + published.getValue().getDate() + ' </div>';

        }
        content.innerHTML = html;
    };

    var handleError = function(error) {
        content.innerHTML = '<pre>' + error + '</pre>';
    };

    bloggerService.getBlogPostFeed(feedUri, handleBlogPostFeed, handleError);
}