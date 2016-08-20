// Type alias for easy changing
type Id = string;

/**
 * Posts will have an id, date (ms since 1970), and author
 */
interface Post {
    id: Id;
    date: number;
    author: string;
}

/**
 * Images will have a data URI (uniform resoure identifier; specifically as an encoded image),
 * a width, and a height
 */
interface Image {
    imageDataURI: string;
    width: number;
    height: number;
}

/**
 * An outline with common functionality for our posts,
 * such as getters and setters
 */
abstract class BasePost implements Post {
    /**
     * Public members
     */
    id: Id;
    date: number;

    /**
     * Create a BasePost instance (note: 'public author: string' in the 
     * constructor will create and assign the parameter to a public
     * field of the same name, this is because of the explicit use of
     * the visibility modifier)
     * @param author Author of the post
     * @returns BasePost instance
     */
    constructor(public author: string) {
        // Set id to empty string as may be unknown
        // and the date to the current time (ms since 1970)
        this.id = "";
        this.date = new Date().getTime();
    }

    /**
     * Set the post's id
     * @param id
     */
    setId(id: Id) {
        this.id = id;
    }

    /**
     * Set the post's author
     * @param author
     */
    setAuthor(author: string) {
        this.author = author;
    }

    /**
     * Set the post's date (ms since 1970)
     * @param date
     */
    setDate(date: number) {
        this.date = date;
    }

    /**
     * Format the post's date for display (e.g. 12:34pm)
     * @returns formatted date string
     */
    formatDate(): string {
        // Create new Date object
        let dateObj = new Date();
        dateObj.setTime(this.date);

        // Determine am/pm and format hours (1 - 12) and minutes (00 - 59)
        let am = (dateObj.getHours() < 12),
            hours = (dateObj.getHours() == 0 || dateObj.getHours() == 12) ? 12 : dateObj.getHours() % 12,
            formatHours = `${hours}`,
            minutes = dateObj.getMinutes(),
            formatMinutes = `${Math.floor(minutes / 10)}${minutes % 10}`;
        
        // (e.g. 7:20am)
        return `(${formatHours}:${formatMinutes}${(am) ? "am" : "pm"})`;
    }

    /**
     * Create a JSON Object of the data within the BasePost
     * @returns JSON Object
     */
    json(): {} {
        return {
            id: this.id,
            date: this.date,
            author: this.author
        }
    }

    /**
     * Get the HTML component for the BasePost
     * @param isAuthor Whether the current user made this post
     * @param innerComponents (optional) Additional components to include within component
     * @returns string representation of the HTML component
     */
    getComponent(isAuthor: boolean, innerComponents?: string): string {
        return `<div id='post-${this.id}' class='post${(isAuthor) ? " my-post" : ""}'>
            ${(innerComponents) ? innerComponents : ""}
        </div>`;
    }

    /**
     * Initialize the component
     * Currently does nothing at this level of the inheritance hierarchy
     */
    initComponent() {
    }

    /**
     * Extend the component from chainId with this post
     * Currently does nothing at this level of the inheritance hierarchy
     * @param chainId ID of the last post displayed to chain this post to
     */
    extendComponent(chainId: string) {
    }
}

/**
 * A post that includes text
 */
class TextPost extends BasePost {

    /**
     * Create a TextPost instance
     * @param author Author of the post
     * @param text Text included in the post
     * @returns TextPost instance
     */
    constructor(author: string, public text: string) {
        super(author);
    }

    /**
     * Create a string representation of the TextPost's HTML component
     * @param additionalClasses (optional) Additional classes to include on the 'post-content' tag (e.g. 'subsequent-post-content')
     * @returns string representation of the post's HTML component
     */
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

    /**
     * Create a JSON Object of the data within the TextPost and include
     * BasePost's properties as well
     * @returns JSON Object
     */
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

    /**
     * Get the HTML component for the TextPost, building within
     * the BasePost's component
     * @param isAuthor Whether the current user made this post
     * @param innerComponents (optional) Additional components to include within component
     * @returns string representation of the HTML component
     */
    getComponent(isAuthor: boolean, innerComponents?: string): string {
        let textComponent = `${(innerComponents) ? innerComponents : ""}
            <div id='post-list-${this.id}'>
                ${this.getTextPostContent()}
            </div>`;
        return super.getComponent(isAuthor, textComponent);
    }

    /**
     * Initialize the component
     * Currently does nothing except call up the inheritance hierarchy
     */
    initComponent() {
        super.initComponent();
    }

