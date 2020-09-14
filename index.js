ready(main)
let tlMove = false
let trMove = false
let blMove = false
let brMove = false

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
        console.log(w, h)
        canvas.width = w
        canvas.height = h
        canvas.style.width = svg.style.width = `${w}px`
        canvas.style.height = svg.style.height = `${h}px`
        ctx.drawImage(img, 0, 0, w, h)

        transformationCanvas.width = w
        transformationCanvas.height = w
        transformationCanvas.style.width = `${w}px`
        transformationCanvas.style.height =`${w}px`

        setTransformationCanvas(ctx, tcCtx, ~~w, ~~h, ~~w, 0, 0, 0, 0)

        topLeft.style.transform =  'translate3d(0, 0, 0)'
        topRight.style.transform = `translate3d(${w}px, 0, 0)`
        bottomLeft.style.transform = `translate3d(${w}px, ${h}px, 0)`
        bottomRight.style.transform = `translate3d(0, ${h}px, 0)`
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
        const pos = 'translate3d(' + (e.clientX  - canvasRect.left) + 'px, ' + (e.clientY - canvasRect.top) + 'px, 0)'
        if (tlMove) {
            topLeft.style.transform = pos
            //updateQuad(polygon, e.clientX, e.clientY)
        }
        if (trMove) {
            topRight.style.transform = pos
        }
        if (brMove) {
            bottomRight.style.transform = pos
            //updateQuad(polygon, e.clientX, e.clientY)
        }
        if (blMove) {
            bottomLeft.style.transform = pos
            //updateQuad(polygon, e.clientX, e.clientY)
        }
    })

    window.addEventListener('mouseup', e => {
        tlMove = false
        trMove = false
        blMove = false
        brMove = false
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
                bottomLeft.style.transform = `translate3d(${w}px, ${h}px, 0)`
                bottomRight.style.transform = `translate3d(0, ${h}px, 0)`
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


function xsetTransformationCanvas(srcCtx, ctx, srcWidth, srcHeight, destSize, topLeftCoord, topRightCoord, bottomRightCoor, bottomLeftCoord) {
    const imageData = ctx.createImageData(destSize, destSize)

    // Iterate through every pixel
    for (let x = 0; x < destSize; x += 1) {
        for (let y = 0; y < destSize; y += 1) {
            const i = xy2i(x, y, destSize)
            imageData.data[i + 0] = 190;  // R value
            imageData.data[i + 1] = 0;    // G value
            imageData.data[i + 2] = 210;  // B value
            imageData.data[i + 3] = 255;  // A value
        }
    }

    // Draw image data to the canvas
    ctx.putImageData(imageData, 0, 0)
}

function setTransformationCanvas(srcCtx, destCtx, srcWidth, srcHeight, destSize, topLeftCoord, topRightCoord, bottomRightCoor, bottomLeftCoord) {
    const srcImageData = srcCtx.getImageData(0, 0, srcWidth, srcHeight)
    const destImageData = destCtx.createImageData(destSize, destSize)

    for (let x = 0; x < destSize; x += 1) {
        for (let y = 0; y < destSize; y += 1) {
            const i = xy2i(x, y, destSize)
            if (x > y && destSize - x > y) {
                [p2e, pae] = xy2pp([x, y], [destSize / 2, destSize / 2], [0, 0], [destSize, 0])
                const [sx, sy] = pp2xy(p2e, pae, [srcWidth / 2, srcHeight / 2], [0, 0], [srcWidth, 0])
                const si = xy2i(~~sx, ~~sy, srcWidth)
                const [r, g, b, a] = srcImageData.data.slice(si, si + 4)
                const avg = (r + g + b) / 3
                destImageData.data[i + 0] = avg
                destImageData.data[i + 1] = avg
                destImageData.data[i + 2] = avg
                destImageData.data[i + 3] = a
            } else {
                destImageData.data[i + 0] = 0  // R value
                destImageData.data[i + 1] = 255    // G value
                destImageData.data[i + 2] = 0  // B value
                destImageData.data[i + 3] = 255  // A value
            }
        }
    }

    destCtx.putImageData(destImageData, 0, 0)
}
