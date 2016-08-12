/// <reference path="typings/index.d.ts" />
class Webcam {
    static IMAGE_CONSTRAINTS:  MediaStreamConstraints = {video: true, audio: false};
    static VIDEO_CONSTRAINTS:  MediaStreamConstraints = {video: true, audio: true};

    constructor(private tagId: string) {
    }

    requestVideo() {
        navigator.mediaDevices.getUserMedia(Webcam.VIDEO_CONSTRAINTS).
            then(this.handleVideo).
            catch(this.handleVideoError);
    }

    private handleVideo(stream: MediaStream) {
        console.log(stream);
    }

    private handleVideoError(error: MediaStreamError) {
        console.log(error);
    }
}

var webcam: Webcam = new Webcam("vidInput");
webcam.requestVideo();