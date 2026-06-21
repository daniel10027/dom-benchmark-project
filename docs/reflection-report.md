# Reflection report

## Challenges encountered in optimizing DOM operations

The main challenge was ensuring a **fair measurement**: each framework
signals the end of an update differently (a `setState` callback in React,
`nextTick()` in Vue, `tick()` in Svelte, a change-detection cycle in
Angular). Without correct synchronization, there's a risk of timing the
scheduling of the update rather than the DOM actually being painted.
For Svelte, an additional difficulty comes from directly mutating reactive
arrays (runes): you have to follow the expected pattern to trigger
fine-grained reactivity without needlessly copying arrays.

## Influence of the DOM approach on performance

The results confirm the architectural expectations. **React and Vue**,
which reconcile a Virtual DOM in batches, remain competitive even at scale
thanks to their optimized diffing. **Svelte**, despite having no Virtual DOM
(compiling to direct DOM instructions), didn't dominate here: for full
replacements of large lists, the lack of batched reconciliation can generate
more individual DOM operations than expected. **Angular** was consistently
the slowest at initial render, likely due to the startup cost of change
detection and bundle size.

## Best performance by scenario

**React** achieved the best initial render times for 500 and 1000 tasks.
**Vue** was the fastest on small lists (100 tasks) and on updates. For
deletion, **React** remained the fastest. Angular was consistently the
slowest, which suggests a fixed initialization overhead rather than a pure
scalability problem.
