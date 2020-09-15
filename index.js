import { calculateHomography } from 'simple-homography'
import { multiply } from 'mathjs'
import { tempImage } from './temp_image'

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
    const canvasRect = canvas.getBoundingClientRect()
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

        //setTransformationCanvas(ctx, tcCtx, ~~w, ~~h, ~~w, [0, 0], [w, 0], [w, h], [0, h])

        topLeft.style.transform =  'translate3d(0, 0, 0)'
        topRight.style.transform = `translate3d(${w}px, 0, 0)`
        bottomRight.style.transform = `translate3d(${w}px, ${h}px, 0)`
        bottomLeft.style.transform = `translate3d(0, ${h}px, 0)`

        topLeft.dataset.x = 0
        topLeft.dataset.y = 0
        topRight.dataset.x = w
        topRight.dataset.y = 0
        bottomRight.dataset.x = w
        bottomRight.dataset.y = h
        bottomLeft.dataset.x = 0
        bottomLeft.dataset.y = h
    }
    img.src = tempImage
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
        e.preventDefault()
        const x = e.clientX  - canvasRect.left + window.scrollX
        const y = e.clientY - canvasRect.top + window.scrollY
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
    i /= 4
    return [i % width, ~~ (i / width) ]
}

function xy2i(x, y, width) {
    return (x + y * width) * 4
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

    for (let x = 0; x < destSize; x += 1) {
        for (let y = 0; y < destSize; y += 1) {
            const i = xy2i(x, y, destSize)
            const A = [x, y, 1]
            let B = multiply(homography, A)._data
            const sx = B[0] / B[2]
            const sy = B[1] / B[2]
            //console.log(sx, sy)
            const si = xy2i(~~sx, ~~sy, srcWidth)
            const [r, g, b, a] = srcImageData.data.slice(si, si + 4)
            const avg = (r + g + b) / 3
            destImageData.data[i + 0] = avg
            destImageData.data[i + 1] = avg
            destImageData.data[i + 2] = avg
            destImageData.data[i + 3] = a
        }
    }

    destCtx.putImageData(destImageData, 0, 0)
}
