# Animation Timeline

Use this page when the generic animation reference is not enough and you need the actual timeline surface from the installed packages.

## React Support

React directly exposes:

```ts
useTimeline(options?: TimelineOptions): Timeline
```

This is the main advanced API in this set with a first-class React hook.

## Core Surface

```ts
createTimeline(options?)
new Timeline(options?)
engine.attach(renderer)
engine.register(timeline)
engine.unregister(timeline)
```

## Installed `TimelineOptions`

```ts
type TimelineOptions = {
  duration?: number
  loop?: boolean
  autoplay?: boolean
  onComplete?: () => void
  onPause?: () => void
}
```

## Installed `Timeline` Methods

```ts
timeline.add(target, properties, startTime?)
timeline.once(target, properties)
timeline.call(callback, startTime?)
timeline.sync(otherTimeline, startTime?)
timeline.play()
timeline.pause()
timeline.resetItems()
timeline.restart()
timeline.update(deltaTime)
```

## Animation Property Notes

The installed type surface accepts:

- numeric target properties
- `duration`
- `ease`
- `loop`
- `loopDelay`
- `alternate`
- `onUpdate`
- `onComplete`
- `onStart`
- `onLoop`

## Installed Easing Names

The installed `Timeline.d.ts` includes names like:

- `linear`
- `inQuad`, `outQuad`, `inOutQuad`
- `inExpo`, `outExpo`
- `inOutSine`
- `outBounce`, `inBounce`
- `outElastic`
- `inCirc`, `outCirc`, `inOutCirc`
- `inBack`, `outBack`, `inOutBack`

Prefer these installed names over external docs if there is a mismatch.

## React Pattern

```tsx
const timeline = useTimeline({ duration: 300 })

useEffect(() => {
  timeline.add(
    { width: 0 },
    {
      width: 20,
      duration: 300,
      ease: "outQuad",
      onUpdate: (anim) => setWidth(anim.targets[0].width),
    },
  )
}, [timeline])
```

## Core Pattern

```ts
const timeline = createTimeline({ duration: 1000, autoplay: false })
timeline.add(target, { opacity: 1, duration: 1000 })
timeline.play()
```

## Important Note

Older or external docs may mention different easing names or engine methods. For this repository, prefer the installed package typings first.
