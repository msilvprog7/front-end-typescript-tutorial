// When the document is ready
$("document").ready(function () {
    // Initialize the webcam and request video
    let webcam: Webcam = new Webcam("webcam");
    webcam.requestVideo();

    // Create author name
    let names = ["Appletini", "Basket-Case", "Cardio", "Dreamer", "Elephant", "Frisky", "Gucci", "Hater", "Iteration",
            "Junk", "Krispy", "Libertarian", "Modal", "Nano-Lover", "Orange-ish", "Palindrome", "Qux", "Rodeo", 
            "Syntax-Error", "error TS", "Ugly", "Vicious", "Xanthan-Gum", "Yorkshire", "Zombie"
        ],
        author = `${names[Math.floor(Math.random() * names.length)]}-${Math.floor(Math.random() * 1337)}`,
        usernameModal = $("#usernameModal") as any,
        updateUsername = function () {
            let potentialName = $("#usernameInput").val().trim();
            author = (potentialName.length > 0) ? potentialName : author;
            $(".username").text(author);
            usernameModal.modal("hide");
        };
    $(".username").text(author);
    usernameModal.modal("show");
    $("#usernameInput").focus();
    $("#usernameInput").keyup(function (e) {
        if (e.keyCode === 13) {
            updateUsername();
        }
    });
    $("#saveUsernameButton").click(updateUsername);

    // Create event handler for posting content
    let post = function () {
        // Generate post based on available content
        let generatedPost: BasePost = PostFactory.generate(author, $("textarea#wordsInput").val().trim(), webcam.capture());
        // Send post to server
        $.ajax({
            url: "http://localhost:5000/post",
            type: "POST",
            data: {
                post: generatedPost.json()
            },
            success: function () {
                // Nothing currently
            },
            error: function () {
                console.error("Couldn't send post to the server...");
            }
        });
        // Clear textarea and disable share button
        $("textarea#wordsInput").val("");
        $("button#shareButton").prop("disabled", true);
    };

    // Set up an event handler for text entered in textarea
    $("textarea#wordsInput").keyup(function (e) {
        let numChars = $("textarea#wordsInput").val().trim().length;
        // Enable/Disable Share button
        $("button#shareButton").prop("disabled", numChars <= 0);
        // Post on valid enter key press
        if (numChars > 0 && e.keyCode === 13) {
            post();
        }
    });

    // Post when the share button is pressed
    $("button#shareButton").click(post);

    // Retrieve posts
    let currentPostId = "",
        lastAuthor = "",
        lastAuthorChainPostId = "",
        displayPosts = function (posts: BasePost[]) {
            if (!posts || posts.length <= 0) {
                return;
            }

            posts.forEach(function (post: BasePost) {
                if (post.author == lastAuthor) {
                    post.extendComponent(lastAuthorChainPostId);
                } else {
                    $("#stream").append(`${post.getComponent(author == post.author)}`);
                    post.initComponent();
                    
                    lastAuthor = post.author;
                    lastAuthorChainPostId = post.id;
                }
            });

            document.getElementById("stream").scrollTop = document.getElementById("stream").scrollHeight;
            currentPostId = posts[posts.length - 1].id;
        },
        retrievePosts = function () {
            $.ajax({
                url: "http://localhost:5000/posts/" + currentPostId,
                type: "GET",
                cache: false,
                success: function (data) {
                    if (data.posts) {
                        displayPosts(PostFactory.transformObjectsToPosts(data.posts));
                    }

                    setTimeout(retrievePosts, 250);
                },
                error: function() {
                    console.error("Couldn't retrieve posts...");
                }
            });
        };
    retrievePosts();
});