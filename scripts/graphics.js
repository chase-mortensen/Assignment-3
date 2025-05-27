// ------------------------------------------------------------------
//
// This is the graphics object.  It provides a pseudo pixel rendering
// space for use in demonstrating some basic rendering techniques.
//
// ------------------------------------------------------------------
MySample.graphics = (function(pixelsX, pixelsY, showPixels) {
    'use strict'

    const canvas = document.getElementById('canvas-main')
    const context = canvas.getContext('2d', { alpha: false })

    const deltaX = canvas.width / pixelsX
    const deltaY = canvas.height / pixelsY

    //------------------------------------------------------------------
    //
    // Public function that allows the client code to clear the canvas.
    //
    //------------------------------------------------------------------
    function clear() {
        context.save()
        context.setTransform(1, 0, 0, 1, 0, 0)
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.restore()

        //
        // Draw a very light background to show the "pixels" for the framebuffer.
        if (showPixels) {
            context.save()
            context.lineWidth = .1
            context.strokeStyle = 'rgb(150, 150, 150)'
            context.beginPath()
            for (let y = 0; y <= pixelsY; y++) {
                context.moveTo(1, y * deltaY)
                context.lineTo(canvas.width, y * deltaY)
            }
            for (let x = 0; x <= pixelsX; x++) {
                context.moveTo(x * deltaX, 1)
                context.lineTo(x * deltaX, canvas.width)
            }
            context.stroke()
            context.restore()
        }
    }

    //------------------------------------------------------------------
    //
    // Public function that renders a "pixel" on the framebuffer.
    //
    //------------------------------------------------------------------
    function drawPixel(x, y, color) {
        const devicePixel = worldToDevice({x: x, y: y})
        drawPixelDevice(devicePixel.x, devicePixel.y, color)
    }

    function drawPixelDevice(x, y, color) {
        x = Math.trunc(x)
        y = Math.trunc(y)

        context.fillStyle = color
        context.fillRect(x * deltaX, y * deltaY, deltaX, deltaY)
    }

    //------------------------------------------------------------------
    //
    // Helper function used to draw an X centered at a point.
    //
    //------------------------------------------------------------------
    function drawPoint(x, y, ptColor) {
        const devicePoint = worldToDevice({x: x, y: y})
        drawPointDevice(devicePoint.x, devicePoint.y, color)
    }

    function drawPointDevice(x, y, ptColor) {
        x = Math.trunc(x)
        y = Math.trunc(y)

        drawPixelDevice(x - 1, y - 1, ptColor)
        drawPixelDevice(x + 1, y - 1, ptColor)
        drawPixelDevice(x, y, ptColor)
        drawPixelDevice(x + 1, y + 1, ptColor)
        drawPixelDevice(x - 1, y + 1, ptColor)
    }

    //------------------------------------------------------------------
    //
    // Bresenham line drawing algorithm.
    //
    //------------------------------------------------------------------
    function drawLine(x0, y0, x1, y1, color) {
        const startPoint = worldToDevice({x: x0, y: y0})
        const endPoint = worldToDevice({x: x1, y: y1})
        drawLineDevice(startPoint.x, startPoint.y, endPoint.x, endPoint.y, color)
    }

    function drawLineDevice(x0, y0, x1, y1, color) {
        // Determine which octant the line is in
        const dx = x1 - x0
        const dy = y1 - y0
        const adx = Math.abs(dx)
        const ady = Math.abs(dy)

        // Determine octant (0-7)
        let octant
        if (dx >= 0 && dy >= 0) {
            octant = adx >= ady ? 0 : 1
        } else if (dx < 0 && dy >= 0) {
            octant = adx >= ady ? 3 : 2
        } else if (dx < 0 && dy < 0) {
            octant = adx >= ady ? 4 : 5
        } else { // dx >= 0 && dy < 0
            octant = adx >= ady ? 7 : 6
        }

        if (octant === 0) {
            // Octant 0: no transformation needed
            drawLineOctant0(x0, y0, x1, y1, color)
        }
        else if (octant === 1) {
            // Octant 1: reflect across y=x
            drawLineOctant1(x0, y0, x1, y1, color)
        }
        else if (octant === 2) {
            // Octant 2: reflect across y-axis, then across y=x
            drawLineOctant2(x0, y0, x1, y1, color)
        }
        else if (octant === 3) {
            // Octant 3: reflect across y-axis
            drawLineOctant3(x0, y0, x1, y1, color)
        }
        else if (octant === 4) {
            // Octant 4: reflect across origin (both x and y)
            drawLineOctant4(x0, y0, x1, y1, color)
        }
        else if (octant === 5) {
            // Octant 5: reflect across origin, then across y=x
            drawLineOctant5(x0, y0, x1, y1, color)
        }
        else if (octant === 6) {
            // Octant 6: reflect across x-axis, then across y=x
            drawLineOctant6(x0, y0, x1, y1, color)
        }
        else if (octant === 7) {
            // Octant 7: reflect across x-axis
            drawLineOctant7(x0, y0, x1, y1, color)
        }
    }

    // Octant 0 (dx >= 0, dy >= 0, dx >= dy)
    function drawLineOctant0(x0, y0, x1, y1, color) {
        if (x0 > x1) {
            [x0, x1] = [x1, x0]
            [y0, y1] = [y1, y0]
        }

        const dx = x1 - x0
        const dy = y1 - y0
        let error = 2 * dy - dx
        let y = y0

        for (let x = x0; x <= x1; x++) {
            drawPixelDevice(x, y, color)
            if (error > 0) {
                y += 1
                error += 2 * (dy - dx)
            } else {
                error += 2 * dy
            }
        }
    }

    // Octant 1 (dx >= 0, dy >= 0, dx < dy)
    function drawLineOctant1(x0, y0, x1, y1, color) {
        if (y0 > y1) {
            [x0, x1] = [x1, x0]
            [y0, y1] = [y1, y0]
        }

        const dx = x1 - x0
        const dy = y1 - y0
        let error = 2 * dx - dy
        let x = x0

        for (let y = y0; y <= y1; y++) {
            drawPixelDevice(x, y, color)
            if (error > 0) {
                x += 1
                error += 2 * (dx - dy)
            } else {
                error += 2 * dx
            }
        }
    }

    // Octant 2 (dx < 0, dy >= 0, -dx < dy)
    function drawLineOctant2(x0, y0, x1, y1, color) {
        if (y0 > y1) {
            [x0, x1] = [x1, x0]
            [y0, y1] = [y1, y0]
        }

        const dx = x1 - x0
        const dy = y1 - y0
        let error = 2 * Math.abs(dx) - dy
        let x = x0

        for (let y = y0; y <= y1; y++) {
            drawPixelDevice(x, y, color)
            if (error > 0) {
                x -= 1
                error += 2 * (Math.abs(dx) - dy)
            } else {
                error += 2 * Math.abs(dx)
            }
        }
    }

    // Octant 3 (dx < 0, dy >= 0, -dx >= dy)
    function drawLineOctant3(x0, y0, x1, y1, color) {
        if (x0 < x1) {
            [x0, x1] = [x1, x0]
            [y0, y1] = [y1, y0]
        }

        const dx = x0 - x1; // Make dx positive
        const dy = y1 - y0
        let error = 2 * dy - dx
        let y = y0

        for (let x = x0; x >= x1; x--) {
            drawPixelDevice(x, y, color)
            if (error > 0) {
                y += 1
                error += 2 * (dy - dx)
            } else {
                error += 2 * dy
            }
        }
    }

    // Octant 4 (dx < 0, dy < 0, dx <= dy)
    function drawLineOctant4(x0, y0, x1, y1, color) {
        if (x0 < x1) {
            [x0, x1] = [x1, x0]
            [y0, y1] = [y1, y0]
        }

        const dx = x0 - x1; // Make dx positive
        const dy = y0 - y1; // Make dy positive
        let error = 2 * dy - dx
        let y = y0

        for (let x = x0; x >= x1; x--) {
            drawPixelDevice(x, y, color)
            if (error > 0) {
                y -= 1
                error += 2 * (dy - dx)
            } else {
                error += 2 * dy
            }
        }
    }

    // Octant 5 (dx < 0, dy < 0, dx > dy)
    function drawLineOctant5(x0, y0, x1, y1, color) {
        if (y0 < y1) {
            [x0, x1] = [x1, x0]
            [y0, y1] = [y1, y0]
        }

        const dx = x0 - x1; // Make dx positive
        const dy = y0 - y1; // Make dy positive
        let error = 2 * dx - dy
        let x = x0

        for (let y = y0; y >= y1; y--) {
            drawPixelDevice(x, y, color)
            if (error > 0) {
                x -= 1
                error += 2 * (dx - dy)
            } else {
                error += 2 * dx
            }
        }
    }

    // Octant 6 (dx >= 0, dy < 0, dx < -dy)
    function drawLineOctant6(x0, y0, x1, y1, color) {
        if (y0 < y1) {
            [x0, x1] = [x1, x0]
            [y0, y1] = [y1, y0]
        }

        const dx = x1 - x0
        const dy = y0 - y1; // Make dy positive
        let error = 2 * dx - dy
        let x = x0

        for (let y = y0; y >= y1; y--) {
            drawPixelDevice(x, y, color)
            if (error > 0) {
                x += 1
                error += 2 * (dx - dy)
            } else {
                error += 2 * dx
            }
        }
    }

    // Octant 7 (dx >= 0, dy < 0, dx >= -dy)
    function drawLineOctant7(x0, y0, x1, y1, color) {
        if (x0 > x1) {
            [x0, x1] = [x1, x0]
            [y0, y1] = [y1, y0]
        }

        const dx = x1 - x0
        const dy = y0 - y1; // Make dy positive
        let error = 2 * dy - dx
        let y = y0

        for (let x = x0; x <= x1; x++) {
            drawPixelDevice(x, y, color)
            if (error > 0) {
                y -= 1
                error += 2 * (dy - dx)
            } else {
                error += 2 * dy
            }
        }
    }

    //------------------------------------------------------------------
    //
    // Renders an Hermite curve based on the input parameters.
    //
    //------------------------------------------------------------------
    const hermiteBasisCache = new Map()

    function getHermiteBasis(segments) {
        // Note: This is the optimization for the hermite function
        const cacheKey = segments.toString()
        if (hermiteBasisCache.has(cacheKey)) {
            return hermiteBasisCache.get(cacheKey)
        }

        const basis = []
        for (let i = 0; i <= segments; i++) {
            const t = i / segments
            const t2 = t * t
            const t3 = t2 * t

            basis.push({
                h0: 2 * t3 - 3 * t2 + 1,
                h1: -2 * t3 + 3 * t2,
                h2: t3 - 2 * t2 + t,
                h3: t3 - t2
            })
        }

        // Store in cache - optimization
        hermiteBasisCache.set(cacheKey, basis)
        return basis
    }

    function drawCurveHermite(controls, segments, showPoints, showLine, showControl, lineColor) {
        // controls[0] = P0 (first endpoint) {x, y}
        // controls[1] = T0 (tangent vector at P0) {x, y}
        // controls[2] = P1 (second endpoint) {x, y}
        // controls[3] = T1 (tangent vector at P1) {x, y}

        if (!controls || controls.length < 4) {
            console.error("Hermite curve requires 4 control points")
            return []
        }

        if (segments <= 0) {
            console.warn("Number of segments must be positive")
            return []
        }

        const p0 = controls[0]
        const t0 = controls[1]
        const p1 = controls[2]
        const t1 = controls[3]

        // Pre-compute happens here
        const basis = getHermiteBasis(segments)

        const curvePoints = []
        for (let i = 0; i <= segments; i++) {
            // Use pre-computed basis values
            const { h0, h1, h2, h3 } = basis[i]

            const x = h0 * p0.x + h1 * p1.x + h2 * t0.x + h3 * t1.x
            const y = h0 * p0.y + h1 * p1.y + h2 * t0.y + h3 * t1.y

            curvePoints.push({x, y})
        }

        if (showLine) {
            for (let i = 0; i < curvePoints.length - 1; i++) {
                drawLine(
                    curvePoints[i].x, curvePoints[i].y,
                    curvePoints[i+1].x, curvePoints[i+1].y,
                    lineColor
                )
            }
        }

        if (showPoints) {
            for (const point of curvePoints) {
                drawPoint(point.x, point.y, "red")
            }
        }

        if (showControl) {
            drawPoint(p0.x, p0.y, "blue")
            drawPoint(p1.x, p1.y, "blue")

            // multiplied these by 0.25 because the lines
            // got really long and sometimes went off screen
            drawLine(
                p0.x, p0.y,
                p0.x + (t0.x * 0.25), p0.y + (t0.y * 0.25),
                "green"
            )
            drawLine(
                p1.x, p1.y,
                p1.x + (t1.x * 0.25), p1.y + (t1.y * 0.25),
                "green"
            )
        }

        return curvePoints
    }

    //------------------------------------------------------------------
    //
    // Renders a Cardinal curve based on the input parameters.
    //
    //------------------------------------------------------------------
    function drawCurveCardinal(controls, segments, showPoints, showLine, showControl, lineColor) {
        // controls: {
        //      points: [ {x: number, y: number}, ...],
        //      tension: number
        // }

        if (!controls || !controls.points || !Array.isArray(controls.points)) {
            console.error("Cardinal curve requires controls.points as an array")
            return []
        }

        const points = controls.points

        if (points.length < 2) {
            console.error("Cardinal curve requires at least 2 control points")
            return []
        }

        if (segments <= 0) {
            console.warn("Number of segments must be positive")
            return []
        }

        const tension = controls.tension !== undefined ? controls.tension : 0
        const alpha = (1 - tension) / 2

        // Optimization: Get the pre-computed Hermite basis functions
        const basis = getHermiteBasis(segments)

        const allCurvePoints = []

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = i > 0 ? points[i-1] : points[0]
            const p1 = points[i]
            const p2 = points[i+1]
            const p3 = i < points.length - 2 ? points[i+2] : points[points.length-1]

            const t1 = {
                x: alpha * (p2.x - p0.x),
                y: alpha * (p2.y - p0.y)
            }

            const t2 = {
                x: alpha * (p3.x - p1.x),
                y: alpha * (p3.y - p1.y)
            }

            const segmentPoints = []
            for (let j = 0; j <= segments; j++) {
                // Optimization: pre-computed basis values instead of recalculating
                const { h0, h1, h2, h3 } = basis[j]

                const x = h0 * p1.x + h1 * p2.x + h2 * t1.x + h3 * t2.x
                const y = h0 * p1.y + h1 * p2.y + h2 * t1.y + h3 * t2.y

                segmentPoints.push({x, y})
            }

            if (i < points.length - 2) {
                segmentPoints.pop()
            }

            allCurvePoints.push(...segmentPoints)
        }

        if (showLine) {
            for (let i = 0; i < allCurvePoints.length - 1; i++) {
                drawLine(
                    allCurvePoints[i].x, allCurvePoints[i].y,
                    allCurvePoints[i+1].x, allCurvePoints[i+1].y,
                    lineColor
                )
            }
        }

        if (showPoints) {
            for (const point of allCurvePoints) {
                drawPoint(point.x, point.y, "red")
            }
        }

        if (showControl) {
            // Fixed to use points instead of controls
            for (const point of points) {
                drawPoint(point.x, point.y, "blue")
            }
            for (let i = 0; i < points.length - 1; i++) {
                drawLine(
                    points[i].x, points[i].y,
                    points[i+1].x, points[i+1].y,
                    "green"
                )
            }
        }

        return allCurvePoints
    }

    //------------------------------------------------------------------
    //
    // Renders a Bezier curve based on the input parameters.
    //
    //------------------------------------------------------------------
    const binomialCache = new Map()

    function binomial(n, k) {
        const key = `${n}_${k}`
        if (binomialCache.has(key)) {
            return binomialCache.get(key)
        }

        if (k === 0 || k === n) {
            binomialCache.set(key, 1)
            return 1
        }

        const coeff = binomial(n - 1, k - 1) + binomial(n - 1, k)
        binomialCache.set(key, coeff)
        return coeff
    }

    const bezierBlendingCache = new Map()

    function getBezierBlending(degree, segments) {
        const cacheKey = `${degree}_${segments}`
        if (bezierBlendingCache.has(cacheKey)) {
            return bezierBlendingCache.get(cacheKey)
        }

        const blending = []

        for (let i = 0; i <= segments; i++) {
            const t = i / segments
            const oneMinusT = 1 - t

            const pointBlending = []

            for (let k = 0; k <= degree; k++) {
                const coeff = binomial(degree, k)
                const blend = coeff * Math.pow(t, k) * Math.pow(oneMinusT, degree - k)
                pointBlending.push(blend)
            }

            blending.push(pointBlending)
        }

        bezierBlendingCache.set(cacheKey, blending)
        return blending
    }

    const bezierMatrixCache = new Map()

    function getCubicBezierMatrix() {
        const key = "cubic"
        if (bezierMatrixCache.has(key)) {
            return bezierMatrixCache.get(key)
        }

        // Cubic Bezier matrix
        // [ 1  -3   3  -1 ]
        // [ 0   3  -6   3 ]
        // [ 0   0   3  -3 ]
        // [ 0   0   0   1 ]
        const matrix = {
            m00: 1,  m01: -3,  m02: 3,   m03: -1,
            m10: 0,  m11: 3,   m12: -6,  m13: 3,
            m20: 0,  m21: 0,   m22: 3,   m23: -3,
            m30: 0,  m31: 0,   m32: 0,   m33: 1
        }

        bezierMatrixCache.set(key, matrix)
        return matrix
    }

    const powerBasisCache = new Map()

    function getPowerBasis(segments) {
        const key = segments.toString()
        if (powerBasisCache.has(key)) {
            return powerBasisCache.get(key)
        }

        const basis = []
        for (let i = 0; i <= segments; i++) {
            const t = i / segments
            const t2 = t * t
            const t3 = t2 * t

            basis.push({
                t3: t3,
                t2: t2,
                t1: t,
                t0: 1
            })
        }

        powerBasisCache.set(key, basis)
        return basis
    }

    function drawCurveBezier(controls, segments, showPoints, showLine, showControl, lineColor) {
        if (!controls || !Array.isArray(controls)) {
            console.error("Bezier curve requires an array of control points")
            return []
        }

        if (segments <= 0) {
            console.warn("Number of segments must be positive")
            return []
        }

        const degree = controls.length - 1
        const curvePoints = []

        if (degree === 3) {
            const matrix = getCubicBezierMatrix()
            const powerBasis = getPowerBasis(segments)

            for (let i = 0; i <= segments; i++) {
                // Optimization - powerBasisCache
                const { t3, t2, t1, t0 } = powerBasis[i]

                const c0 = t3 * matrix.m00 + t2 * matrix.m10 + t1 * matrix.m20 + t0 * matrix.m30
                const c1 = t3 * matrix.m01 + t2 * matrix.m11 + t1 * matrix.m21 + t0 * matrix.m31
                const c2 = t3 * matrix.m02 + t2 * matrix.m12 + t1 * matrix.m22 + t0 * matrix.m32
                const c3 = t3 * matrix.m03 + t2 * matrix.m13 + t1 * matrix.m23 + t0 * matrix.m33

                const x = c0 * controls[0].x + c1 * controls[1].x + c2 * controls[2].x + c3 * controls[3].x
                const y = c0 * controls[0].y + c1 * controls[1].y + c2 * controls[2].y + c3 * controls[3].y

                curvePoints.push({x, y})
            }
        } else {
            // Optimization - BezierBlendingCache
            const blending = getBezierBlending(degree, segments)

            for (let i = 0; i <= segments; i++) {
                const pointBlending = blending[i]
                let x = 0
                let y = 0

                for (let k = 0; k <= degree; k++) {
                    x += pointBlending[k] * controls[k].x
                    y += pointBlending[k] * controls[k].y
                }

                curvePoints.push({x, y})
            }
        }

        if (showLine) {
            for (let i = 0; i < curvePoints.length - 1; i++) {
                drawLine(
                    curvePoints[i].x, curvePoints[i].y,
                    curvePoints[i+1].x, curvePoints[i+1].y,
                    lineColor
                )
            }
        }

        if (showPoints) {
            for (const point of curvePoints) {
                drawPoint(point.x, point.y, "red")
            }
        }

        if (showControl) {
            for (const point of controls) {
                drawPoint(point.x, point.y, "blue")
            }

            for (let i = 0; i < controls.length - 1; i++) {
                drawLine(
                    controls[i].x, controls[i].y,
                    controls[i+1].x, controls[i+1].y,
                    "green"
                )
            }
        }

        return curvePoints
    }

    //------------------------------------------------------------------
    //
    // Renders a primitive of the form: {
    //    verts: [ {x, y}, ...],    // Must have at least 2 verts
    //    center: { x, y }
    // }
    //
    // connect: If true, the last vertex and first vertex have a line drawn between them.
    //
    // color: The color to use when drawing the lines
    //
    //------------------------------------------------------------------
    function drawPrimitive(primitive, connect, color) {
        if (!validatePrimitive(primitive)) {
            console.error("(drawPrimitive) Invalid primitive: ", primitive)
            return
        }

        for (let i = 0; i < primitive.verts.length - 1; i++) {
            drawLine(
                primitive.verts[i].x,
                primitive.verts[i].y,
                primitive.verts[i+1].x,
                primitive.verts[i+1].y,
                color
            )

        }
        if (connect) {
            const lastIndex = primitive.verts.length - 1
            drawLine(
                primitive.verts[lastIndex].x,
                primitive.verts[lastIndex].y,
                primitive.verts[0].x,
                primitive.verts[0].y,
                color
            )
        }

        return true
    }

    //------------------------------------------------------------------
    //
    // World to Device (for rendering)
    // X = DeviceSizeX / 2 + WorldX * DeviceSizeX / 2
    // Y = DeviceSizeY / 2 + WorldY * DeviceSizeY / 2
    //
    //------------------------------------------------------------------
    function worldToDevice(points) {
        const convertPoint = (p) => ({
            x: Math.trunc((api.sizeX / 2) + (p.x * api.sizeX / 2)),
            y: Math.trunc((api.sizeY / 2) + (p.y * api.sizeY / 2))
        })
        return Array.isArray(points) ? points.map(p => convertPoint(p)) : convertPoint(points)
    }

    //------------------------------------------------------------------
    //
    // Device to World (for things like picking)
    // WorldX = (DeviceX - DeviceSizeX / 2) / (DeviceSizeX / 2)
    // WorldY = (DeviceY - DeviceSizeY / 2) / (DeviceSizeY / 2)
    //
    //------------------------------------------------------------------
    function deviceToWorld(points) {
        const convertPoint = (p) => ({
            x: (p.x - api.sizeX / 2) / (api.sizeX / 2),
            y: (p.y - api.sizeY / 2) / (api.sizeY / 2)
        })
        return Array.isArray(points) ? points.map(p => convertPoint(p)) : convertPoint(points)
    }

    //------------------------------------------------------------------
    //
    // Entry point for rendering the different types of curves.
    // I know a different (functional) JavaScript pattern could be used
    // here.  My goal was to keep it looking Java or C++'ish to keep it familiar
    // to those not experts in JavaScript.
    //
    //------------------------------------------------------------------
    function drawCurve(type, controls, segments, showPoints, showLine, showControl, lineColor) {
        switch (type) {
            case api.Curve.Hermite:
                drawCurveHermite(controls, segments, showPoints, showLine, showControl, lineColor)
                break
            case api.Curve.Cardinal:
                drawCurveCardinal(controls, segments, showPoints, showLine, showControl, lineColor)
                break
            case api.Curve.Bezier:
                drawCurveBezier(controls, segments, showPoints, showLine, showControl, lineColor)
                break
        }
    }

    //------------------------------------------------------------------
    //
    // Translates a point of the form: { x, y }
    //
    // distance: { x, y }
    //
    //------------------------------------------------------------------
    function translatePoint(point, distance) {
        if (!validatePoint(point) || !validatePoint(distance)) {
            console.error("(translatePoint) Invalid coordinate(s): ", point, distance)
            return
        }

        return {
            x: point.x + distance.x,
            y: point.y + distance.y
        }
    }

    //------------------------------------------------------------------
    //
    // Translates a primitive of the form: {
    //    verts: [],    // Must have at least 2 verts
    //    center: { x, y }
    // }
    //
    // distance: { x, y }
    //
    //------------------------------------------------------------------
    function translatePrimitive(primitive, distance) {
        if (!validatePrimitive(primitive)) {
            console.error("(translatePrimitive) Invalid primitive: ", primitive)
            return
        }

        if (!validatePoint(distance)) {
            console.error("(translatePrimitive) Invalid distance: ", distance)
            return
        }

        const translatedVerts = primitive.verts.map(vertex =>
            translatePoint(vertex, distance)
        );

        let translatedCenter = { x: 0, y: 0 } // default center
        if (primitive.center) {
            translatedCenter = translatePoint(primitive.center, distance);
        }

        return {
            verts: translatedVerts,
            center: translatedCenter
        }
    }

    //------------------------------------------------------------------
    //
    // Scales a primitive of the form: {
    //    verts: [],    // Must have at least 2 verts
    //    center: { x, y }
    // }
    //
    // scale: { x, y }
    //
    // translate to origin
    // scale
    // translate back
    //
    //------------------------------------------------------------------
    function scalePrimitive(primitive, scale) {
        if (!validatePrimitive(primitive)) {
            console.error("(scalePrimitive) Invalid primitive: ", primitive)
            return
        }

        if (!validatePoint(scale)) {
            console.error("(scalePrimitive) Invalid distance: ", scale)
            return
        }

        const translation = getReverseTranslation(primitive.center)
        const translatedPrimitive = translatePrimitive(primitive, translation)

        const scaledVerts = translatedPrimitive.verts.map(vertex => ({
            x: vertex.x * scale.x,
            y: vertex.y * scale.y
        }))

        const translateBack = getReverseTranslation(translation)
        const scaledPrimitive = {
            verts: scaledVerts,
            center: translatedPrimitive.center
        }
        return translatePrimitive(scaledPrimitive, translateBack)
    }

    function scalePrimitiveOptimized(primitive, scale) {
        if (!validatePrimitive(primitive)) {
            console.error("(scalePrimitive) Invalid primitive: ", primitive)
            return
        }

        if (!validatePoint(scale)) {
            console.error("(scalePrimitive) Invalid scale: ", scale)
            return
        }

        const cx = primitive.center.x
        const cy = primitive.center.y
        const sx = scale.x
        const sy = scale.y
        const tx = cx * (1 - sx)  // Translation for x
        const ty = cy * (1 - sy)  // Translation for y

        const scaledVerts = primitive.verts.map(vertex => ({
            x: sx * vertex.x + tx,
            y: sy * vertex.y + ty
        }))

        return {
            verts: scaledVerts,
            center: primitive.center  // Center stays the same
        }
    }

    //------------------------------------------------------------------
    //
    // Rotates a primitive of the form: {
    //    verts: [],    // Must have at least 2 verts
    //    center: { x, y }
    // }
    //
    // angle: radians
    //
    //------------------------------------------------------------------
    function rotatePrimitive(primitive, angle) {

    }

    //------------------------------------------------------------------
    //
    // Translates a curve.
    //    type: Cardinal, Bezier
    //    controls: appropriate to the curve type
    //    distance: { x, y }
    //
    //------------------------------------------------------------------
    function translateCurve(type, controls, distance) {

    }

    //------------------------------------------------------------------
    //
    // Scales a curve relative to its center.
    //    type: Cardinal, Bezier
    //    controls: appropriate to the curve type
    //    scale: { x, y }
    //
    //------------------------------------------------------------------
    function scaleCurve(type, controls, scale) {

    }

    //------------------------------------------------------------------
    //
    // Rotates a curve about its center.
    //    type: Cardinal, Bezier
    //    controls: appropriate to the curve type
    //    angle: radians
    //
    //------------------------------------------------------------------
    function rotateCurve(type, controls, angle) {

    }

    // Helpers
    function validatePoint(point) {
        return !point || typeof point.x !== 'number' || typeof point.y !== 'number'
    }

    function validatePrimitive(primitive) {
        if (!primitive?.verts || primitive.verts.length < 2) {
            return false
        }

        for (const point of primitive.verts) {
            if (!validatePoint(point)) {
                console.error("(validatePrimitive) Invalid point: ", point)
                return false
            }
        }
        return true
    }

    function getReverseTranslation(distance) {
        return {
            x: -distance.x,
            y: -distance.y
        }
    }

    //
    // This is what we'll export as the rendering API
    const api = {
        clear: clear,
        drawPixel: drawPixel,
        drawLine: drawLine,
        drawCurve: drawCurve,
        drawPrimitive: drawPrimitive,
        translatePrimitive: translatePrimitive,
        scalePrimitive: scalePrimitiveOptimized,
        rotatePrimitive: rotatePrimitive,
        translateCurve: translateCurve,
        scaleCurve: scaleCurve,
        rotateCurve: rotateCurve
    }

    Object.defineProperty(api, 'sizeX', {
        value: pixelsX,
        writable: false
    })
    Object.defineProperty(api, 'sizeY', {
        value: pixelsY,
        writable: false
    })
    Object.defineProperty(api, 'Curve', {
        value: Object.freeze({
            Hermite: 0,
            Cardinal: 1,
            Bezier: 2
        }),
        writable: false
    })

    return api
}(500, 500, true))
