'use strict';

var createCircuit = function(settings){
    var frame = 0;
    var state = 'playing';

    // setup stuff.
    var wrapper = document.createElement("div"),
        canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d"),
        width = 250,
        height = 250,
        centerX = Math.round(( width / 2 ) / settings.step ) * settings.step,
        centerY = Math.round(( height / 2 ) / settings.step ) * settings.step
    
    wrapper.id = 'circuit-canvas';
    wrapper.appendChild(canvas);

    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(wrapper);
    grid.create(width, height, settings.step);

    // init
    var traces = [],
        traceNum = settings.startTraces,
        reqAnimFrameInstance = null;

    function reinit(e) {
        cancelAnimationFrame(reqAnimFrameInstance);
        //settings.startTraces += 2;
        //InitCircle.radius += 2;
        grid.create(width, height, settings.step);
        traces = [];
        traceNum = settings.startTraces;
        ctx.clearRect(0, 0, width, height);

        var factorX = 0.2 + Math.random() * 0.6;
        var factorY = 0.2 + Math.random() * 0.6;

        centerX = Math.round(( width * factorX ) / settings.step ) * settings.step;
        centerY = Math.round(( height * factorY ) / settings.step ) * settings.step;

        traces = initter.init({
            ctx: ctx,
            traceNum: traceNum, 
            width: width, 
            height: height,
            centerX: Math.round(( centerX ) / settings.step ) * settings.step,
            centerY: Math.round(( centerY ) / settings.step ) * settings.step,
            step: settings.step
        });

        state = 'playing';
        tick();
    };

    var initter = window[ "init" + settings.initForm ] || window.initCircle;
    traces = initter.init({
        ctx: ctx,
        traceNum: traceNum, 
        width: width, 
        height: height,
        centerX: centerX,
        centerY: centerY,
        step: settings.step
    });

    function drawGrid() {
        ctx.save();
        ctx.strokeStyle = "#ffe99b";
        ctx.fillStyle = "#ccc";
        ctx.lineWidth = 1;
        ctx.globalAlpha = .5;

        for( var x = 0; x < width; x += settings.step ){
            for( var y = 0; y < height; y += settings.step ){
                var code = grid.getCell( x, y );
                if( isNaN( code ) ){
                    switch(code){
                        case "#":
                            ctx.strokeStyle = "#ffe99b";
                            ctx.fillStyle = "#ccc";
                        break;
                        case "!":                    
                            ctx.strokeStyle = "#ff0000";
                            ctx.fillStyle = "#ff0000";
                        break;
                        case "?":                    
                            ctx.strokeStyle = "#0000ff";
                            ctx.fillStyle = "#0000ff";
                        break;
                        case ";":                    
                            ctx.strokeStyle = "#ff00ff";
                            ctx.fillStyle = "#ff00ff";
                        break;
                        default:
                            ctx.strokeStyle = "#ffe99b";
                            ctx.fillStyle = "#ccc";
                    }
                    ctx.fillRect(x-.5,y-.5,1,1);
                }

            }
        }
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#ddd";
        ctx.strokeRect(3, 3, width - 6, height - 6);
        ctx.restore();
    }

    function drawTrace() {
        ctx.strokeStyle = "#698a8a";
        ctx.fillStyle = "#385050";
        ctx.lineWidth = 2.5;

        for (var b = 0; b < traces.length; b++) {
            traces[b].stroke = "#698a8a";
            traces[b].render(ctx);
        }

        for (b = 0; b < traces.length; b++) {
            traces[b].update();
        }
    }

    function draw () {
        ctx.clearRect(0, 0, width, height);
        initter.draw();
        drawGrid();
        drawTrace();
    }

    function tick() {
        if(state === 'paused') return reqAnimFrameInstance = requestAnimationFrame(tick);

        frame += 1;
        if(frame % 3 === 0) {
            draw();
        };

        if( !traces.filter((t)=>t.state !== "died").length ){
            setTimeout(reinit, 3000);
            draw();
            state === 'paused';
        }else{
            reqAnimFrameInstance = requestAnimationFrame(tick);
        }
        
    }

    canvas.addEventListener("click", function(e){ reinit(e) });
    canvas.addEventListener("mousedown", function(e){ state = 'paused' });

    tick();
};