    /**
     * Extend the component from chainId with this post
     * Adds additional post content to the 'post-list' associated with the chainId
     * Calls up the inheritance hierarchy
     * @param chainId ID of the last post displayed to chain this post to
     */
    extendComponent(chainId: string) {
        $(`#post-list-${chainId}`).append(this.getTextPostContent("subsequent-post-content"));
        super.extendComponent(chainId);
    }
}

/**
 * A TextPost that includes an image
 */
class ImagePost extends TextPost {

    /**
     * Create an ImagePost instance
     * @param author Author of the post
     * @param text Text of the post
     * @param image Image (defined earlier) of the post
     * @returns ImagePost instance
     */
    constructor(author: string, text: string, public image: Image) {
        super(author, text);
    }

    /**
     * Load an image to the HTML component of the formerly displayed
     * post with specified post ID
     * @param postId ID of the post to replace image with
     */
    private loadImageToComponent(postId: string) {
        let canvasId = `#post-canvas-${postId}`;

        // End early if no former image in post (not a big deal)
        if ($(canvasId).length == 0) {
            return;
        }

        // Get canvas and update image
        let canvas = $(canvasId).get(0) as HTMLCanvasElement,
            ctx = canvas.getContext("2d"),
            img = new Image;
        
        img.src = this.image.imageDataURI;
        img.onload = function () {
            ctx.drawImage(img, 0, 0);
        };
    }

    /**
     * Create a JSON Object of the data within the ImagePost and include
     * TextPost's properties as well
     * @returns JSON Object
     */
    json(): {} {
        let obj = {
                image: this.image
            },
            parentObj = super.json();

        for (let prop in parentObj) {
            obj[prop] = parentObj[prop];
        }

        return obj;
    }

    /**
     * Get the HTML component for the ImagePost, building within
     * the TextPost's component
     * @param isAuthor Whether the current user made this post
     * @param innerComponents (optional) Additional components to include within component
     * @returns string representation of the HTML component
     */
    getComponent(isAuthor: boolean, innerComponents?: string): string {
        let imageComponent: string = `${(innerComponents) ? innerComponents : ""}
            <canvas id='post-canvas-${this.id}' class='post-image' width='${this.image.width}' height='${this.image.height}'></canvas>`;
        return super.getComponent(isAuthor, imageComponent);
    }

    /**
     * Initialize the image to the HTML component
     * Calls up the inheritance hierarchy
     */
    initComponent() {
        this.loadImageToComponent(this.id);
        super.initComponent();
    }

    /**
     * Extend the component from chainId with this post
     * Replaces image in the last image associated with the chain id 
     * Calls up the inheritance hierarchy
     * @param chainId ID of the last post displayed to chain this post to
     */
    extendComponent(chainId: string): void {
        this.loadImageToComponent(chainId);
        super.extendComponent(chainId);
    }
}

/**
 * Factory (design pattern) for creating BasePosts, transforming
 * JSON Objects to BasePosts, and general functions for determining
 * if an object is a certain type of post
 */
class PostFactory {

    /**
     * Generate a BasePost from included parameters
     * @param author Author of the post
     * @param text Text of the post
     * @param image (optional) Image to include with the post
     * @returns BasePost built from parameters
     */
    static generate(author: string, text: string, image?: Image): BasePost {
        if (image && image.imageDataURI && image.imageDataURI.length > 0 && image.width && image.height) {
            return new ImagePost(author, text, image);
        } else {
            return new TextPost(author, text);
        }
    }

    /**
     * Determines whether or not the Object is a TextPost or not
     * @param post Object that may be a TextPost
     * @returns Whether or not the Object is a TextPost
     */
    static isTextPost(post: Object): post is TextPost {
        return ("text" in post && "author" in post && 
            "date" in post && "id" in post);
    }

    /**
     * Determines whether or not the Object is an ImagePost or not
     * @param post Object that may be an ImagePost
     * @returns Whether or not the Object is an ImagePost
     */
    static isImagePost(post: Object): post is ImagePost {
        return ("image" in post && "text" in post && 
            "author" in post && "date" in post && "id" in post);
    }

    /**
     * Transform a JSON Object from the server to a BasePost
     * @param post JSON Object
     * @returns BasePost if it can be turned into a valid BasePost, else null
     */
    static transformObjectToPost(post: Object): BasePost {
        if (PostFactory.isImagePost(post)) {
            let imagePost = new ImagePost(post.author, post.text, post.image);
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

    /**
     * Transform an array of JSON Objects from the server into an array of BasePosts
     * @param posts Array of JSON Objects
     * @returns BasePost array
     */
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

