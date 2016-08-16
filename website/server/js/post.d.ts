type Id = string;

interface Identifiable {
    id: Id;
}

interface Post extends Identifiable{
    author: string;
    date: number;
}