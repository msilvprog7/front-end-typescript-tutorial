// Type alias for easy changing
type Id = string;

/**
 * Interface for anything with an Id for
 * code reuse of HashedLinkedList
 */
interface Identifiable {
    id: Id;
}

/**
 * Type declaration for the Post we wrote for the client
 */
interface Post extends Identifiable{
    author: string;
    date: number;
}