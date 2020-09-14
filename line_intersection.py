from math import pow, sqrt


def line_intersect(p1, p2, p3, p4):
    Ax1, Ay1 = p1
    Ax2, Ay2 = p2
    Bx1, By1 = p3
    Bx2, By2 = p4
    """ returns a (x, y) tuple or None if there is no intersection """
    d = (By2 - By1) * (Ax2 - Ax1) - (Bx2 - Bx1) * (Ay2 - Ay1)
    if d:
        uA = ((Bx2 - Bx1) * (Ay1 - By1) - (By2 - By1) * (Ax1 - Bx1)) / d
    else:
        raise Exception('parallel lines')
    x = Ax1 + uA * (Ax2 - Ax1)
    y = Ay1 + uA * (Ay2 - Ay1)
    return x, y


def mag(v):
    x, y = v
    return sqrt(pow(x, 2) + pow(y, 2))


def scale(f, v):
    x, y = v
    return f * x, f * y


def plus(p, v):
    px, py = p
    vx, vy = v
    return px + vx, py + vy


def to(p1, p2):
    x1, y1 = p1
    x2, y2 = p2
    return x2 - x1, y2 - y1


def point_to_frac_pos(pq, pc, e1, e2):
    pq_int = line_intersect(pq, pc, e1, e2)
    percent_to_edge = mag(to(pc, pq)) / mag(to(pc, pq_int))
    u = to(e1, e2)
    percent_along_edge = mag(to(e1, pq_int)) / mag(u)
    return percent_to_edge, percent_along_edge


def fract_pos_to_point(percent_to_edge, percent_along_edge, pc, e1, e2):
    u = to(e1, e2)
    pq_int = plus(e1, scale(percent_along_edge, u))
    return plus(pc, scale(percent_to_edge, to(pc, pq_int)))


# unit square
s1 = (0, 1)
s2 = (1, 1)
s3 = (1, 0)
s4 = (0, 0)
sc = (0.5, 0.5)

# convex quad
p1 = (0, 1)
p2 = (2, 3)
p3 = (1, 0)
p4 = (0, 0)

pc = line_intersect(p1, p2, p3, p4)
u1 = to(p2, p1)
u2 = to(p3, p2)
u3 = to(p4, p3)
u4 = to(p1, p4)

pq = (0.73, 0.4)
pte, pae = point_to_frac_pos(pq, sc, s2, s3)
print(pte, pae)
p = fract_pos_to_point(pte, pae, sc, s2, s3)
print(p)

p = fract_pos_to_point(pte, pae, pc, u2, u3)
print(p)
