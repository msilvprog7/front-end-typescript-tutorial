// Include uuid for generating Universally Unique Identifiers
// for keys for our hash
let uuid = require("uuid");

/**
 * Entry in our data structure to potentially point to a
 * previous entry (via Id), store the item, store the id (same as the
 * key, but simplifies access; done by extending Identifiable),
 * and potentially pointing to a next entry (via Id)
 */
export interface HashedLinkedListEntry<T extends Identifiable> extends Identifiable {
    prev?: Id;
    item: T;
    next?: Id;
}

/**
 * A doubly linked list stored across a dictionary (or indexer) so that we can
 * easily add/remove in constant time, but also simplify access.
 * Generally we will want to add a single post at a time to the tail.
 * Our access pattern will be various users who have loaded different
 * posts, so it would be ideal to access from the last post and just
 * gather up the remaining posts in the list as quickly as possible.
 * 
 * Although not implemented, I figured a realistic application would
 * delete posts within a few minutes or so, which could be easily done
 * by removing posts that 'expire' from the head.
 */
export class HashedLinkedList<T extends Identifiable> {
    /**
     * HashedLinkedList fields
     * 
     * [!] Remember to change hash's key (an id) if you change the Id alias,
     *     TypeScript 1.8 allows number and string, not type aliases,
     *     for indexers 
     */
    private hash: {[id: string] : HashedLinkedListEntry<T>};
    private headId: Id;
    private tailId: Id;

    /**
     * Create a HashedLinkedList instance
     * @returns HashedLinkedList instance
     */
    constructor() {
        // New empty dictionary
        this.hash = {};
        // Create head
        this.headId = null;
        this.tailId = null;
    }

    /**
     * Generate a UUID for an id
     * [!] If you change this, don't forget to change hash's key
     *     and the Id type alias
     * @returns Unique identifier
     */
    private static generateId(): string {
        return uuid.v4();
    }

    /**
     * Redirect the current tail to point to the specified id
     * @param id Identifier to point the current tail to (via next) 
     */
    private redirectTail(id: Id) {
        // Point a valid tail's next field to be id
        if (this.tailId && this.hash[this.tailId]) {
            this.hash[this.tailId].next = id;
        }
    }

    /**
     * Insert an item at the tail of the list
     * @param item New item to add to the tail
     */
    insertAtTail(item: T) {
        // Generate new id
        item.id = HashedLinkedList.generateId();
        // Set head if needed
        if (!this.headId) {
            this.headId = item.id;
        }
        // Create new tail entry
        this.hash[item.id] = {
            id: item.id,
            prev: this.tailId,
            item: item,
            next: null
        };
        // Point old tail to new tail
        this.redirectTail(item.id);
        // Set new tail
        this.tailId = item.id;
    }
    
    /**
     * Remove item from the head of the list
     * @returns item removed or null if empty
     */
    removeFromHead(): T {
        if (this.headId) {
            // Store old head
            let oldHead = this.hash[this.headId];
            // Assign new head id
            this.headId = oldHead.next;
            // Clear previous from new head if not empty
            if (this.headId && this.hash[this.headId]) {
                this.hash[this.headId].prev = null;
            }
            // Delete old head
            delete this.hash[oldHead.id];
            // Return old head
            return oldHead.item;
        } else {
            // Return null
            return null;
        }
    }

    /**
     * Collect elements from the list starting at
     * the element with the specified ID
     * @param id Identifier for the first element of the returned list
     * @returns array of items from ID to tail
     */
    getListStartingAt(id: Id): T[] {
        if (!id || !this.hash[id]) {
            return [];
        }

        let arr = new Array<T>();

        // Add items to list from the dictionary
        while (id && this.hash[id]) {
            arr.push(this.hash[id].item);
            id = this.hash[id].next;
        }

        return arr;
    }

    /**
     * Collect elements from the list starting from
     * the item following the element with the specified ID
     * @param id Identifier for the element in front of the returned list
     * @returns array of items after the ID to the tail
     */
    getListStartingFromNext(id: Id): T[] {
        if (!id || !this.hash[id]) {
            return [];
        }
        
        return this.getListStartingAt(this.hash[id].next);
    }

    /**
     * Get the entire list
     * @returns array from head to tail
     */
    getList(): T[] {
        return this.getListStartingAt(this.headId);
    }
}