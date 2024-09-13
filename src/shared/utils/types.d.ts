import { NavigationElement } from 'typedoc';

/**
 * A function to invoke for tree nodes when walking the tree by `NavigationTreeSearch`.
 */
type TreeOperation<T extends NavigationElement> = (data: { entry: T, parentEntry?: T }) => void;

export { TreeOperation };
