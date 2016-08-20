// When the document is ready
$("document").ready(function () {
    // Initialize the webcam and request video
    let webcam: Webcam = new Webcam("webcam");
    webcam.requestVideo();

    // Set up user interactions on the page
    let ui: UI = new UI();
    ui.initUsernameModal("usernameModal", "usernameInput", "saveUsernameButton", "wordsInput");

    // Set up interactions with posts and start retrieval cycle
    let postClient: PostClient = new PostClient(ui, webcam, "stream", "wordsInput", "shareButton");
    postClient.retrievePosts();
});