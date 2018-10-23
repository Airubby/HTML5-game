(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
$(window).load(function() {
	game.init();
});

var game={
    init:function(){
        levels.init();
        loader.init();

        $('.gamelayer').hide();
        $('#gamestartscreen').show();
        
        //Get handler for game canvas and context
        game.canvas = $('#gamecanvas')[0];
        game.context = game.canvas.getContext('2d');

    },
    showLevelScreen:function(){
		$('.gamelayer').hide();
        $('#levelselectscreen').show('slow');
    },
    // Game Mode
	mode:"intro", 
    // X & Y Coordinates of the slingshot
	slingshotX:140,
    slingshotY:280,
    start:function(){
        $('.gamelayer').hide();
        // Display the game canvas and score 
        $('#gamecanvas').show();
        $('#scorescreen').show();

        game.mode = "intro";    
        game.offsetLeft = 0;
		game.ended = false;
		game.animationFrame = window.requestAnimationFrame(game.animate,game.canvas);
    },
    handlePanning:function(){
        game.offsetLeft++; //临时函数，是图像右移
    },
    animate:function(){
        // 移动背景
       game.handlePanning();
       
       // 使角色移动
     	
        
        //  使用视差滚动绘制背景
        game.context.drawImage(game.currentLevel.backgroundImage,game.offsetLeft/4,0,640,480,0,0,640,480);
        game.context.drawImage(game.currentLevel.foregroundImage,game.offsetLeft,0,640,480,0,0,640,480);
        

        //绘制弹弓
        game.context.drawImage(game.slingshotImage,game.slingshotX-game.offsetLeft,game.slingshotY);
		
		game.context.drawImage(game.slingshotFrontImage,game.slingshotX-game.offsetLeft,game.slingshotY);

      	if (!game.ended){
			game.animationFrame = window.requestAnimationFrame(game.animate,game.canvas);
		}	
    },

}

var levels ={
    data:[
	    {   // First level 
	        foreground:'desert-foreground',
	        background:'clouds-background',
			entities:[]
	    },
        {   // Second level 
            foreground:'desert-foreground',
            background:'clouds-background',
			entities:[]
        }
    ],
    init:function(){
        var html = "";
        for (var i=0; i < levels.data.length; i++) {
            var level = levels.data[i];
            html += '<input type="button" value="'+(i+1)+'">';
        };
        $('#levelselectscreen').html(html);
        
        // Set the button click event handlers to load level
        $('#levelselectscreen input').click(function(){
            levels.load(this.value-1);
            $('#levelselectscreen').hide();
        });
    },
    load:function(number){

        // declare a new current level object
        game.currentLevel = {number:number,hero:[]};
		game.score=0;
		$('#score').html('Score: '+game.score);
        var level = levels.data[number];

        //load the background, foreground and slingshot images
        game.currentLevel.backgroundImage = loader.loadImage("images/gameOne/backgrounds/"+level.background+".png");
        game.currentLevel.foregroundImage = loader.loadImage("images/gameOne/backgrounds/"+level.foreground+".png");
        game.slingshotImage = loader.loadImage("images/gameOne/slingshot.png");
        game.slingshotFrontImage = loader.loadImage("images/gameOne/slingshot-front.png");

        //Call game.start() once the assets have loaded
        if(loader.loaded){
            game.start()
        } else {
            loader.onload = game.start;
        }
    }

}
var loader = {
    loaded:true,
    loadedCount:0, // Assets that have been loaded so far
    totalCount:0, // Total number of assets that need to be loaded
    
    init:function(){
        // check for sound support
        var mp3Support,oggSupport;
        var audio = document.createElement('audio');
    	if (audio.canPlayType) {
       		// Currently canPlayType() returns: "", "maybe" or "probably" 
      		mp3Support = "" != audio.canPlayType('audio/mpeg');
      		oggSupport = "" != audio.canPlayType('audio/ogg; codecs="vorbis"');
    	} else {
    		//The audio tag is not supported
    		mp3Support = false;
    		oggSupport = false;	
    	}

        // Check for ogg, then mp3, and finally set soundFileExtn to undefined
        loader.soundFileExtn = oggSupport?".ogg":mp3Support?".mp3":undefined;        
    },
    
    loadImage:function(url){
        this.totalCount++;
        this.loaded = false;
        $('#loadingscreen').show();
        var image = new Image();
        image.src = url;
        image.onload = loader.itemLoaded;
        return image;
    },
    soundFileExtn:".ogg",
    loadSound:function(url){
        this.totalCount++;
        this.loaded = false;
        $('#loadingscreen').show();
        var audio = new Audio();
        audio.src = url+loader.soundFileExtn;
		audio.addEventListener("canplaythrough", loader.itemLoaded, false);
        return audio;   
    },
    itemLoaded:function(){
        loader.loadedCount++;
        $('#loadingmessage').html('Loaded '+loader.loadedCount+' of '+loader.totalCount);
        if (loader.loadedCount === loader.totalCount){
            // Loader has loaded completely..
            loader.loaded = true;
            // Hide the loading screen 
            $('#loadingscreen').hide();
            //and call the loader.onload method if it exists
            if(loader.onload){
                loader.onload();
                loader.onload = undefined;
            }
        }
    }
}
