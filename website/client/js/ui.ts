/**
 * Class for User Interactions with the site
 */
class UI {
    /**
     * Static members
     */
    private static usernames = ["Appletini", "Basket-Case", "Cardio", "Dreamer", "Elephant", "Frisky", "Gucci", 
        "Hater", "Iteration", "Junk", "Krispy", "Libertarian", "Modal", "Nano-Lover", "Orange-ish", "Palindrome", 
        "Qux", "Rodeo", "Syntax-Error", "error TS", "Ugly", "Vicious", "Xanthan-Gum", "Yorkshire", "Zombie"];
    
    /**
     * UI fields
     */
    private author: string;
    private usernameModal: any;
    private usernameInput: any;
    private saveUsernameButton: any;
    private nextFocus: any;

    /**
     * Create a UI instance
     * @returns UI instance
     */
    constructor() {
        // Create random author name
        this.author = UI.getRandomName();
    }

    /**
     * Create a random username
     * @returns Random username
     */
    private static getRandomName(): string {
        // (e.g. 'Basket-Case-420')
        return `${UI.usernames[Math.floor(Math.random() * UI.usernames.length)]}-${Math.floor(Math.random() * 1337)}`;
    }

    /**
     * Update the username entered by the user
     */
    private updateUsername() {
        // Trim whitespace from the input and set author
        // if there's a name still
        let potentialName = this.usernameInput.val().trim();
        this.author = (potentialName.length > 0) ? potentialName : this.author;

        // Display author in the text for all HTML elements
        // with the 'username' class
        $(".username").text(this.author);

        // Hide the username modal
        this.usernameModal.modal("hide");

        // Focus the input field
        if (this.nextFocus) {
            this.nextFocus.focus();
        }
    }

    /**
     * Handle keys being entered in the username input field
     * @param e key event object
     */
    private usernameInputKeyUp(e: JQueryKeyEventObject) {
        // Check for 'enter' key pressed
        if (e.keyCode === 13) {
            this.updateUsername();
        }
    }

    /**
     * Get the author/username
     * @returns author/username
     */
    getAuthor(): string {
        return this.author;
    }

    /**
     * Initialize and display the modal for setting a username
     * @param modalId ID of the modal
     * @param inputId ID of the modal's text input
     * @param saveButtonId ID of the modal's save button
     * @param nextFocusId ID of the next element to focus on (i.e. our textarea for input)
     */
    initUsernameModal(modalId: string, inputId: string, saveButtonId: string, nextFocusId?: string) {
        // Store the HTML elements for the modal, text input,
        // the save button, and the next element to focus
        this.usernameModal = $(`#${modalId}`);
        this.usernameInput = $(`#${inputId}`);
        this.saveUsernameButton = $(`#${saveButtonId}`);
        this.nextFocus = (nextFocusId) ? $(`#${nextFocusId}`) : null;
        
        // Display author in the text for all HTML elements
        // with the 'username' class
        $(".username").text(this.author);

        // Show the username modal
        this.usernameModal.modal("show");

        // Focus the mouse on the text input and set the
        // callback to listen for 'enter' key press
        this.usernameInput.focus();
        this.usernameInput.keyup(this.usernameInputKeyUp.bind(this));

        // Set the click handler for the save button to update the username
        this.saveUsernameButton.click(this.updateUsername.bind(this));
    }
}