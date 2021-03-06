/*
 * This application is Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Portions of this software derive from webvr-boilerplate
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 *
 * normalize fullscreen API.
 * Adapted from: @link https://github.com/ethanius/fullscreen-api
 */
(function(fullscreenClass) {

  var Util = {};

  // Wrapper for checking if CSS class exists.
  Util.hasClass = function(elem, className) {
    if (elem.classList) {
      return elem.classList.contains(className);
    } else if (elem.className.indexOf(className) >= 0) {
      return true;
    }
  return false;
  };

  // Wrapper for checking if CSS class exists.
  Util.addClass = function(elem, className) {
    if (elem.classList) {
      elem.classList.add(className);
    } else if (!this.hasClass(elem, className)) {
      if (elem.className == '') {
        elem.className = className;
      } else {
        elem.className += ' ' + className;
      }
    }
  };

  // Wrapper for removing CSS class.
  Util.removeClass = function(elem, className) {
    if (elem.classList) {
      elem.classList.remove(className);
    } else if (this.hasClass(elem, className)) {
      var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
      elem.className = elem.className.replace(reg, ' ')
    }
  };

  /**
   * Add recommended fullscreen styles.
   * https://wiki.mozilla.org/Gecko%3aFullScreenAPI#onfullscreenchange_attribute
   * https://blog.idrsolutions.com/2014/01/adding-fullscreen-using-javascript-api/
   * http://www.sitepoint.com/html5-full-screen-api/
   */
  Util.fullscreenClass = (function(fullscreenClass) {
    var head = document.getElementsByTagName('head')[0];
    var s = document.createElement('style');
    s.type = 'text/css';
    s.id = 'webvr-util-fullscreen-style';
    var rules =
    '.' + fullscreenClass + ' {\n' +
     /* override mapped width and height attributes */
    ' position: fixed !important;\n' +
    ' box-sizing: border-box !important;\n' +
    ' width: 100% !important;\n' +
    ' height: 100% !important;\n' +
    ' margin: 0 !important;\n' +
    ' left: 0 !important;\n' +
    ' top: 0 !important;\n' +
    ' right:0 !important;\n' +
    ' bottom:0 !important;\n' +
    ' z-index: 2147483647 !important;\n' +
    ' background:black !important;\n' +
    '}\n';
    if (s.styleSheet) {
      s.styleSheet.cssText = rules;
    } else {
      var ruleNode = document.createTextNode(rules);
      s.appendChild(ruleNode);
    }
    head.appendChild(s);
    return fullscreenClass;
  })(fullscreenClass);


  // Set the fullscreenElement to null (even if it exists).
  document.fullscreenElement = null;

  /*
   * Set the function checking if fullscreen is enabled.
   * Enable if we satisfy the conditions for fullscreen (all iframes
   * have allowfullscreen attribute, no plugins in window).
   */
  if (!('fullscreenEnabled' in document)) {
    Object.defineProperty(document, 'fullscreenEnabled', {
      get: function() {
        return document.msFullscreenEnabled ||
          document.mozFullScreenEnabled ||
          document.webkitFullscreenEnabled ||
          (function() {
            console.log('entering fullscreenEnabled polyfill function')
            var iframes = document.getElementsByTagName('iframe');
            window.ifs = iframes;
            // All iframe elements must have .allowfullscreen attribute set.
            for (var i = 0; i < iframes.length; i++) {
              console.log('trying iframe number:' + i)
              if (!iframes[i].allowfullscreen) {
                console.log('found an iframe');
                return false;
              }
            }
            // No windowed plugins.
            return true;
          })();
      } // end of get.
    });
  }

  /*
   * A keypress handler for browsers not implementing
   * fullscreen API. Note that IE11 will ignore keydowns if
   * the Console is visible.
  */
  var escHandler = function(e) {
    if (e.keyCode == 27) {
        e.stopImmediatePropagation();
        document.exitFullscreen();
    }
  };

  /*
   * Polyfill requestFullscreen method.
   * hmd = head-mounted device {vrDisplay: this.hmd}
   */
  Element.prototype.requestFullscreen = Element.prototype.requestFullscreen ||
    Element.prototype.webkitRequestFullscreen ||
    Element.prototype.mozRequestFullScreen ||
    Element.prototype.msRequestFullscreen ||
    function(hmd) {
      console.log('in requestFullscreen() polyfill');
      // IFRAME needs 'allowfullscreen' attribute set for fullscreen
      console.log('IN REQUESTFULLSCREEN, fullscreen element set to:'+ ('fullscreenElement' in document) + ' and typeof:' + typeof document.fullscreenElement + ' and value:' + document.fullscreenElement)

      if (this.nodeName === 'IFRAME' && !this.allowfullscreen) {
        console.log('invalid iframe, setting fullscreenElement to NULL');
        document.fullscreenElement = null;
        return;
      }

      // Assign fullscreen element.
      if (document.fullscreenElement === null) {
        document.fullscreenElement = this;
      }

      // Assign listener for escape key pressed.
      document.addEventListener('keydown', escHandler, false);

      // Always add the fullscreen class to the element, since implementions differ.
      console.log('adding fullscreen class:' + Util.fullscreenClass);
      this.classList.add(Util.fullscreenClass);

      var event = new Event('fullscreenchange');

      // Create and send a (custom fullscreenchange) event.
      var event = new CustomEvent('fullscreenchange');

      // Handle bound onfullscreenchange function.
      if (typeof document.onfullscreenchange == 'function') {
        console.log('dispatching from onfullscreenchange in requestFullscreen');
      } else {
        console.log('dispatching fullscreenchange in requestFullscreen');
        document.dispatchEvent(event);
      }
    }; //end of requestFullscreen.

    /*
     * this toggle variable is necessary to update document.fullscreenElement when it is triggered
     * via pressing the escape key, in browsers using mozFullScreenElement,
     * msFullscreenElement, or webkitFullscreenElement, which automatically implement
     * the escape without providing a handler we can use.
     */
    var toFS = 'true';

    /*
     * Polyfill fullscreenchange event.
     */
    var screenChange = function(e) {
      e.stopImmediatePropagation();
      if (toFS === 'true') { //normal to fullscreen
        document.fullscreenElement = e.target;
        toFS = 'false';
      } else { //fullscreen to normal
        toFS = 'true';
        document.fullscreenElement = null;
      }
      console.log('dispatching fullscreenchange in screenChange, toggle:' + toFS)
      var bob = document.fullscreenElement;
      console.log('bob is a type:' + typeof bob + ' and value:' + bob)
      var event = new CustomEvent('fullscreenchange', e);
      document.dispatchEvent(event);
    };
    document.addEventListener('webkitfullscreenchange', screenChange);
    document.addEventListener('mozfullscreenchange', screenChange);
    document.addEventListener('MSFullscreenChange', screenChange); // Does not exist in edge

    /*
     * Polyfill exitFullscreen function.
    */
    document.exitFullscreen = document.exitFullscreen ||
      document.mozCancelFullScreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen ||
      function (d) {
        d.d = true;
        if (document.fullscreenEnabled === true) {
          document.removeEventListener('keydown', escHandler, false);
          var event = new CustomEvent('fullscreenchange');
          if (typeof document.onfullscreenchange == 'function') {
            document.onfullscreenchange(event);
          } else {
            document.dispatchEvent(event);
          }
        }
      };

    /*
     * Error handling.
     */
    var screenError = function(e) {
      console.error('A fullscreen request error has occurred');
      e.stopImmediatePropagation();
      var event = new CustomEvent('fullscreenerror', e);
      document.dispatchEvent(event);
    };
    document.addEventListener('webkitfullscreenerror', screenError, false);
    document.addEventListener('mozfullscreenerror', screenError, false);
    document.addEventListener('MSFullscreenError', screenError, false);
})('fullscreen-polyfill-class');
