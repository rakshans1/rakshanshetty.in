---
title: "Native lazy loading image with React"
slug: "/native-lazy-loading-image-with-react"
date: "2020-02-22T04:48:32.228Z"
description: ""
featured: false
tags: ["Tutorials", "React"]
---

Native image lazy loading is added to browsers from [Chrome 76](https://caniuse.com/#feat=loading-lazy-attr) and other browsers are also starting to support it which helps us to add lazy image capabilities just by adding loading attribute.

Let's create a basic react component that implements image lazy loading.

<div class="filename">NativeLazyImage.js</div>

```jsx
import React from "react"
import PropTypes from "prop-types"

const NativeLazyImage = ({ src, alt, ...rest }) => {
  return <img src={src} alt={alt} {...rest} loading="lazy" />
}

NativeLazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
}

export default NativeLazyImage
```

That's it, this is all we need to leverage browsers native image loading and does not have to deal with page scroll position manually to see if `<img />` element in out of the viewport.

## What about older browsers?

Currently, there are two ways to implement lazy loading offscreen images

- Using [Intersection Observer API](https://developers.google.com/web/updates/2016/04/intersectionobserver)
- Using `scroll` [event handlers](https://developers.google.com/web/fundamentals/performance/lazy-loading-guidance/images-and-video/#using_event_handlers_the_most_compatible_way)

Let's build `<LazyImage />` component which will use native `loading` attribute for newer browser and Intersection Observer for older browser.

<div class="filename">LazyImage.js</div>

```jsx
import React from "react"
import PropTypes from "prop-types"
import IntersectionLazyImage from "./IntersectionLazyImage"
import NativeLazyImage from "./NativeLazyImage"

const LazyImage = props => {
  if ("loading" in HTMLImageElement.prototype) {
    return <NativeLazyImage {...props} />
  }
  return <IntersectionLazyImage {...props} />
}

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
}

export default LazyImage
```

We already created `<NativeLazyImage/>` above. Lets create `<IntersectionLazyImage/>`

<div class="filename">IntersectionLazyImage.js</div>

```jsx
import React, { useState, useRef, useEffect } from "react"
import PropTypes from "prop-types"

import Observer from "./helpers/Observer" // will implement this shortly
IntersectionLazyImage

const observer = new Observer()

const IntersectionLazyImage = props => {
  const { src: imgSrc, lazysrc, alt, ...rest } = props
  const ref = useRef(null)
  const [src, setSrc] = useState(lazysrc)

  useEffect(() => {
    const r = ref.current
    const onIntersect = () => {
      setSrc(imgSrc)
    }
    observer.observe(r, onIntersect)
    return () => {
      observer.unobserve(r)
    }
  }, [imgSrc])

  return <img src={src} alt={alt} {...rest} imgRef={ref} />
}

IntersectionLazyImage.defaultProps = {
  lazysrc: "",
}

IntersectionLazyImage.propTypes = {
  lazysrc: PropTypes.string,
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
}

export default IntersectionLazyImage
```

Finally, the Observer that will listen to all the images element and load image when visible inside the viewport

<div class="filename">Observer.js</div>

```js
class Observer {
  elementMap = new Map()

  options = {
    threshold: 0,
    repeat: false,
  }

  obsvr = null

  constructor(options = {}) {
    this.init()
    this.options = { ...this.options, ...options }
  }

  init = async () => {
    this.obsvr = new IntersectionObserver(this.callBack, this.options)
  }

  callBack = entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      const callback = this.elementMap.get(entry.target)
      callback && callback()
      !this.options.repeat && this.unobserve(entry.target)
    })
  }

  observe = (target, onIntersect) => {
    this.elementMap.set(target, onIntersect)
    this.obsvr.observe(target)
  }

  unobserve = target => {
    this.obsvr.unobserve(target)
    this.elementMap.delete(target)
  }
}

export default Observer
```

### Demo

<iframe
     src="https://codesandbox.io/embed/native-lazy-loading-image-with-react-iq356?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="native-lazy-loading-image-with-react"
     allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
     sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
     loading="lazy"
   ></iframe>
