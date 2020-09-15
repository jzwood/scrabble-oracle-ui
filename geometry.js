function lineIntersect([ax1, ay1], [ax2,ay2], [bx1, by1], [bx2, by2]) {
    // returns a (x, y) tuple or none if there is no intersection
    const d = (by2 - by1) * (ax2 - ax1) - (bx2 - bx1) * (ay2 - ay1)
    let ua
    if (d){
        ua = ((bx2 - bx1) * (ay1 - by1) - (by2 - by1) * (ax1 - bx1)) / d
    } else {
        throw 'parallel lines'
    }
    const x = ax1 + ua * (ax2 - ax1)
    const y = ay1 + ua * (ay2 - ay1)
    return [x, y]
}

function mag([x, y]) {
    return Math.sqrt(x * x + y * y)
}

function scale(f, [x, y]) {
    return [f * x, f * y]
}

function plus([px, py], [vx, vy]) {
    return [px + vx, py + vy]
}

function to([x1, y1], [x2, y2]) {
    return [x2 - x1, y2 - y1]
}

function xy2pp(pq, pc, e1, e2) {
    const pqInt = lineIntersect(pq, pc, e1, e2)
    const percentToEdge = mag(to(pc, pq)) / mag(to(pc, pqInt))
    const u = to(e1, e2)
    const percentAlongEdge = mag(to(e1, pqInt)) / mag(u)
    return [percentToEdge, percentAlongEdge]
}

function pp2xy(percentToEdge, percentAlongEdge, pc, e1, e2) {
    const u = to(e1, e2)
    const pqInt = plus(e1, scale(percentAlongEdge, u))
    return plus(pc, scale(percentToEdge, to(pc, pqInt)))
}
