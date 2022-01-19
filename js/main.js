import qSelect from './qSelect.js'
import wSearch from './wordsearch.js'

(function (win, doc) {
    // Map wordsearch's word object properties to dom properties.
    const wordsMap = { word: 'textContent', colour: 'className', id: 'data-id' }

    let game = {}

    const formContent = function (formName) {
        const form = doc.forms[formName]
        const result = {}
        let i = 0

        while (form[++i]) {
            if (form[i].hasAttribute('name')) {
                result[form[i].name] = form[i].value
            }
        }

        return result
    }

    const checkValidty = function (formName) {
        const form = document.forms[formName]
        let i = 0

        while (form[++i]) {
            if (form[i].hasAttribute('name') && (!form[i].checkValidity())) {
                return false
            }
        }

        return true
    }

    const fillWordList = function (id, words) {
        const wordList = qSelect(id) // element wrapped in qSelect
        const fragment = doc.createDocumentFragment()
        const len = words.length
        let li
        let i = 0

        // clear any previous li elements
        wordList.empty()

        for (; i < len; i += 1) {
            li = doc.createElement('LI')

            for (const prop in words[i]) {
                if (Object.prototype.hasOwnProperty.call(words[i], prop)) {
                    li[wordsMap[prop]] = words[i][prop]
                }
            }

            fragment.appendChild(li)
        }

        wordList.append(fragment)
    }

    const drawWordPage = function (game, content) {
        qSelect('h1.title').text(content.title)
        qSelect('p.info').text(content.info)

        game.createTable().fillTable(content.words)

        qSelect(game.table).removeClass('hideAnswers')

        fillWordList('#wordList', game.words)
    }

    const handleButtons = function (e) {
        const elem = e.target

        if (elem.type === 'button') {
            buttonCallbacks[elem.id].call(this, e)
        }
    }

    const buttonCallbacks = {

        scramble: function () {
            const table = qSelect(this.table)
            const answers = (!table.containsClass('hideAnswers'))

            if (answers) table.toggleClass('hideAnswers')

            setTimeout(function () {
                if (answers) table.toggleClass('hideAnswers')
            }, 50)

            this.createTable().fillTable()

            fillWordList('wordList', this.words)
        },

        answers: function () {
            qSelect(this.table).toggleClass('hideAnswers')
        },

        back: function () {
            qSelect('.wordsearchButtons').removeEvent('click', handleButtons.ref)

            qSelect('div.wordsearchWrapper').fadeOut(function () {
                qSelect('div.formPage').fadeIn()
            })
        }
    }

    qSelect('#submit').click(function (e) {
        const content = formContent('formWords')

        game = (game instanceof wSearch)
            ? wSearch.call(game, game.table, content.level.toLowerCase())
            : wSearch(qSelect('table').get(0), content.level.toLowerCase())

        // Check for HTML5 form validation errors
        if (!checkValidty('formWords')) return false

        else {
            e.preventDefault()

            drawWordPage(game, content)

            qSelect('.wordsearchButtons').click((handleButtons.ref = handleButtons.bind(game)))

            qSelect('div.formPage').fadeOut(function () {
                qSelect('div.wordsearchWrapper').fadeIn()
            })
        }
    })
}(window, window.document))
