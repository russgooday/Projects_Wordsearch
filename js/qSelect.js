// qSelect V1.0
// Very Basic DOM Utility Framework
// Scripted by Russell Gooday © 2016

(function (doc, win) {
  // simple selector regex

  const selectType = /^#([\w-]+)$|^([\w-]+)$|^\.([\w-]+)$|^(.+)$/

  // ----------------- Array Methods

  const toString = {}.toString

  const slice = [].slice

  const push = [].push

  const forEach = function (obj, fn, context) { [].forEach.call(obj, fn, context) }

  // ----------------- Selection Methods

  const getById = function (id) { return doc.getElementById(id) }

  const getByTag = function (name, root) { return (root || doc).getElementsByTagName(name) }

  const getByClass = function (name, root) { return (root || doc).getElementsByClassName(name) }

  // May implement try and catch
  const queryAll = function (selec, root) { return (root || doc).querySelectorAll(selec) }

  // ------------------ Common Checks

  const oType = {}

  const isNode = function (el) {
    // 1 element 9 document
    return el && typeof el === 'object' && (el.nodeType == 1 || el.nodeType == 9)
  }

  'String,Array,Object,Function,Number,Boolean'.split(',').forEach(function (prop) {
    oType['[object ' + prop + ']'] = prop.toLowerCase()
  })

  // ----------------- qSelect Factory Constructor Function

  const QSelect = function QSelect (selector, root = document) {
    if (this instanceof QSelect) {
      const elems = this
      let match = false

      if (!selector) {
        return this
      }

      // if selector is a node. return as QSelect object.
      if (isNode(selector)) {
        elems['0'] = selector; elems.length = 1; return elems
      } else if (typeof selector === 'string') {
        selector = selector.trim()

        match = (selector.match(selectType))

        // match1 = ID
        if (match[1]) {
          elems['0'] = doc.getElementById(match[1]); elems.length = 1

          // match2 = TagName
        } else if (match[2]) {
          push.apply(elems, getByTag(match[2], root))

          // match3 = ClassName
        } else if (match[3]) {
          push.apply(elems, getByClass(match[3], root))

          // match4 = querySelectorAll
        } else if (match[4]) {
          push.apply(elems, queryAll(selector, root))
        }

        return elems
      }
    } else { return new QSelect(selector, root) }
  }

  // ----------------- qSelect Prototype Methods

  const QProto = QSelect.prototype = {

    constructor: 'QSelect',

    length: 0,

    get: function (num) {
      if (num == null) {
        return slice.call(this)
      }

      return num < 0 ? this[num + this.length] : this[num]
    },

    empty: function () {
      let elem

      if (this.length === 1 && (elem = this[0])) {
        while (elem.firstChild) {
          elem.firstChild.parentNode.removeChild(elem.firstChild)
        }
      } else if (this.length) {
        forEach(this, function (elem) {
          while (elem.firstChild) {
            elem.firstChild.parentNode.removeChild(elem.firstChild)
          }
        })
      }

      return this
    },

    getStyle: function (el, prop) {
      if (this.length) {
        return window.getComputedStyle(this[0])[prop]
      }
    },

    text: function (strg) {
      if (this.length === 1) {
        this[0].innerText = strg
      } else if (this.length) {
        forEach(this, function (elem) {
          elem.innetText = strg
        })
      }

      return this
    },

    append: function (elem) {
      if (this.length === 1) {
        this[0].appendChild(elem)
      } else if (this.length) {
        forEach(this, function (elem) {
          elem.appendChild(elem)
        })
      }

      return this
    },

    addEvent: function (event, fn) {
      if (this.length === 1) {
        this[0].addEventListener(event, fn)
      } else if (this.length) {
        forEach(this, function (elem) {
          elem.addEventListener(event, fn)
        })
      }

      return this
    },

    removeEvent: function (event, fn) {
      if (this.length === 1) {
        this[0].removeEventListener(event, fn)
      } else if (this.length) {
        forEach(this, function (elem) {
          elem.removeEventListener(event, fn)
        })
      }

      return this
    },

    extend: function (from) { // Shallow Copy
      const to = arguments[1] || this
      let prop

      for (prop in from) {
        if (Object.prototype.hasOwnProperty.call(from, prop)) {
          to[prop] = from[prop]
        }
      }
    }

  }

  // ----------------- Event Methods

  // for Internal Usage
  const addEvent = function (el, type, fn) {
    return el.addEventListener(type, fn, false)
  }

  const removeEvent = function (el, type, fn) {
    return el.removeEventListener(type, fn, false)
  }

  // TODO mouseover will need some work
  'click,mouseover,mouseup,mousedown'.split(',')

    .forEach(function (name) {
      QProto[name] = function (fn) { return this.addEvent(name, fn) }
    })

  // ----------------- Class Methods

  QProto.extend(
    (function () {
      const classFn = {

        containsClass: function (name) {
          return this[0].classList.contains(name)
        },

        replaceClass: function (name1, name2) {
          if (this.length === 1) {
            this[0].classList.remove(name1); this[0].classList.add(name2)
          } else if (this.length) {
            forEach(this, function (elem) {
              elem.classList.remove(name1); elem.classList.add(name2)
            })
          }

          return this
        }

      }

      'add,remove,toggle'.split(',')

        .forEach(function (prop) {
          classFn[prop + 'Class'] = function (name) {
            if (this.length === 1) {
              this[0].classList[prop](name)
            } else if (this.length) {
              forEach(this, function (elem) {
                elem.classList[prop](name)
              })
            }

            return this
          }
        })

      return classFn
    }())
  )

  QProto.extend(

    (function () {
      let transitionEnd

      const transition = (function (doc, obj) {
        const el = doc.createElement('div')

        for (const prop in obj) {
          if (el.style[prop] !== undefined) {
            transitionEnd = obj[prop]

            return prop
          }
        }
      }(doc, {
        WebkitTransition: 'webkitTransitionEnd',
        MozTransition: 'transitionend',
        transition: 'transitionend'
      }))

      const elemBound = function (el, handler, callback) {
        const obj = Object.create(elemBound.prototype)

        obj.fn = callback
        obj.elem = el
        obj.handler = handler.bind(obj)

        return obj
      }

      const transEnd = function (e) {
        if (this instanceof elemBound) {
          removeEvent(this.elem, transitionEnd, this.handler)

          this.elem.webkitBackfaceVisibility = 'visible'

          this.elem.transition = ''

          if (this.fn && typeof this.fn === 'function') {
            this.fn.call(this.elem, this.elem)
          }
        }
      }

      // fadeIn and fadeOut accepts a delay time or callback as one argument e.g. fadeIn(.5) or fadeIn(function(){})
      // If two arguments are supplied the first should be a delay time and the second a callback e.g. fadeIn(.5, function(){})
      // If there are zero arguments then a default time will be used and no callback.

      return {

        fadeIn: function (arg) {
          let fn = arguments[1]
          let delay

          if (typeof arg === 'function') { fn = arg } else { delay = arg }

          if (this.length) {
            forEach(this, function (el) {
              const elem = el
              const display = elem.getAttribute('data-display')

              elem.style.display = display || 'block'

              elem.removeAttribute('data-display')

              // Fix for Safari and jittery transition
              elem.style.webkitBackfaceVisibility = 'hidden'

              elem.style[transition] = 'opacity linear ' + ((delay) ? delay + 's' : '.4s')

              addEvent(elem, transitionEnd, elemBound(elem, transEnd, fn).handler)

              setTimeout(function () { elem.style.opacity = 1 }, 0)

              el = null
            })
          }

          return this
        },

        fadeOut: function (arg) {
          let fn = arguments[1]
          let delay

          if (typeof arg === 'function') { fn = arg } else { delay = arg }

          if (this.length) {
            forEach(this, function (el) {
              const elem = el

              // Fix for Safari and jittery transition
              elem.style.webkitBackfaceVisibility = 'hidden'

              // store element's display property — 'block', 'table' etc — for fadeIn
              elem.setAttribute('data-display', window.getComputedStyle(el).display)

              elem.style[transition] = 'opacity linear ' + ((delay) ? delay + 's' : '.4s')

              addEvent(elem, transitionEnd, elemBound(elem, transEnd, function (e) {
                elem.style.display = 'none'

                if (fn && typeof fn === 'function') fn.call(elem, e)
              }).handler)

              setTimeout(function () { elem.style.opacity = 0 }, 0)

              el = null
            })
          }

          return this
        }

      }
    }())

  )

  win.qSelect = QSelect
})(window.document, window)
