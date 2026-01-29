/**
 * Graphology Utilities
 * =====================
 *
 * Collection of helpful functions used by the implementation.
 */
import type {Attributes, UpdateHints} from 'graphology-types';
import type Graph from './graph';
import type {NodeData} from './data';

/**
 * Object.assign-like polyfill.
 */
function assignPolyfill<T extends object>(
  target: T,
  ...sources: Array<Partial<T> | null | undefined>
): T {
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    if (!source) continue;

    for (const k in source) {
      (target as any)[k] = (source as any)[k];
    }
  }

  return target;
}

export const assign: typeof Object.assign =
  typeof Object.assign === 'function' ? Object.assign : assignPolyfill;

/**
 * Function returning the first matching edge for given path.
 * Note: this function does not check the existence of source & target. This
 * must be performed by the caller.
 */
export function getMatchingEdge(
  graph: Graph,
  source: string,
  target: string,
  type: 'mixed' | 'directed' | 'undirected'
): unknown {
  const sourceData = (graph as any)._nodes.get(source);

  let edge = null;

  if (!sourceData) return edge;

  if (type === 'mixed') {
    edge =
      (sourceData.out && (sourceData.out as any)[target]) ||
      (sourceData.undirected && (sourceData.undirected as any)[target]);
  } else if (type === 'directed') {
    edge = sourceData.out && (sourceData.out as any)[target];
  } else {
    edge = sourceData.undirected && (sourceData.undirected as any)[target];
  }

  return edge;
}

/**
 * Checks whether the given value is a plain object.
 */
export function isPlainObject(value: unknown): value is Attributes {
  // NOTE: as per https://github.com/graphology/graphology/issues/149
  // this function has been loosened not to reject object instances
  // coming from other JavaScript contexts. It has also been chosen
  // not to improve it to avoid obvious false positives and avoid
  // taking a performance hit. People should really use TypeScript
  // if they want to avoid feeding subtly irrelevant attribute objects.
  return typeof value === 'object' && value !== null;
}

/**
 * Checks whether the given object is empty.
 */
export function isEmpty(o: object): boolean {
  for (const _ in o) return false;
  return true;
}

/**
 * Creates a "private" property for the given member name by concealing it
 * using the `enumerable` option.
 */
export function privateProperty<T>(
  target: object,
  name: string,
  value: T
): void {
  Object.defineProperty(target, name, {
    enumerable: false,
    configurable: false,
    writable: true,
    value
  });
}

/**
 * Creates a read-only property for the given member name & the given getter.
 */
export function readOnlyProperty<T>(
  target: object,
  name: string,
  value: T | (() => T)
): void {
  const descriptor: PropertyDescriptor = {
    enumerable: true,
    configurable: true
  };

  if (typeof value === 'function') {
    descriptor.get = value as () => T;
  } else {
    descriptor.value = value;
    descriptor.writable = false;
  }

  Object.defineProperty(target, name, descriptor);
}

/**
 * Returns whether the given object constitute valid hints.
 */
export function validateHints(hints: unknown): hints is UpdateHints {
  if (!isPlainObject(hints)) return false;

  if (
    (hints as UpdateHints).attributes &&
    !Array.isArray((hints as UpdateHints).attributes)
  )
    return false;

  return true;
}

/**
 * Creates a function generating incremental ids for edges.
 */
export function incrementalIdStartingFromRandomByte(): () => number {
  let i = Math.floor(Math.random() * 256) & 0xff;

  return () => {
    return i++;
  };
}

/**
 * Chains multiple iterators into a single iterator.
 */
export function chain<T>(
  ...iterables: Array<Iterable<T>>
): IterableIterator<T> {
  let current: Iterator<T> | null = null;
  let i = -1;

  return {
    [Symbol.iterator]() {
      return this;
    },
    next(): IteratorResult<T> {
      let step: IteratorResult<T> | null = null;

      do {
        if (current === null) {
          i++;
          if (i >= iterables.length) return {done: true, value: undefined};
          current = iterables[i][Symbol.iterator]();
        }
        step = current.next();
        if (step.done) {
          current = null;
          continue;
        }
        break;
        // eslint-disable-next-line no-constant-condition
      } while (true);

      return step;
    }
  };
}

/**
 * Maps the given iterable using the provided function.
 */
export function map<T, U>(
  iterable: Iterator<T>,
  fn: (value: T) => U
): IterableIterator<U> {
  return {
    [Symbol.iterator]() {
      return this;
    },
    next(): IteratorResult<U> {
      const step = iterable.next();
      if (step.done) return {done: true, value: undefined};
      return {value: fn(step.value), done: false};
    }
  };
}

export function emptyIterator<T>(): IterableIterator<T> {
  return {
    [Symbol.iterator]() {
      return this;
    },
    next(): IteratorResult<T> {
      return {done: true, value: undefined};
    }
  };
}
