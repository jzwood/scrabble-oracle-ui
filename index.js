import { calculateHomography } from 'simple-homography'
import { multiply } from 'mathjs'
import { demoImage } from './demoImage'
import Tesseract from 'tesseract.js'

let tlMove = false
let trMove = false
let blMove = false
let brMove = false
ready(main)

function ready(fn) {
    document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn)
}

function main(){
    const input = document.getElementById('file-input')
    const svg = document.getElementById('quad')
    const polygon = svg.querySelector('polygon')
    const canvasContainer = document.querySelector('.canvas-container')
    const canvas = document.getElementById('canvas')
    const transformationCanvas = document.getElementById('transformation-canvas')
    const ctx = canvas.getContext('2d')
    const tcCtx = transformationCanvas.getContext('2d')

    //input.addEventListener('change', handleImage, false)

    // BELOW IS TEMP
    const img = new Image()
    img.onload = () => {
        const [w, h] = scale(img.width, img.height, 600)
        canvas.width = w
        canvas.height = h
        canvas.style.width = svg.style.width = `${w}px`
        canvas.style.height = svg.style.height = `${h}px`
        ctx.drawImage(img, 0, 0, w, h)

        transformationCanvas.width = w
        transformationCanvas.height = w
        transformationCanvas.style.width = `${w}px`
        transformationCanvas.style.height =`${w}px`

        const topLeftX = 173
        const topLeftY = 77
        const topRightX = 447
        const topRightY = 74
        const bottomRightX = 496
        const bottomRightY = 336
        const bottomLeftX = 121
        const bottomLeftY = 338

        topLeft.style.transform =  `translate3d(${topLeftX}px, ${topLeftY}px, 0)`
        topRight.style.transform = `translate3d(${topRightX}px, ${topRightY}px, 0)`
        bottomRight.style.transform = `translate3d(${bottomRightX}px, ${bottomRightY}px, 0)`
        bottomLeft.style.transform = `translate3d(${bottomLeftX}px, ${bottomLeftY}px, 0)`

        topLeft.dataset.x = topLeftX
        topLeft.dataset.y = topLeftY
        topRight.dataset.x = topRightX
        topRight.dataset.y = topRightY
        bottomRight.dataset.x = bottomRightX
        bottomRight.dataset.y = bottomRightY
        bottomLeft.dataset.x = bottomLeftX
        bottomLeft.dataset.y = bottomLeftY

        //setTransformationCanvas(ctx, tcCtx, ~~w, ~~h, ~~w, [0, 0], [w, 0], [w, h], [0, h])
    }
    img.src = demoImage
    polygon.setAttribute('points', '0,0 100,10 100,80 20,300')
    // ABOVE IS TEMP

    function scale(oWidth, oHeight, targetWidth) {
        const aspect = oWidth / oHeight
        const targetHeight  = targetWidth / aspect
        return [targetWidth, targetHeight]
    }

    const topLeft = document.querySelector('.top-left')
    const topRight = document.querySelector('.top-right')
    const bottomLeft = document.querySelector('.bottom-left')
    const bottomRight = document.querySelector('.bottom-right')

    topLeft.addEventListener('mousedown', e => {
        e.preventDefault()
        tlMove = true
    })
    topRight.addEventListener('mousedown', e => {
        e.preventDefault()
        trMove = true
    })
    bottomRight.addEventListener('mousedown', e => {
        e.preventDefault()
        brMove = true
    })
    bottomLeft.addEventListener('mousedown', e => {
        e.preventDefault()
        blMove = true
    })

    canvasContainer.addEventListener('mousemove', e => {
        if (tlMove || trMove || brMove || blMove) {
            e.preventDefault()
            const canvasRect = canvas.getBoundingClientRect()
            const x = e.clientX  - canvasRect.left
            const y = e.clientY - canvasRect.top
            const pos = `translate3d(${x}px, ${y}px, 0)`
            if (tlMove) {
                topLeft.style.transform = pos
                topLeft.dataset.x = x
                topLeft.dataset.y = y
                //updateQuad(polygon, e.clientX, e.clientY)
            } else if (trMove) {
                topRight.style.transform = pos
                topRight.dataset.x = x
                topRight.dataset.y = y
            } else if (brMove) {
                bottomRight.style.transform = pos
                bottomRight.dataset.x = x
                bottomRight.dataset.y = y
                //updateQuad(polygon, e.clientX, e.clientY)
            } else if (blMove) {
                bottomLeft.style.transform = pos
                bottomLeft.dataset.x = x
                bottomLeft.dataset.y = y
                //updateQuad(polygon, e.clientX, e.clientY)
            }
        }
    })

    window.addEventListener('mouseup', e => {
        tlMove = false
        trMove = false
        blMove = false
        brMove = false

        setTransformationCanvas(ctx, tcCtx, ~~canvas.width, ~~canvas.height, ~~transformationCanvas.width,
            [+topLeft.dataset.x, +topLeft.dataset.y], [+topRight.dataset.x, +topRight.dataset.y], [+bottomRight.dataset.x, +bottomRight.dataset.y], [+bottomLeft.dataset.x, +bottomLeft.dataset.y])
    })

    function handleImage(e){
        const reader = new FileReader()
        reader.onload = event => {
            const img = new Image()
            img.onload = () => {
                const [w, h] = scale(img.width, img.height, 600)
                canvas.width = w
                canvas.height = h
                canvas.style.width = svg.style.width = `${w}px`
                canvas.style.height = svg.style.height = `${h}px`
                svg.setAttribute('viewBox', `0 0 ${~~w} ${~~h}`)
                ctx.drawImage(img, 0, 0, w, h)

                topLeft.style.transform =  'translate3d(0, 0, 0)'
                topRight.style.transform = `translate3d(${w}px, 0, 0)`
                bottomRight.style.transform = `translate3d(${w}px, ${h}px, 0)`
                bottomLeft.style.transform = `translate3d(0, ${h}px, 0)`
            }
            img.src = event.target.result
            polygon.setAttribute('points', '0,0 100,10 100,80 20,300')
        }
        reader.readAsDataURL(e.target.files[0])
    }

    function updateQuad(el, x, y) {
        el.setAttribute('points', `0,100 0,0 100,0 ${x},${y}`)
    }

}

