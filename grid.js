
var grid = {
    cells: [],
    _scale: 0,
    _width: 0,
    width: 0,
    height: 0,
    create: function(width, height, scale){
        this.width = width;
        this.height = height;
        this._width = (width/scale) - 1;
        this.scale = scale;
        this.cells = new Array( Math.ceil( height/scale * width/scale ) );
    },
    toScale( value ){
        return Math.round( value / this.scale );
    },
    checkCell: function(x, y, angles){
        var cellIndex = Math.round( this.toScale(x) + this.toScale(y) * this._width );
        var cellValue = this.cells[ cellIndex ];
        return cellValue !== undefined && ( angles === undefined || ( angles.indexOf( cellValue ) > -1 ) )
    },
    getCell: function(x, y, mark){
        var cellIndex = Math.round( this.toScale(x) + this.toScale(y) * this._width );
        if( mark !== undefined && this.cells[ cellIndex ] ) this.cells[ cellIndex ] = "!";
        return this.cells[ cellIndex ];
    },
    setCell: function(x, y, value){
        var cellIndex = Math.round( this.toScale(x) + this.toScale(y) * this._width );
        this.cells[ cellIndex ] = value;
        return this.cells[ cellIndex ];
    },
    checkVector: function( startX, startY, endX, endY ){
        startX = startX / this.scale;
        startY = startY / this.scale;
        endX = endX / this.scale;
        endY = endY / this.scale;

        var topPoint = Math.max( startX, endX );
        var bottomPoint = Math.min( startX, endX );
        var leftPoint = Math.max( startY, endY );
        var rightPoint = Math.min( startY, endY );

        var verticalDist = topPoint - bottomPoint;
        var horizontalDist = leftPoint - rightPoint;

        for (let i = 0; i <= verticalDist; i++) {
            var y = bottomPoint + i;
            for (let j = 0; j <= verticalDist; j++) {
                var x = leftPoint + j;
                var cellIndex = x + y * this._width;
                if( this.cells[ cellIndex ] !== undefined ) return true; 
            }                
        }

        return false;
    },
    getSector: function( x, y ){
        return {
            horizontal: x > this.width / 2,
            vertical: x > this.height / 2
        }
    },
    console: function(){
        for (let l = 0; l < this.cells.length; ( l += this._width )) {
            var y = l / this._width;
            var line = "";
            for (let x = 0; x < this._width; x++) {
                line += this.getCell( x*this.scale, y*this.scale ) == "#" ? "||" : "..";                    
            }
            console.log(line);
        }
    }
};
window.grid = grid;