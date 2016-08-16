let uuid = require("uuid");

export interface HashedLinkedListEntry<T extends Identifiable> extends Identifiable {
    prev?: Id;
    item: T;
    next?: Id;
}

export class HashedLinkedList<T extends Identifiable> {
    private hash: {[id: string] : HashedLinkedListEntry<T>};
    private headId: Id;
    private tailId: Id;

    constructor() {
        // New empty dictionary
        this.hash = {};
        // Create head
        this.headId = null;
        this.tailId = null;
    }

    private static generateId(): string {
        return uuid.v4();
    }

    private redirectTail(id: Id) {
        // Point a valid tail's next field to be id
        if (this.tailId && this.hash[this.tailId]) {
            this.hash[this.tailId].next = id;
        }
    }

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
    
    removeFromHead(item: T): T {
        if (this.headId && this.headId ) {
            // Store old head
            let oldHead = this.hash[this.headId];
            // Assign new head id and clear prev
            this.headId = oldHead.next;
            this.hash[this.headId].prev = null;
            // Delete old head
            delete this.hash[oldHead.id];
            // Return old head
            return oldHead.item;
        } else {
            // Return null
            return null;
        }
    }

    getListStartingAt(id: Id): T[] {
        let arr = new Array<T>();

        // Add items to list from the dictionary
        while (this.hash[id]) {
            arr.push(this.hash[id].item);
            id = this.hash[id].next;
        }

        return arr;
    }

    getListStartingFromNext(id: Id): T[] {
        if (!id || !this.hash[id]) {
            return [];
        }
        
        return this.getListStartingAt(this.hash[id].next);
    }

    getList(): T[] {
        return this.getListStartingAt(this.headId);
    }
}