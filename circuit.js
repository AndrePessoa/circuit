'use strict';

var createCircuit = function(settings){
    var frame = 0;
    var state = 'playing';

    // setup stuff.
    var wrapper = document.createElement("div"),
        canvasTraces = document.createElement("canvas"),
        ctxTraces = canvasTraces.getContext("2d"),
        canvasGrid = document.createElement("canvas"),
        ctxGrid = canvasGrid.getContext("2d"),
        width = 250,
        height = 250,
        centerX = Math.round(( width / 2 ) / settings.step ) * settings.step,
        centerY = Math.round(( height / 2 ) / settings.step ) * settings.step
    
    wrapper.id = 'circuit-canvas';

    wrapper.appendChild(canvasGrid);
    canvasGrid.width = width;
    canvasGrid.height = height;
    canvasGrid.id = 'canvas-grid';

    wrapper.appendChild(canvasTraces);
    canvasTraces.width = width;
    canvasTraces.height = height;
    canvasTraces.id = 'canvas-traces';

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
        ctxTraces.clearRect(0, 0, width, height);

        var factorX = 0.2 + Math.random() * 0.6;
        var factorY = 0.2 + Math.random() * 0.6;

        centerX = Math.round(( width * factorX ) / settings.step ) * settings.step;
        centerY = Math.round(( height * factorY ) / settings.step ) * settings.step;

        traces = initter.init({
            ctx: ctxTraces,
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
        ctx: ctxTraces,
        traceNum: traceNum, 
        width: width, 
        height: height,
        centerX: centerX,
        centerY: centerY,
        step: settings.step
    });

    function drawGrid() {
        ctxGrid.clearRect(0, 0, width, height);
        ctxGrid.fillStyle = "#ccc";
        ctxGrid.lineWidth = 1;
        ctxGrid.globalAlpha = .5;

        for( var x = 0; x < width; x += settings.step ){
            for( var y = 0; y < height; y += settings.step ){
                ctxGrid.strokeStyle = "#ffe99b";
                ctxGrid.fillStyle = "#fff";
                ctxGrid.fillRect(x-.5,y-.5,1,1);
            }
        }
        ctxGrid.lineWidth = 3;
        ctxGrid.strokeStyle = "#ddd";
        ctxGrid.strokeRect(1.5, 1.5, width - 3, height - 3);
    }

    function drawTrace() {
        ctxTraces.globalAlpha = 1;
        ctxTraces.lineWidth = 3;
        ctxTraces.strokeStyle = "ddd";
        ctxTraces.strokeRect(1.5, 1.5, width - 3, height - 3);

        ctxTraces.strokeStyle = "#698a8a";
        ctxTraces.fillStyle = "#385050";
        ctxTraces.lineWidth = 2.5;
        ctxTraces.lineCap = 'round';

        for (var b = 0; b < traces.length; b++) {
            traces[b].render(ctxTraces);
        }

        for (b = 0; b < traces.length; b++) {
            traces[b].update();
        }
    }

    function draw () {
        ctxTraces.clearRect(0, 0, width, height);
        initter.draw();
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

    canvasTraces.addEventListener("click", function(e){ reinit(e) });
    canvasTraces.addEventListener("mousedown", function(e){ state = 'paused' });

    tick();
    drawGrid();
};