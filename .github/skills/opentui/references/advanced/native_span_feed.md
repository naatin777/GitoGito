# NativeSpanFeed

`NativeSpanFeed` is a **core-only zero-copy streaming primitive** for moving bytes from native Zig memory into TypeScript handlers.

## When to Use

- high-throughput terminal output pipelines
- streaming parsers
- native integrations where copying would be too expensive
- advanced buffering or batching experiments

## Installed API

```ts
NativeSpanFeed.create(options?)
NativeSpanFeed.attach(streamPtr, options?)
stream.onData(handler)
stream.onError(handler)
stream.drainAll()
stream.close()
```

## React Guidance

There is **no React hook or intrinsic** for `NativeSpanFeed` in the installed package. Use it from application or service code, then push processed state into React as usual.

## Important Constraints

- handlers receive a **`Uint8Array` view** over native memory
- if you want to keep data after the callback, **copy it**
- async handlers pin underlying chunks until the promise resolves
- unregister handlers and call `close()` when done

## Options

The installed types expose `NativeSpanFeedOptions` via `zig-structs`. The package README positions it as a zero-copy wrapper rather than a Node stream replacement.

## Practical Advice

Prefer synchronous `onData` handlers unless you truly need async work:

```ts
const stop = stream.onData((data) => {
  const copy = new Uint8Array(data.length)
  copy.set(data)
  consume(copy)
})
```

## Good Fit

- log ingestion
- parser pipelines
- custom renderer or capture tooling

## Poor Fit

- ordinary React component state updates
- simple line-by-line text handling where regular strings are fine