function i2xy(i, width) {
    return [i % width, ~~ (i / width) ]
}

function xy2i(x, y, width) {
    return x + y * width
}


function setTransformationCanvas(srcCtx, destCtx, srcWidth, srcHeight, destSize, topLeftCoord, topRightCoord, bottomRightCoor, bottomLeftCoord) {
    const srcImageData = srcCtx.getImageData(0, 0, srcWidth, srcHeight)
    const destImageData = destCtx.createImageData(destSize, destSize)

    const A1 = [0, 0]
    const A2 = [0, destSize]
    const A3 = [destSize, destSize]
    const A4 = [destSize, 0]

    const B1 = topLeftCoord
    const B2 = topRightCoord
    const B3 = bottomRightCoor
    const B4 = bottomLeftCoord

    const homography = calculateHomography(A1, B1, A2, B2, A3, B3, A4, B4)
    const numColorChannels = 4

    const canvasContainer = document.querySelector('.ocr-canvas-container')

    const tilesPerBoardSide = 15
    const pixelsPerTileSide = destSize / tilesPerBoardSide
    for (let tx=0; tx < tilesPerBoardSide; tx +=1) {
        for (let ty=0; ty < tilesPerBoardSide; ty +=1) {
            const tile = canvasContainer.querySelector(`.row-${ty + 1}>canvas.col-${tx + 1}`)
            tile.style.width = `${pixelsPerTileSide}px`
            tile.style.height = `${pixelsPerTileSide}px`
            tile.width = pixelsPerTileSide
            tile.height = pixelsPerTileSide
            const tileCtx = tile.getContext('2d')
            const tileImageData = tileCtx.createImageData(pixelsPerTileSide, pixelsPerTileSide)
            for (let px=0; px < pixelsPerTileSide; px +=1) {
                for (let py=0; py < pixelsPerTileSide; py +=1) {
                    // DRAWS HOMOGRAPHICALLY CORRECTED IMAGE TO OUTPUT CANVAS
                    const x = tx * pixelsPerTileSide + px
                    const y = ty * pixelsPerTileSide + py
                    const A = [x, y, 1]
                    let B = multiply(homography, A)._data
                    const sx = B[0] / B[2]
                    const sy = B[1] / B[2]
                    const si = numColorChannels * xy2i(~~sx, ~~sy, srcWidth)
                    const [r, g, b, a] = srcImageData.data.slice(si, si + numColorChannels)
                    const avg = (r + g + b) / 3
                    const step = 16
                    const value = step * ~~(avg / step)
                    const i = numColorChannels * xy2i(x, y, destSize)  // switched x and y so it showed up right (:confused shrug:)
                    destImageData.data[i + 0] = value
                    destImageData.data[i + 1] = value
                    destImageData.data[i + 2] = value
                    destImageData.data[i + 3] = a

                    // DRAWS HOMOGRAPHICALLY CORRECTED TILE IMAGES TO INDIVIDUAL CANVASES
                    const ti = numColorChannels * xy2i(px, py, pixelsPerTileSide)
                    tileImageData.data[ti + 0] = value
                    tileImageData.data[ti + 1] = value
                    tileImageData.data[ti + 2] = value
                    tileImageData.data[ti + 3] = a

                }
            }
            tileCtx.putImageData(tileImageData, 0, 0)
        }
    }

    destCtx.putImageData(destImageData, 0, 0)
}


function performOCR(destCtx, destSize) {
    const tileSize = destSize / 15
    const ocrCanvas = document.getElementById('ocr-canvas')
    const images = Array(15 * 15).fill(0).map((_, i) => {

    })
    for (let i=0; i < destSize; i+= 1) {
        const ctx = tile.getContext('2d')
        const imageData = ctx.getImageData(0, 0, tileSize, tileSize)
        const destImageData = destCtx.createImageData(destSize, destSize)
    }
}
