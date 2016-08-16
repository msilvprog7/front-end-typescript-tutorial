type Id = string;

interface Post {
    id: Id;
    date: number;
    author: string;
}

abstract class BasePost implements Post {
    id: Id;
    date: number;

    constructor(public author: string) {
        this.id = "";
        this.date = new Date().getTime();
    }

    setId(id: Id) {
        this.id = id;
    }

    setAuthor(author: string) {
        this.author = author;
    }

    setDate(date: number) {
        this.date = date;
    }

    formatDate(): string {
        let dateObj = new Date();
        dateObj.setTime(this.date);

        let am = (dateObj.getHours() < 12),
            hours = (dateObj.getHours() == 0 || dateObj.getHours() == 12) ? 12 : dateObj.getHours() % 12,
            formatHours = `${hours}`,
            minutes = dateObj.getMinutes(),
            formatMinutes = `${Math.floor(minutes / 10)}${minutes % 10}`;
        
        return `(${formatHours}:${formatMinutes}${(am) ? "am" : "pm"})`;
    }

    json(): {} {
        return {
            id: this.id,
            date: this.date,
            author: this.author
        }
    }

    getComponent(isAuthor: boolean, innerComponents?: string): string {
        return `<div id='post-${this.id}' class='post${(isAuthor) ? " my-post" : ""}'>
            ${(innerComponents) ? innerComponents : ""}
        </div>`;
    }

    initComponent(): void {
    }

    extendComponent(chainId: string): void {
    }
}

class TextPost extends BasePost {
    constructor(author: string, public text: string) {
        super(author);
    }

    private getTextPostContent(additionalClasses?: string): string {
        return `<div class='post-content-block'>
                    <div class='post-content${(additionalClasses) ? " " + additionalClasses : ""}'>
                        <div class='post-text'>${this.text}</div>
                        <div class='post-footer'>
                            <div class='post-author'>${this.author}</div>
                            <div class='post-date'>${this.formatDate()}</div>
                        </div>
                    </div>
                </div>`;
    }

    json(): {} {
        let obj = {
                text: this.text
            },
            parentObj = super.json();

        for (let prop in parentObj) {
            obj[prop] = parentObj[prop];
        }

        return obj;
    }

    getComponent(isAuthor: boolean, innerComponents?: string): string {
        let textComponent = `${(innerComponents) ? innerComponents : ""}
            <div id='post-list-${this.id}'>
                ${this.getTextPostContent()}
            </div>`;
        return super.getComponent(isAuthor, textComponent);
    }

    initComponent() {
        super.initComponent();
    }

    extendComponent(chainId: string): void {
        $(`#post-list-${chainId}`).append(this.getTextPostContent("subsequent-post-content"));
        super.extendComponent(chainId);
    }
}

class ImagePost extends TextPost {
    constructor(author: string, text: string, public imageDataURI: string) {
        super(author, text);
    }

    json(): {} {
        let obj = {
                imageDataURI: this.imageDataURI
            },
            parentObj = super.json();

        for (let prop in parentObj) {
            obj[prop] = parentObj[prop];
        }

        return obj;
    }

    getComponent(isAuthor: boolean, innerComponents?: string): string {
        let imageComponent: string = `${(innerComponents) ? innerComponents : ""}
            <canvas id='post-canvas-${this.id}' class='post-image' width='240' height='160'></canvas>`;
        return super.getComponent(isAuthor, imageComponent);
    }

    initComponent() {
        let canvas = document.getElementById(`post-canvas-${this.id}`) as HTMLCanvasElement,
            ctx = canvas.getContext("2d"),
            img = new Image;
        
        img.src = this.imageDataURI;
        img.onload = function () {
            ctx.drawImage(img, 0, 0);
        };

        super.initComponent();
    }

    extendComponent(chainId: string): void {
        let canvas = document.getElementById(`post-canvas-${chainId}`) as HTMLCanvasElement,
            ctx = canvas.getContext("2d"),
            img = new Image;
        
        img.src = this.imageDataURI;
        img.onload = function () {
            ctx.drawImage(img, 0, 0);
        }

        super.extendComponent(chainId);
    }
}

class PostFactory {
    static generate(author: string, text: string, imageDataURI?: string): BasePost {
        if (imageDataURI && imageDataURI.length > 0) {
            return new ImagePost(author, text, imageDataURI);
        } else {
            return new TextPost(author, text);
        }
    }

    static isTextPost(post: Object): post is TextPost {
        return ("text" in post && "author" in post && 
            "date" in post && "id" in post);
    }

    static isImagePost(post: Object): post is ImagePost {
        return ("imageDataURI" in post && "text" in post && 
            "author" in post && "date" in post && "id" in post);
    }

    static transformObjectToPost(post: Object): BasePost {
        if (PostFactory.isImagePost(post)) {
            let imagePost = new ImagePost(post.author, post.text, post.imageDataURI);
            imagePost.setId(post.id);
            imagePost.setDate(post.date);
            return imagePost;
        } else if (PostFactory.isTextPost(post)) {
            let textPost = new TextPost(post.author, post.text);
            textPost.setId(post.id);
            textPost.setDate(post.date);
            return textPost;
        } else {
            return null;
        }
    }

    static transformObjectsToPosts(posts: [Object]): BasePost[] {
        let transformed = Array<BasePost>(),
            current: BasePost = null;

        for (let post of posts) {
            current = PostFactory.transformObjectToPost(post);
            if (current) {
                transformed.push(current);
            }
        }

        return transformed;
    }
}
