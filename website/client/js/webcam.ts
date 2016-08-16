class Webcam {
    static VIDEO_WIDTH = 240;
    static VIDEO_HEIGHT = 160;
    static VIDEO_CONSTRAINTS:  MediaStreamConstraints = {
        video: {
            width: Webcam.VIDEO_WIDTH,
            height: Webcam.VIDEO_HEIGHT
        }
    };

    private video: any = null;
    private permission: boolean = false;

    constructor(private tagId: string) {
        this.video = document.querySelector(tagId);
    }
    
    capture(): string {
        // Return null if no video permission
        if (!this.permission) {
            return null;
        }

        // Create a canvas, draw, and return ImageData
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        ctx.drawImage(this.video, 0, 0);
        return canvas.toDataURL();
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