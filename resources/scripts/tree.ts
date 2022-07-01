
export class TreeNode<K, V> {
    public key: K;
    public value: V;
    public parent: TreeNode<K, V> | null;
    public children: TreeNode<K, V>[];


    constructor(key: TreeNode<K, V>["key"], value: TreeNode<K, V>["value"], parent?: TreeNode<K, V>["parent"]) {
        this.key = key;
        this.value = value;
        this.parent = parent !== undefined ? parent : null;
        this.children = [];
    }

    get isLeaf() {
        return this.children.length === 0;
    }

    get hasChildren() {
        return !this.isLeaf;
    }
}

export class Tree<K, V> {
    public root: TreeNode<K, V>;

    public constructor(key: TreeNode<K, V>["key"], value: TreeNode<K, V>["value"]) {
        this.root = new TreeNode(key, value);
    }

    public *preOrderTraversal(node: TreeNode<K, V> = this.root) : Iterable<TreeNode<K, V>> {
        yield node;
        if (node.children.length) {
            for (let child of node.children) {
                yield* this.preOrderTraversal(child);
            }
        }
    }
    
    public *postOrderTraversal(node: TreeNode<K, V> = this.root) : Iterable<TreeNode<K, V>> {
        if (node.children.length) {
            for (let child of node.children) {
                yield* this.postOrderTraversal(child);
            }
        }
        yield node;
    }
    
    public insert(parentNodeKey: TreeNode<K, V>["key"], key: TreeNode<K, V>["key"], value: TreeNode<K, V>["value"]) {
        for (let node of this.preOrderTraversal()) {
            if (node.key === parentNodeKey) {
                node.children.push(new TreeNode(key, value, node));
                return true;
            }
        }
        return false;
    }

    public remove(key: TreeNode<K, V>["key"]) {
        for (let node of this.preOrderTraversal()) {
            const filtered = node.children.filter(c => c.key !== key);
            if (filtered.length !== node.children.length) {
                node.children = filtered;
                return true;
            }
        }
        return false;
    }

    public find(key: TreeNode<K, V>["key"]) {
        for (let node of this.preOrderTraversal()) {
            if (node.key === key) return node;
        }
        return undefined;
    }
}
