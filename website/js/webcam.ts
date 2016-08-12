/// <reference path="typings/index.d.ts" />
class Webcam {
    static IMAGE_CONSTRAINTS:  MediaStreamConstraints = {video: true, audio: false};
    static VIDEO_CONSTRAINTS:  MediaStreamConstraints = {
        video: {
            width: 240,
            height: 160
        }
    };

    private video: any = null;

    constructor(private tagId: string) {
        this.video = document.querySelector(tagId);
    }
    
    capture() {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        ctx.drawImage(this.video, 0, 0);
        return ctx.getImageData(0, 0, 240, 160);
    }

    requestVideo() {
        navigator.mediaDevices.getUserMedia(Webcam.VIDEO_CONSTRAINTS).
            then(this.handleVideo.bind(this)).
            catch(this.handleVideoError.bind(this));
    }

    private handleVideo(stream: MediaStream) {
        this.video.srcObject = stream;
    }

    private handleVideoError(error: MediaStreamError) {
        console.log(error);
    }
}

var webcam: Webcam = new Webcam("#webcam");
webcam.requestVideo();