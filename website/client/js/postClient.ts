/**
 * A class to represent communication the user's view (UI with posts)
 * to the server
 */
class PostClient {

    /**
     * Static members
     */
    private static host = "http://localhost:5000";
    private static routes = {
        // Send posts to this route
        post: "/post",
        // Retrieve posts from this route
        retrieve: function (lastPostId: string) {
            return "/posts/" + lastPostId;
        }
    };
    private static retrievalCycleMs = 250;
    private static scrollMs = 1500;

    /**
     * Private members
     */
    private ui: UI;
    private webcam: Webcam;
    private stream: any;
    private input: any;
    private shareButton: any;
    private currentPostId = "";
    private lastAuthor = "";
    private lastAuthorChainPostId = "";

    /**
     * Create a PostClient instance
     * @param ui UI object to display posts
     * @param webcam Webcam object to access image
     * @param streamId ID of the stream's HTML element
     * @param inputId ID of the input textarea's HTML element
     * @param shareButtonId ID of the share button's HTML element
     * @returns PostClient instance
     */
    constructor(ui: UI, webcam: Webcam, streamId: string, inputId: string, shareButtonId: string) {
        // Store the User Interactions object to display and
        // access content
        this.ui = ui;

        // Store the webcam object
        this.webcam = webcam;

        // Store the HTML elements for the stream (to display posts), textarea (input),
        // and share button
        this.stream = $(`#${streamId}`);
        this.input = $(`#${inputId}`);
        this.shareButton = $(`#${shareButtonId}`);

        // Set up an event handler for text entered in textarea
        this.input.keyup(this.inputKeyUp.bind(this));

        // Post when the share button is pressed
        this.shareButton.click(this.post.bind(this));
    }

    /**
     * Handle when keys are released in the textarea
     * for posting via 'enter' key
     * @param e key event object
     */
    private inputKeyUp(e: JQueryKeyEventObject) {
        // Trim whitespace from the entered text
        let numChars = this.input.val().trim().length;

        // Enable/Disable share button
        this.shareButton.prop("disabled", numChars <= 0);

        // Post on valid 'enter' key press
        if (numChars > 0 && e.keyCode === 13) {
            this.post();
        }
    }

    /**
     * Display an array of posts at the end of the
     * stream HTML element
     */
    private displayPosts(posts: BasePost[]) {
        // End early if we don't have posts to display
        if (!posts || posts.length <= 0) {
            return;
        }

        // To limit object access
        let author = this.ui.getAuthor();
        
        // For each post, display the post
        posts.forEach(function (post: BasePost) {
            if (post.author == this.lastAuthor) {
                // Extend the last post's component if written by 
                // the same author
                post.extendComponent(this.lastAuthorChainPostId);
            } else {
                // Create new post component and initialize it
                // if the last author differed
                this.stream.append(`${post.getComponent(author == post.author)}`);
                post.initComponent();
                
                // Store the last author and post id for
                // potentially extending the post on the
                // next iteration
                this.lastAuthor = post.author;
                this.lastAuthorChainPostId = post.id;
            }
        }.bind(this));

        // Scroll the stream to the bottom where the posts
        // were added
        let scrollHeight = this.stream.prop("scrollHeight");
        this.stream.animate({
            scrollTop: scrollHeight
            }, PostClient.scrollMs);

        // Assign the last post id for future retrievals
        this.currentPostId = posts[posts.length - 1].id;
    }

    /**
     * Post content from the user's view to the server
     */
    post() {
        // Generate post based on available content
        let generatedPost: BasePost = PostFactory.generate(this.ui.getAuthor(), this.input.val().trim(), this.webcam.capture());

        // Send post to server
        $.ajax({
            url: PostClient.host + PostClient.routes.post,
            type: "POST",
            data: {
                // Turn post into a JSON object (get rid of functions, etc.)
                post: generatedPost.json()
            },
            success: function () {
                // We could do something with a server response,
                // but I chose not to
            },
            error: function () {
                console.error("Couldn't send post to the server...");
            }
        });

        // Clear textarea and disable share button
        this.input.val("");
        this.shareButton.prop("disabled", true);
    }

    /**
     * Retrieve posts from the server from the last post
     * retrieved
     */
    retrievePosts() {
        $.ajax({
            url: PostClient.host + PostClient.routes.retrieve(this.currentPostId),
            type: "GET",
            cache: false,
            success: function (data) {
                if (data.posts) {
                    // Transform the returned array of JSON objects into
                    // BasePosts
                    this.displayPosts(PostFactory.transformObjectsToPosts(data.posts));
                }

                // Continue the retrieval cycle after a delay
                setTimeout(this.retrievePosts.bind(this), PostClient.retrievalCycleMs);
            }.bind(this),
            error: function() {
                console.error("Couldn't retrieve posts...");
            }
        });
    }
}