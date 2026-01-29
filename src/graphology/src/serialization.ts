/**
 * Graphology Serialization Utilities
 * ===================================
 *
 * Collection of functions used by the graph serialization schemes.
 */
import type {
  Attributes,
  SerializedNode,
  SerializedEdge
} from 'graphology-types';
import {InvalidArgumentsGraphError} from './errors';
import {assign, isPlainObject, isEmpty} from './utils';
import type {NodeData, EdgeData} from './data';

/**
 * Formats internal node data into a serialized node.
 */
export function serializeNode<NodeAttributes extends Attributes = Attributes>(
  key: string,
  data: NodeData<NodeAttributes>
): SerializedNode<NodeAttributes> {
  const serialized: SerializedNode<NodeAttributes> = {key};

  if (!isEmpty(data.attributes))
    serialized.attributes = assign({}, data.attributes) as NodeAttributes;

  return serialized;
}

/**
 * Formats internal edge data into a serialized edge.
 */
export function serializeEdge<
  NodeAttributes extends Attributes = Attributes,
  EdgeAttributes extends Attributes = Attributes
>(
  type: 'mixed' | 'directed' | 'undirected',
  key: string,
  data: EdgeData<NodeAttributes, EdgeAttributes>
): SerializedEdge<EdgeAttributes> {
  const serialized: SerializedEdge<EdgeAttributes> = {
    key,
    source: data.source.key,
    target: data.target.key
  };

  if (!isEmpty(data.attributes))
    serialized.attributes = assign({}, data.attributes) as EdgeAttributes;

  if (type === 'mixed' && data.undirected) serialized.undirected = true;

  return serialized;
}

/**
 * Checks whether the given value is a serialized node.
 */
export function validateSerializedNode(value: unknown): void {
  if (!isPlainObject(value))
    throw new InvalidArgumentsGraphError(
      'Graph.import: invalid serialized node. A serialized node should be a plain object with at least a "key" property.'
    );

  if (!('key' in value))
    throw new InvalidArgumentsGraphError(
      'Graph.import: serialized node is missing its key.'
    );

  if (
    'attributes' in value &&
    (!isPlainObject((value as SerializedNode).attributes) ||
      (value as SerializedNode).attributes === null)
  )
    throw new InvalidArgumentsGraphError(
      'Graph.import: invalid attributes. Attributes should be a plain object, null or omitted.'
    );
}

/**
 * Checks whether the given value is a serialized edge.
 */
export function validateSerializedEdge(value: unknown): void {
  if (!isPlainObject(value))
    throw new InvalidArgumentsGraphError(
      'Graph.import: invalid serialized edge. A serialized edge should be a plain object with at least a "source" & "target" property.'
    );

  if (!('source' in value))
    throw new InvalidArgumentsGraphError(
      'Graph.import: serialized edge is missing its source.'
    );

  if (!('target' in value))
    throw new InvalidArgumentsGraphError(
      'Graph.import: serialized edge is missing its target.'
    );

  if (
    'attributes' in value &&
    (!isPlainObject((value as SerializedEdge).attributes) ||
      (value as SerializedEdge).attributes === null)
  )
    throw new InvalidArgumentsGraphError(
      'Graph.import: invalid attributes. Attributes should be a plain object, null or omitted.'
    );

  if (
    'undirected' in value &&
    typeof (value as SerializedEdge).undirected !== 'boolean'
  )
    throw new InvalidArgumentsGraphError(
      'Graph.import: invalid undirectedness information. Undirected should be boolean or omitted.'
    );
}
