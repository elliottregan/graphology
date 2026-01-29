/**
 * Graphology Internal Data Classes
 * =================================
 *
 * Internal classes hopefully reduced to structs by engines & storing
 * necessary information for nodes & edges.
 */
import type {Attributes} from 'graphology-types';

/**
 * Node data interface - common properties across all node types.
 */
export interface NodeData<NodeAttributes extends Attributes = Attributes> {
  key: string;
  attributes: NodeAttributes;
  clear(): void;

  // Degree properties (optional as they vary by type)
  inDegree?: number;
  outDegree?: number;
  undirectedDegree?: number;
  undirectedLoops?: number;
  directedLoops?: number;

  // Adjacency indices
  in?: Record<string, EdgeData>;
  out?: Record<string, EdgeData>;
  undirected?: Record<string, EdgeData>;
}

/**
 * MixedNodeData class.
 */
export class MixedNodeData<NodeAttributes extends Attributes = Attributes>
  implements NodeData<NodeAttributes>
{
  key: string;
  attributes: NodeAttributes;
  inDegree: number = 0;
  outDegree: number = 0;
  undirectedDegree: number = 0;
  undirectedLoops: number = 0;
  directedLoops: number = 0;
  in: Record<string, EdgeData> = {};
  out: Record<string, EdgeData> = {};
  undirected: Record<string, EdgeData> = {};

  constructor(key: string, attributes: NodeAttributes) {
    this.key = key;
    this.attributes = attributes;
    this.clear();
  }

  clear(): void {
    this.inDegree = 0;
    this.outDegree = 0;
    this.undirectedDegree = 0;
    this.undirectedLoops = 0;
    this.directedLoops = 0;
    this.in = {};
    this.out = {};
    this.undirected = {};
  }
}

/**
 * DirectedNodeData class.
 */
export class DirectedNodeData<NodeAttributes extends Attributes = Attributes>
  implements NodeData<NodeAttributes>
{
  key: string;
  attributes: NodeAttributes;
  inDegree: number = 0;
  outDegree: number = 0;
  directedLoops: number = 0;
  in: Record<string, EdgeData> = {};
  out: Record<string, EdgeData> = {};

  constructor(key: string, attributes: NodeAttributes) {
    this.key = key;
    this.attributes = attributes;
    this.clear();
  }

  clear(): void {
    this.inDegree = 0;
    this.outDegree = 0;
    this.directedLoops = 0;
    this.in = {};
    this.out = {};
  }
}

/**
 * UndirectedNodeData class.
 */
export class UndirectedNodeData<NodeAttributes extends Attributes = Attributes>
  implements NodeData<NodeAttributes>
{
  key: string;
  attributes: NodeAttributes;
  undirectedDegree: number = 0;
  undirectedLoops: number = 0;
  undirected: Record<string, EdgeData> = {};

  constructor(key: string, attributes: NodeAttributes) {
    this.key = key;
    this.attributes = attributes;
    this.clear();
  }

  clear(): void {
    this.undirectedDegree = 0;
    this.undirectedLoops = 0;
    this.undirected = {};
  }
}

/**
 * EdgeData class.
 */
export class EdgeData<
  NodeAttributes extends Attributes = Attributes,
  EdgeAttributes extends Attributes = Attributes
> {
  key: string;
  attributes: EdgeAttributes;
  undirected: boolean;
  source: NodeData<NodeAttributes>;
  target: NodeData<NodeAttributes>;

  // For multi-graph doubly-linked list
  previous?: EdgeData<NodeAttributes, EdgeAttributes>;
  next?: EdgeData<NodeAttributes, EdgeAttributes>;

  constructor(
    undirected: boolean,
    key: string,
    source: NodeData<NodeAttributes>,
    target: NodeData<NodeAttributes>,
    attributes: EdgeAttributes
  ) {
    this.key = key;
    this.attributes = attributes;
    this.undirected = undirected;
    this.source = source;
    this.target = target;
  }

  attach(): void {
    let outKey: 'out' | 'undirected' = 'out';
    let inKey: 'in' | 'undirected' = 'in';

    if (this.undirected) outKey = inKey = 'undirected';

    const source = this.source.key;
    const target = this.target.key;

    // Handling source
    (this.source[outKey] as Record<string, EdgeData>)[target] = this;

    if (this.undirected && source === target) return;

    // Handling target
    (this.target[inKey] as Record<string, EdgeData>)[source] = this;
  }

  attachMulti(): void {
    let outKey: 'out' | 'undirected' = 'out';
    let inKey: 'in' | 'undirected' = 'in';

    const source = this.source.key;
    const target = this.target.key;

    if (this.undirected) outKey = inKey = 'undirected';

    // Handling source
    const adj = this.source[outKey] as Record<string, EdgeData>;
    const head = adj[target];

    if (typeof head === 'undefined') {
      adj[target] = this;

      // Self-loop optimization
      if (!(this.undirected && source === target)) {
        // Handling target
        (this.target[inKey] as Record<string, EdgeData>)[source] = this;
      }

      return;
    }

    // Prepending to doubly-linked list
    head.previous = this;
    this.next = head;

    // Pointing to new head
    adj[target] = this;
    (this.target[inKey] as Record<string, EdgeData>)[source] = this;
  }

  detach(): void {
    const source = this.source.key;
    const target = this.target.key;

    let outKey: 'out' | 'undirected' = 'out';
    let inKey: 'in' | 'undirected' = 'in';

    if (this.undirected) outKey = inKey = 'undirected';

    delete (this.source[outKey] as Record<string, EdgeData>)[target];

    // No-op delete in case of undirected self-loop
    delete (this.target[inKey] as Record<string, EdgeData>)[source];
  }

  detachMulti(): void {
    const source = this.source.key;
    const target = this.target.key;

    let outKey: 'out' | 'undirected' = 'out';
    let inKey: 'in' | 'undirected' = 'in';

    if (this.undirected) outKey = inKey = 'undirected';

    // Deleting from doubly-linked list
    if (this.previous === undefined) {
      // We are dealing with the head

      // Should we delete the adjacency entry because it is now empty?
      if (this.next === undefined) {
        delete (this.source[outKey] as Record<string, EdgeData>)[target];

        // No-op delete in case of undirected self-loop
        delete (this.target[inKey] as Record<string, EdgeData>)[source];
      } else {
        // Detaching
        this.next.previous = undefined;

        (this.source[outKey] as Record<string, EdgeData>)[target] = this.next;

        // No-op delete in case of undirected self-loop
        (this.target[inKey] as Record<string, EdgeData>)[source] = this.next;
      }
    } else {
      // We are dealing with another list node
      this.previous.next = this.next;

      // If not last
      if (this.next !== undefined) {
        this.next.previous = this.previous;
      }
    }
  }
}
