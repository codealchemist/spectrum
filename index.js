window.AudioContext = window.AudioContext || window.webkitAudioContext
const context = new AudioContext()
const $canvas = document.getElementById('spectrum')
const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
$canvas.width = width
$canvas.height = height
const canvasContext = $canvas.getContext('2d')
console.log('')
let drawVisual
const analyser = context.createAnalyser()
analyser.fftSize = 2048
analyser.minDecibels = -90
analyser.maxDecibels = -10
analyser.smoothingTimeConstant = 0.85
analyser.connect(context.destination)

function loadAudio (url) {
  console.log('Loading', url)
  fetch(url, { method: 'GET', mode: 'no-cors' })
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
      console.log('audio buffer', audioBuffer)
      console.log('got audio buffer')
      const source = context.createBufferSource()
      source.buffer = audioBuffer
      analyser.buffer = audioBuffer
      source.connect(analyser)
      source.start(0)
      render()
    })
}

function render () {
  const bufferLength = analyser.fftSize
  const buffer = new Uint8Array(bufferLength)
  drawVisual = requestAnimationFrame(render)
  analyser.getByteTimeDomainData(buffer)
  canvasContext.fillStyle = 'black'
  canvasContext.fillRect(0, 0, width, height)
  canvasContext.lineWidth = 2
  canvasContext.strokeStyle = 'yellow'
  canvasContext.beginPath()

  const sliceWidth = (width * 1.0) / bufferLength
  let x = 0

  for (let i = 0; i < bufferLength; i++) {
    const v = buffer[i] / 128.0
    const y = (v * height) / 2

    if (i === 0) {
      canvasContext.moveTo(x, y)
    } else {
      canvasContext.lineTo(x, y)
    }

    x += sliceWidth
  }

  canvasContext.lineTo($canvas.width, $canvas.height / 2)
  canvasContext.stroke()
}

// ANGEL VIVALDI // A Martian Winter [OFFICIAL MUSIC VIDEO]
// loadAudio('http://youtube-audio-server.herokuapp.com/chunk/qFWoIyqSjlA')
document.addEventListener('click', () => {
  loadAudio('http://127.0.0.1:8080/martian-winter.mp3')
})
