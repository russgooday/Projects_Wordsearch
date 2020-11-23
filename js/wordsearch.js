// Wordsearch V1.0
// Written by Russell Gooday ©2016
(function (win, doc) {
  const levels = { easy: 1, medium: 2, hard: 3 }

  const wSearch = function (table, level) {
    if (!(this instanceof wSearch)) {
      return new wSearch(table, level)
    }

    if (typeof table === 'string') {
      table = doc.getElementById(table)
    }

    if (!table || table && table.nodeName !== 'TABLE') {
      throw new TypeError('TABLE Element expected.')
    }

    this.level = levels[level] || 1
    this.size = +(6 + this.level * 2)
    this.table = table
    // Main wordseacrh array
    this.grid = []
    // Store for successfully placed words
    this.words = []

    return this
  }

  wSearch.prototype = {

    constructor: 'wSearch',

    setChar: function (x, y, chr, off, colr) {
      this.grid[x + y * this.size] = NewChar(chr, off, colr)

      return this
    },

    getChar: function (x, y) {
      return this.grid[x + y * this.size]
    },

    createTable: function (test) {
      const table = this.table
      const tbody = firstChild(table)
      const cols = this.size
      let rows = cols
      let row; let col; let cell

      if (tbody.rows.length) {
        // clear any existing rows from table

        while (tbody.rows.length && !tbody.deleteRow(0));
      }

      while (rows--) {
        row = this.table.insertRow()

        for (col = 0; col < cols; col += 1) {
          cell = row.insertCell()

          cell.appendChild(doc.createTextNode(''))
        }
      }

      return this
    },

    fillTable: function (words) {
      const cells = this.table.getElementsByTagName('TD')
      words = shuffle((words)
        ? filterWords(words.trim().split(/, ?| |\n/), this.size)
        : filteredWords)

      // remove and initialise wordsearch data
      this.grid = new Array(this.size * this.size)

      // Not fullproof
      if (words.length && words.length > 0) {
        if (toString.call(words) === '[object String]') {
          words = words.replace(/\s/g, '').split(/[.,\n ]/)
        }

        // filterWords returns an array of objects each with word and colour properties.
        // See NewWord
        this.words = words.filter(
          function (word) { return wordProcess.call(this, word) }, this
        )
      } else {
        throw new TypeError('Properly formatted String or Array Expected')
      }

      forEach.call(cells, function (el, i) {
        if (this.grid[i]) {
          el.textContent = this.grid[i].letter
          el.className = this.grid[i].colour
        } else {
          el.textContent = rndChar()
        }
      }, this)

      // store filtered words
      filteredWords = words

      return this
    }

  }

  const offsets = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 }
  ]

  let filteredWords = [] // cache for filtered words

  const colours = ['red', 'blue', 'magenta', 'orange', 'green', 'purple']

  /* Utility function shorthand */

  const forEach = [].forEach

  const toString = {}.toString

  const next = function (el) {
    while ((el = el.nextSibling) && el.nodeType !== 1);

    return el
  }

  const firstChild = function (el) {
    return next(el.firstChild)
  }

  const shuffle = function (arr) {
    let tmp
    let len = arr.length
    let rnd

    while (--len) {
      rnd = Math.floor(Math.random() * (len + 1))

      tmp = arr[len]
      arr[len] = arr[rnd]
      arr[rnd] = tmp
    }

    return arr
  }

  const filterWords = function (words, size) {
    let result = []

    result = words.filter(function (word) { return word.length <= size })

    return result.map(

      function (word, id) {
        return NewWord(word.toUpperCase(), colours[id % colours.length], id)
      }
    )
  }

  const rndChar = function () {
    return String.fromCharCode(Math.floor(Math.random() * 26 + 65))
  }

  const NewChar = function (chr, off, colr) {
    return {
      letter: chr,
      offset: off,
      colour: colr
    }
  }

  const NewWord = function (word, colr, id) {
    return {
      word: word,
      colour: colr,
      id: id
    }
  }

  const getOrigins = function (strg, size, off) {
    const deltaX = size - strg.length + 1
    /* horizontal words will have all rows */
    const deltaY = (off === 0) ? size : size - strg.length + 1
    const len = deltaX * deltaY
    const result = []
    let i = 0

    for (; i < len; i += 1) {
      result.push({ x: i % deltaX, y: Math.floor(i / deltaX) })
    }

    return result
  }

  const placeable = function (strg, start, off) {
    const len = strg.length
    let x = start.x
    let y = start.y
    const offset = offsets[off]
    let chr
    let i = 0

    for (; i < len; i += 1) {
      chr = this.getChar(x, y)

      if (chr && (chr.letter !== strg[i] || chr.offset === off)) {
        return false
      }

      x += offset.x; y += offset.y
    }

    return true
  }

  const addToTable = function (strg, start, off) {
    const len = strg.word.length
    let x = start.x
    let y = start.y
    const offset = offsets[off]
    let i = 0

    for (; i < len; i += 1) {
      this.setChar(x, y, strg.word[i], off, strg.colour)

      x += offset.x; y += offset.y
    }
  }

  const wordProcess = function (strg) {
    let origins
    const rndOff = (this.level === 1)
      ? [0]
      : shuffle([0, 1, 2].splice(0, this.level))
    let offs = rndOff.length
    let pos

    while (offs--) {
      origins = shuffle(getOrigins(strg.word, this.size, rndOff[offs]))

      pos = origins.length

      while (pos--) {
        if (placeable.call(this, strg.word, origins[pos], rndOff[offs])) {
          addToTable.call(this, strg, origins[pos], rndOff[offs])

          return true
        }
      }

      pos = origins.length
    }

    return false
  }

  win.wSearch = wSearch
}(window, window.document))
