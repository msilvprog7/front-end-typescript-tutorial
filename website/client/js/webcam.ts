/**
 * Class to represent webcam behaviors using WebRTC (needs some form of adapter.js)
 */
class Webcam {
    /**
     * Static members
     */
    static VIDEO_WIDTH = 240;
    static VIDEO_HEIGHT = 160;
    static FACING_MODE = "user";
    static VIDEO_CONSTRAINTS:  MediaStreamConstraints = {
        video: {
            width: Webcam.VIDEO_WIDTH,
            height: Webcam.VIDEO_HEIGHT,
            aspectRatio: Webcam.VIDEO_WIDTH / Webcam.VIDEO_HEIGHT,
            facingMode: Webcam.FACING_MODE
        }
    };

    /**
     * Webcam fields
     */
    private video: any = null;
    private permission: boolean = false;

    /**
     * Create a Webcam instance
     * @param tagId ID of the webcam's HTML element (video tag)
     * @returns Webcam instance
     */
    constructor(private tagId: string) {
        this.video = document.getElementById(tagId);
    }

    /**
     * Handle the video stream by displaying it on the video HTML element
     * @param stream MediaStream from the webcam
     */
    private handleVideo(stream: MediaStream) {
        this.permission = true;
        this.video.srcObject = stream;
    }

    /**
     * Handle an error in retrieving video (most likely no permission,
     * so I treat this as a denied request to camera access)
     * @param error MediaStreamError that occurred while requesting webcam
     */
    private handleVideoError(error: MediaStreamError) {
        this.permission = false;
    }
    
    /**
     * Capture an image from the video feed
     * @returns Image (defined in post.ts) or null if no video permission
     */
    capture(): Image {
        // Return null if no video permission
        if (!this.permission) {
            return undefined;
        }

        // Create a canvas, draw, and return ImageData
        let canvas: any = $("<canvas>").get(0);
        canvas.width = this.video.offsetWidth;
        canvas.height = this.video.offsetHeight;

        let ctx = canvas.getContext("2d");
        ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
        return {
            imageDataURI: canvas.toDataURL(),
            width: canvas.width,
            height: canvas.height
        };
    }

    /**
     * Request video feed from the user using WebRTC
     */
    requestVideo() {
        navigator.mediaDevices.getUserMedia(Webcam.VIDEO_CONSTRAINTS).
            then(this.handleVideo.bind(this)).
            catch(this.handleVideoError.bind(this));
    }
}