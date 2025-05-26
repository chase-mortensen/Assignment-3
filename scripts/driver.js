
MySample.main = (function(graphics) {
    'use strict';

    let previousTime = performance.now();

    //------------------------------------------------------------------
    //
    // Scene updates go here.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {

    }

    //------------------------------------------------------------------
    //
    // Rendering code goes here
    //
    //------------------------------------------------------------------
    function render() {
        graphics.clear();

        graphics.drawPrimitive({
                verts: [
                    {x: -0.9, y: -0.7},
                    {x: 0.8, y: -0.6},
                    {x: 0.1, y: 0.7},
                ],
                center: {x: 0, y: 0}
            },
            true,
            'rgb(255, 255, 255)'
        )
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
    requestAnimationFrame(animationLoop);

}(MySample.graphics));
