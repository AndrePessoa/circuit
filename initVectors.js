var initCircle = {
    radius: 20,
    radiusSpread: 20,
    vectors: [],
    init: function(opts){
        var traces = [];
        this.vectors = [];
        this.x = opts.centerX;
        this.y = opts.centerY;
        this.step = opts.step;
        this.ctx = opts.ctx;

        var radius = this.radius;

        var incAng = 360 * (Math.PI / 180) / opts.traceNum;
        for (var b = 0; b < opts.traceNum; b++) {

            var outterRadius = radius + this.radiusSpread * Math.random() + this.step;
            var bolinhaAng = incAng * b;
            var vectorAng = Math.round(( bolinhaAng ) / ( Math.PI / 4 ) ) * ( Math.PI / 4 );
            var x = Math.round( ( this.x + ( Math.sin( bolinhaAng ) * outterRadius ) ) / this.step ) * this.step;
            var y = Math.round( ( this.y + ( Math.cos( bolinhaAng ) * outterRadius ) ) / this.step ) * this.step;

            if( grid.checkCell( x, y ) ){
                //b--;
                continue;
            }

            //var x = Math.round(Math.random() * width);
            //var y = Math.round(Math.random() * height);

            this.vectors.push({x: x, y:y, ang: bolinhaAng});

            if( x > 0 && x < opts.width &&
                y > 0 && y < opts.height
            ){
                traces.push(new Trace({
                    x: x,
                    y: y,
                    angle: ( bolinhaAng ),
                    step: opts.step
                }, grid));
            }
        }
        this.addToGrid();
        return traces;
    },
    addToGrid: function(){
        var radius = this.radius + this.step;
        var bX = this.x - radius;
        var bY = this.y - radius;
        for (var i = 0; i < radius * 2; ( i += this.step )) {
            for (var j = 0; j < radius * 2; ( j += this.step )) {
                var vert = i - radius;
                var horz = j - radius;
                var dist = Math.sqrt( vert * vert + horz * horz );
                if( dist < radius ) grid.setCell( bX + j, bY + i, "#" );                    
            }
        }
    },
    draw: function(){
        var circles = [.15, .65, 1.25, 2, 4, 8];
        var ctx = this.ctx;

        ctx.save();
        ctx.strokeStyle = "#ddd";
        ctx.fillStyle = "#ccc";
        ctx.lineWidth = .1;    

        ctx.beginPath();

        circles.forEach((rad) => {
            ctx.moveTo(this.x + this.radius + this.step * rad, this.y);
            ctx.arc(this.x, this.y, this.radius + this.step * rad, 0, Math.PI * 2);
        });

        for (var v = 0, plen = this.vectors.length; v < plen; v++) {
            var destX = Math.sin( this.vectors[v].ang ) * 300 + this.vectors[v].x;
            var destY = Math.cos( this.vectors[v].ang ) * 300 + this.vectors[v].y;
            ctx.moveTo(this.vectors[v].x, this.vectors[v].y);
            ctx.lineTo(destX, destY);
        }

        ctx.stroke();
        ctx.restore();
    }
}