module.exports = class Spectrum {
  constructor ({ audioContext, audioBuffer, audioSource, canvas } = {}) {
    if (typeof canvas === 'string') canvas = document.getElementById(canvas)
    if (!canvas) {
      canvas = document.createElement('canvas')
      document.body.appendChild(canvas)
    }
    this.$canvas = canvas
    this.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    this.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    this.$canvas.width = this.width
    this.$canvas.height = this.height
    this.canvasContext = this.$canvas.getContext('2d')

    if (audioContext && audioBuffer && audioSource) this.setAnalyzer({ audioContext, audioBuffer, audioSource })
  }

  setAnalyzer ({ audioContext, audioBuffer, audioSource }) {
    console.log('SET ANALYZER')
    this.analyser = audioContext.createAnalyser()
    this.analyser.fftSize = 2048
    this.analyser.minDecibels = -90
    this.analyser.maxDecibels = -10
    this.analyser.smoothingTimeConstant = 0.85
    this.analyser.buffer = audioBuffer
    audioSource.connect(this.analyser)
    return this
  }

  render () {
    const bufferLength = this.analyser.fftSize
    const buffer = new Uint8Array(bufferLength)
    window.requestAnimationFrame(() => this.render())
    this.analyser.getByteTimeDomainData(buffer)
    this.canvasContext.fillStyle = 'black'
    this.canvasContext.fillRect(0, 0, this.width, this.height)
    this.canvasContext.lineWidth = 2
    this.canvasContext.strokeStyle = 'yellow'
    this.canvasContext.beginPath()

    const sliceWidth = (this.width * 1.0) / bufferLength
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      const v = buffer[i] / 128.0
      const y = (v * this.height) / 2

      if (i === 0) {
        this.canvasContext.moveTo(x, y)
      } else {
        this.canvasContext.lineTo(x, y)
      }

      x += sliceWidth
    }

    this.canvasContext.lineTo(this.$canvas.width, this.$canvas.height / 2)
    this.canvasContext.stroke()
  }
}
