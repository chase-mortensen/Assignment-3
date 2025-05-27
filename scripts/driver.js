MySample.main = (function(graphics) {
    'use strict';

    let previousTime = performance.now();
    let totalTime = 0;

    const primitives = {
        triangle: {
            verts: [
                {x: 0, y: -0.15},
                {x: -0.13, y: 0.075},
                {x: 0.13, y: 0.075}
            ],
            center: {x: 0, y: 0}
        },
        square: {
            verts: [
                {x: -0.1, y: -0.1},
                {x: 0.1, y: -0.1},
                {x: 0.1, y: 0.1},
                {x: -0.1, y: 0.1}
            ],
            center: {x: 0, y: 0}
        },
        pentagon: {
            verts: [],
            center: {x: 0, y: 0}
        },
        hexagon: {
            verts: [],
            center: {x: 0, y: 0}
        },
        star: {
            verts: [],
            center: {x: 0, y: 0}
        },
        diamond: {
            verts: [
                {x: 0, y: -0.15},
                {x: 0.1, y: 0},
                {x: 0, y: 0.15},
                {x: -0.1, y: 0}
            ],
            center: {x: 0, y: 0}
        }
    };

    function initializePolygons() {
        // Pentagon
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
            primitives.pentagon.verts.push({
                x: Math.cos(angle) * 0.12,
                y: Math.sin(angle) * 0.12
            });
        }

        // Hexagon
        for (let i = 0; i < 6; i++) {
            const angle = i * 2 * Math.PI / 6;
            primitives.hexagon.verts.push({
                x: Math.cos(angle) * 0.1,
                y: Math.sin(angle) * 0.1
            });
        }

        // Star (5-pointed)
        for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI / 5) - Math.PI / 2;
            const radius = i % 2 === 0 ? 0.15 : 0.06;
            primitives.star.verts.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }
    }

    const curves = {
        // Bezier curve that will spiral
        bezier1: {
            type: graphics.Curve.Bezier,
            controls: [
                {x: -0.3, y: 0},
                {x: -0.15, y: -0.2},
                {x: 0.15, y: 0.2},
                {x: 0.3, y: 0}
            ]
        },

        // Cardinal spline for smooth animation
        cardinal1: {
            type: graphics.Curve.Cardinal,
            controls: {
                points: [
                    {x: -0.2, y: -0.2},
                    {x: 0, y: -0.1},
                    {x: 0.2, y: -0.2},
                    {x: 0.2, y: 0},
                    {x: 0, y: 0.1},
                    {x: -0.2, y: 0}
                ],
                tension: 0.5
            }
        }
    };

    const animations = {
        // Rotating triangle around center
        triangle: {
            angle: 0,
            scale: 1,
            scaleDir: 1,
            position: {x: 0, y: 0},
            pivot: {x: 0, y: 0}
        },

        // Square orbiting and rotating
        square: {
            angle: 0,
            orbitAngle: 0,
            orbitRadius: 0.4,
            scale: 1
        },

        // Pentagon with changing pivot
        pentagon: {
            angle: 0,
            pivotAngle: 0,
            scale: 1
        },

        // Hexagon translating in figure-8
        hexagon: {
            pathT: 0,
            angle: 0,
            scale: 1
        },

        // Star pulsing and rotating
        star: {
            angle: 0,
            scale: 1,
            pulsePhase: 0
        },

        // Diamond rotating around moving pivot
        diamond: {
            angle: 0,
            pivotT: 0,
            scale: 1
        },

        // Curves
        bezier: {
            angle: 0,
            scale: 1,
            scalePhase: 0
        },

        cardinal: {
            angle: 0,
            position: {x: 0, y: 0},
            movePhase: 0
        }
    };

    const colors = [
        'rgb(255, 100, 100)',  // Red
        'rgb(100, 255, 100)',  // Green
        'rgb(100, 100, 255)',  // Blue
        'rgb(255, 255, 100)',  // Yellow
        'rgb(255, 100, 255)',  // Magenta
        'rgb(100, 255, 255)',  // Cyan
        'rgb(255, 200, 100)',  // Orange
        'rgb(200, 100, 255)'   // Purple
    ];

    //------------------------------------------------------------------
    //
    // Scene updates go here.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        totalTime += elapsedTime;
        const seconds = totalTime / 1000;

        // Update triangle - rotation and scaling
        animations.triangle.angle += elapsedTime * 0.001;
        animations.triangle.scale = 1 + Math.sin(seconds) * 0.3;

        // Update square - orbiting motion with rotation
        animations.square.orbitAngle += elapsedTime * 0.0008;
        animations.square.angle -= elapsedTime * 0.002;

        // Update pentagon - rotating with moving pivot
        animations.pentagon.angle += elapsedTime * 0.0015;
        animations.pentagon.pivotAngle += elapsedTime * 0.0005;
        animations.pentagon.scale = 1 + Math.sin(seconds * 1.5) * 0.2;

        // Update hexagon - figure-8 motion
        animations.hexagon.pathT += elapsedTime * 0.0006;
        animations.hexagon.angle -= elapsedTime * 0.001;
        animations.hexagon.scale = 1 + Math.cos(seconds * 2) * 0.15;

        // Update star - pulsing and spinning
        animations.star.angle += elapsedTime * 0.003;
        animations.star.pulsePhase += elapsedTime * 0.004;
        animations.star.scale = 1 + Math.sin(animations.star.pulsePhase) * 0.4;

        // Update diamond - complex motion
        animations.diamond.angle -= elapsedTime * 0.0025;
        animations.diamond.pivotT += elapsedTime * 0.001;
        animations.diamond.scale = 1.2 + Math.sin(seconds * 0.8) * 0.3;

        // Update curves
        animations.bezier.angle += elapsedTime * 0.0012;
        animations.bezier.scalePhase += elapsedTime * 0.002;
        animations.bezier.scale = 1 + Math.sin(animations.bezier.scalePhase) * 0.5;

        animations.cardinal.angle -= elapsedTime * 0.0018;
        animations.cardinal.movePhase += elapsedTime * 0.001;
    }

    //------------------------------------------------------------------
    //
    // Helper function for figure-8 path
    //
    //------------------------------------------------------------------
    function getFigure8Position(t) {
        return {
            x: Math.sin(t) * 0.3,
            y: Math.sin(t * 2) * 0.15
        };
    }

    //------------------------------------------------------------------
    //
    // Helper function to mirror a primitive across the origin
    //
    //------------------------------------------------------------------
    function mirrorPrimitive(primitive) {
        return {
            verts: primitive.verts.map(v => ({
                x: -v.x,
                y: -v.y
            })),
            center: {
                x: -primitive.center.x,
                y: -primitive.center.y
            }
        };
    }

    //------------------------------------------------------------------
    //
    // Helper function to mirror curve controls across the origin
    //
    //------------------------------------------------------------------
    function mirrorCurveControls(type, controls) {
        if (type === graphics.Curve.Cardinal) {
            return {
                ...controls,
                points: controls.points.map(p => ({
                    x: -p.x,
                    y: -p.y
                }))
            };
        } else {
            // Bezier or other curves
            return controls.map(p => ({
                x: -p.x,
                y: -p.y
            }));
        }
    }

    //------------------------------------------------------------------
    //
    // Rendering code goes here
    //
    //------------------------------------------------------------------
    function render() {
        graphics.clear();

        // Center triangle
        let transformed = graphics.scalePrimitive(primitives.triangle, {
            x: animations.triangle.scale,
            y: animations.triangle.scale
        });
        transformed = graphics.rotatePrimitive(transformed, animations.triangle.angle);
        graphics.drawPrimitive(transformed, true, colors[0]);

        // Square
        const squarePos = {
            x: Math.cos(animations.square.orbitAngle) * animations.square.orbitRadius,
            y: Math.sin(animations.square.orbitAngle) * animations.square.orbitRadius
        };
        transformed = graphics.rotatePrimitive(primitives.square, animations.square.angle);
        transformed = graphics.translatePrimitive(transformed, squarePos);
        graphics.drawPrimitive(transformed, true, colors[1]);

        // Mirror of square
        let mirrored = mirrorPrimitive(transformed);
        graphics.drawPrimitive(mirrored, true, colors[1]);

        // Pentagon
        const pentagonPivot = {
            x: Math.cos(animations.pentagon.pivotAngle) * 0.05,
            y: Math.sin(animations.pentagon.pivotAngle) * 0.05
        };
        transformed = graphics.translatePrimitive(primitives.pentagon, {x: -0.5, y: 0.3});
        transformed = graphics.scalePrimitive(transformed, {
            x: animations.pentagon.scale,
            y: animations.pentagon.scale
        });
        const pentagonWithPivot = {
            verts: transformed.verts,
            center: pentagonPivot
        };
        transformed = graphics.rotatePrimitive(pentagonWithPivot, animations.pentagon.angle);
        graphics.drawPrimitive(transformed, true, colors[2]);

        // Mirror of pentagon
        mirrored = mirrorPrimitive(transformed);
        graphics.drawPrimitive(mirrored, true, colors[2]);

        // Hexagon
        const hexPos = getFigure8Position(animations.hexagon.pathT);
        transformed = graphics.scalePrimitive(primitives.hexagon, {
            x: animations.hexagon.scale,
            y: animations.hexagon.scale
        });
        transformed = graphics.rotatePrimitive(transformed, animations.hexagon.angle);
        transformed = graphics.translatePrimitive(transformed, hexPos);
        graphics.drawPrimitive(transformed, true, colors[3]);

        // Mirror of hexagon
        mirrored = mirrorPrimitive(transformed);
        graphics.drawPrimitive(mirrored, true, colors[3]);

        // Star
        transformed = graphics.scalePrimitive(primitives.star, {
            x: animations.star.scale,
            y: animations.star.scale
        });
        transformed = graphics.rotatePrimitive(transformed, animations.star.angle);
        transformed = graphics.translatePrimitive(transformed, {x: 0.5, y: -0.3});
        graphics.drawPrimitive(transformed, true, colors[4]);

        // Mirror of star
        mirrored = mirrorPrimitive(transformed);
        graphics.drawPrimitive(mirrored, true, colors[4]);

        // Diamond
        const diamondPivotPos = {
            x: Math.cos(animations.diamond.pivotT) * 0.1,
            y: Math.sin(animations.diamond.pivotT) * 0.1
        };
        transformed = graphics.translatePrimitive(primitives.diamond, {x: -0.4, y: -0.4});
        transformed = graphics.scalePrimitive(transformed, {
            x: animations.diamond.scale,
            y: animations.diamond.scale
        });
        const diamondWithPivot = {
            verts: transformed.verts,
            center: {
                x: transformed.verts[0].x + diamondPivotPos.x,
                y: transformed.verts[0].y + diamondPivotPos.y
            }
        };
        transformed = graphics.rotatePrimitive(diamondWithPivot, animations.diamond.angle);
        graphics.drawPrimitive(transformed, true, colors[5]);

        // Mirror of diamond
        mirrored = mirrorPrimitive(transformed);
        graphics.drawPrimitive(mirrored, true, colors[5]);

        // Bezier curve
        let curveTransformed = graphics.scaleCurve(
            curves.bezier1.type,
            curves.bezier1.controls,
            {
                x: animations.bezier.scale,
                y: animations.bezier.scale
            }
        );
        curveTransformed = graphics.rotateCurve(
            curves.bezier1.type,
            curveTransformed,
            animations.bezier.angle
        );
        curveTransformed = graphics.translateCurve(
            curves.bezier1.type,
            curveTransformed,
            {x: 0.4, y: 0.3}
        );
        graphics.drawCurve(
            curves.bezier1.type,
            curveTransformed,
            20,
            false,
            true,
            false,
            colors[6]
        );

        // Mirror of Bezier curve
        const mirroredBezier = mirrorCurveControls(curves.bezier1.type, curveTransformed);
        graphics.drawCurve(
            curves.bezier1.type,
            mirroredBezier,
            20,
            false,
            true,
            false,
            colors[6]
        );

        // Cardinal spline
        const cardinalOffset = {
            x: Math.cos(animations.cardinal.movePhase) * 0.1,
            y: Math.sin(animations.cardinal.movePhase * 1.5) * 0.1
        };
        curveTransformed = graphics.rotateCurve(
            curves.cardinal1.type,
            curves.cardinal1.controls,
            animations.cardinal.angle
        );
        curveTransformed = graphics.translateCurve(
            curves.cardinal1.type,
            curveTransformed,
            {x: -0.3 + cardinalOffset.x, y: -0.2 + cardinalOffset.y}
        );
        graphics.drawCurve(
            curves.cardinal1.type,
            curveTransformed,
            15,
            false,
            true,
            false,
            colors[7]
        );

        // Mirror of Cardinal spline
        const mirroredCardinal = mirrorCurveControls(curves.cardinal1.type, curveTransformed);
        graphics.drawCurve(
            curves.cardinal1.type,
            mirroredCardinal,
            15,
            false,
            true,
            false,
            colors[7]
        );
    }

    //------------------------------------------------------------------
    //
    // This is the animation loop.
    //
    //------------------------------------------------------------------
    function animationLoop(time) {
        const elapsedTime = time - previousTime;
        previousTime = time;
        update(elapsedTime);
        render();

        requestAnimationFrame(animationLoop);
    }

    console.log('initializing...');
    initializePolygons();
    requestAnimationFrame(animationLoop);

}(MySample.graphics));