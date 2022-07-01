import { TreeNode, Tree } from "@/tree";

export default class Moves extends Tree<number, Move> {
    constructor(initialMove: Move) {
        super(0, initialMove);
    }

    public *leftTraversal(node: TreeNode<number, Move> = this.root) : Iterable<TreeNode<number, Move>> {
        yield node;
        if (node.children.length) {
            yield* this.leftTraversal(node.children[0]);
        }
    }

    get length() {
        let moveCount = -1;
        for (const moveNode of this.leftTraversal()) {
            moveCount++;
        }
        return moveCount;
    }
}
