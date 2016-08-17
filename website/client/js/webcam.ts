class Webcam {
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

    private video: any = null;
    private permission: boolean = false;

    constructor(private tagId: string) {
        this.video = document.getElementById(tagId);
    }
    
    capture(): Image {
        // Return null if no video permission
        if (!this.permission) {
            return undefined;
        }

        // Create a canvas, draw, and return ImageData
        let canvas = document.createElement("canvas");
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

    requestVideo() {
        navigator.mediaDevices.getUserMedia(Webcam.VIDEO_CONSTRAINTS).
            then(this.handleVideo.bind(this)).
            catch(this.handleVideoError.bind(this));
    }

    private handleVideo(stream: MediaStream) {
        this.permission = true;
        this.video.srcObject = stream;
    }

    private handleVideoError(error: MediaStreamError) {
        this.permission = false;
    }
}