# Fullscreen API

A polyfill normalizing the FullScreen API across several browsers. Support includes:

1. Internet Explorer 9, 10, 11
2. Microsoft Edge
3. Google Chrome
4. Mozilla Firefox

To support IE 8, you will need to use additional shims. e.g.
[polyfill] (https://github.com/inexorabletash/polyfill)

## How to use

The Fullscreen API relies on CSS, and fullscreen CSS implementation differs across browsers. Ideally, you want to give a container element to the API, and size your actual fullscreen element so it completely fills the container. This makes the fullscreen work consistently across both Gecko-based (firefox) and WebKit (Chrome) browsers.

On mobiles, there is often no true fullscreen, due to the lack of an escape key for exiting. So, most mobile browsers allow the user to find the browser location by scrolling.
