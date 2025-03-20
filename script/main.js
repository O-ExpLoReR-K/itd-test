let selectedStreamer = null
const clickCounts = {}

// Восстановление состояния при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
  const savedStreamer = localStorage.getItem('selectedStreamer')
  if (savedStreamer) {
    const streamerElement = document.querySelector(
      `.streamer[data-name="${savedStreamer}"]`
    )
    if (streamerElement) {
      streamerElement.classList.add('selected')
      selectedStreamer = streamerElement
    }
  }

  const savedCards = JSON.parse(localStorage.getItem('selectedCards')) || {}
  Object.keys(savedCards).forEach(function (streamerName) {
    const streamerElement = document.querySelector(
      `.streamer[data-name="${streamerName}"]`
    )
    if (streamerElement) {
      savedCards[streamerName].forEach(function (cardText) {
        const cardElement = Array.from(document.querySelectorAll('.card')).find(
          (card) => card.querySelector('.card-back').textContent === cardText
        )
        if (cardElement) {
          cardElement.classList.add('flipped')
          cardElement.setAttribute('data-selected', 'true')
          cardElement.style.borderColor = 'red' // Устанавливаем красный бордер при восстановлении
          const newTextElement = document.createElement('div')
          newTextElement.classList.add('streamer-text')
          newTextElement.textContent = cardText
          newTextElement.setAttribute('data-card', cardText)
          newTextElement.style.borderColor = '#fff' // Устанавливаем белый бордер для текста при восстановлении
          streamerElement.appendChild(newTextElement)
        }
      })
    }
  })
})

document.querySelectorAll('.streamer').forEach(function (streamer) {
  clickCounts[streamer.getAttribute('data-name')] = 0

  streamer.addEventListener('click', function () {
    document.querySelectorAll('.streamer').forEach(function (s) {
      if (s.classList.contains('selected')) {
        // Устанавливаем белый бордер для всех streamer-text под предыдущим стримером
        s.querySelectorAll('.streamer-text').forEach(function (textElement) {
          textElement.style.borderColor = '#fff'
        })
      }
      s.classList.remove('selected')
    })
    streamer.classList.add('selected')
    selectedStreamer = streamer
    localStorage.setItem('selectedStreamer', streamer.getAttribute('data-name'))

    // Увеличиваем счетчик кликов
    const streamerName = streamer.getAttribute('data-name')
    clickCounts[streamerName] += 1

    // Проверяем, если кликов больше или равно 5, очищаем надписи и сбрасываем бордеры карточек
    if (clickCounts[streamerName] >= 5) {
      streamer
        .querySelectorAll('.streamer-text')
        .forEach(function (textElement) {
          textElement.remove()
        })
      clickCounts[streamerName] = 0 // Сбрасываем счетчик кликов

      // Обновляем localStorage
      const savedCards = JSON.parse(localStorage.getItem('selectedCards')) || {}
      delete savedCards[streamerName]
      localStorage.setItem('selectedCards', JSON.stringify(savedCards))

      // Сбрасываем состояние карточек и бордеры
      document.querySelectorAll('.card').forEach(function (card) {
        if (card.getAttribute('data-selected') === 'true') {
          card.removeAttribute('data-selected')
          card.classList.remove('flipped')
          card.style.borderColor = '#fff' // Сбрасываем бордер на белый
        }
      })
    }
  })
})

document.querySelectorAll('.card').forEach(function (card) {
  card.addEventListener('click', function () {
    if (!selectedStreamer) {
      alert('Сначала выберите стримера!')
      return // Если стример не выбран, ничего не делаем
    }

    // Проверяем, если у стримера уже есть 2 текста
    const streamerTexts = selectedStreamer.querySelectorAll('.streamer-text')
    if (streamerTexts.length >= 2) {
      alert('Нельзя добавить больше 2 текстов под стримером!')
      return
    }

    card.classList.toggle('flipped')
    const cardBackText = card.querySelector('.card-back').textContent

    if (card.classList.contains('flipped')) {
      if (card.getAttribute('data-selected') === 'true') {
        return // Если карточка уже выбрана, ничего не делаем
      }
      // Проверяем, существует ли уже текст с таким же содержимым
      const existingTextElement = Array.from(
        selectedStreamer.querySelectorAll('.streamer-text')
      ).find(function (textElement) {
        return textElement.getAttribute('data-card') === cardBackText
      })
      if (!existingTextElement) {
        const newTextElement = document.createElement('div')
        newTextElement.classList.add('streamer-text') // Добавляем класс streamer-text
        newTextElement.textContent = cardBackText
        newTextElement.setAttribute('data-card', cardBackText) // Добавляем атрибут для идентификации карточки
        selectedStreamer.appendChild(newTextElement) // Добавляем текст под streamer-name
      }
      card.setAttribute('data-selected', 'true') // Отмечаем карточку как выбранную
      card.style.borderColor = 'red' // Устанавливаем красный бордер для выбранной карточки

      // Сохранение выбранных карточек в localStorage
      const savedCards = JSON.parse(localStorage.getItem('selectedCards')) || {}
      const streamerName = selectedStreamer.getAttribute('data-name')
      if (!savedCards[streamerName]) {
        savedCards[streamerName] = []
      }
      savedCards[streamerName].push(cardBackText)
      localStorage.setItem('selectedCards', JSON.stringify(savedCards))
    } else {
      card.removeAttribute('data-selected') // Снимаем отметку с карточки
      card.style.borderColor = '#fff' // Устанавливаем белый бордер для невыбранной карточки

      // Обновляем localStorage
      const savedCards = JSON.parse(localStorage.getItem('selectedCards')) || {}
      const streamerName = selectedStreamer.getAttribute('data-name')
      if (savedCards[streamerName]) {
        savedCards[streamerName] = savedCards[streamerName].filter(
          (text) => text !== cardBackText
        )
        localStorage.setItem('selectedCards', JSON.stringify(savedCards))
      }
    }
  })
})
