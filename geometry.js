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

//// unit square
//let s1 = [0, 1]
//let s2 = [1, 1]
//let s3 = [1, 0]
//let s4 = [0, 0]
//let sc = [0.5, 0.5]

//// convex quad
//let p1 = [0, 1]
//let p2 = [2, 3]
//let p3 = [1, 0]
//let p4 = [0, 0]

//let pc = lineIntersect(p1, p2, p3, p4)
//let u1 = to(p2, p1)
//let u2 = to(p3, p2)
//let u3 = to(p4, p3)
//let u4 = to(p1, p4)

//let pq = [0.73, 0.4]
//let [pte, pae] = xy2pp(pq, sc, s2, s3)
//console.log(pte, pae)
//let p = pp2xy(pte, pae, sc, s2, s3)
//console.log(p)

//p = pp2xy(pte, pae, pc, u2, u3)
//console.log(p)
