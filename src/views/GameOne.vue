<template>
  <div id="gamecontainer">
    <canvas id="gamecanvas" width="640" height="480" class="gamelayer"></canvas>
    <div id="scorescreen" class="gamelayer">
      <img id="togglemusic" src="images/gameOne/icons/sound.png">
      <img src="images/gameOne/icons/prev.png">
      <span id="score">Score: 0</span>
    </div>
    
    <div id="gamestartscreen" class="gamelayer">
      <img src="images/gameOne/icons/play.png" alt="Play Game" onclick = "game.showLevelScreen();"><br>
      <img src="images/gameOne/icons/settings.png" alt="Settings">
    </div>
    
    <div id="levelselectscreen" class="gamelayer">
    </div>
    
    <div id="loadingscreen" class="gamelayer">
      <div id="loadingmessage"></div>
    </div>
    
    <div id="endingscreen" class="gamelayer">
      <div>
        <p id="endingmessage">The Level Is Over Message</p>
        <p id="playcurrentlevel"><img src="images/gameOne/icons/prev.png"> Replay Current Level</p>				
        <p id="playnextlevel"><img src="images/gameOne/icons/next.png"> Play Next Level </p>				
        <p id="showLevelScreen"><img src="images/gameOne/icons/return.png"> Return to Level Screen</p>
      </div>
    </div>	
  </div>
</template>

<script>

export default {
  name: 'home',
  created () {
  },
  mounted() {
    
  },
  data() {
      return {

      }
  },
  methods:{
      
  },
  components:{}
}
</script>
<style scoped lang="less">
  #gamecontainer {
    width:640px;
    height:480px;
    background: url(../../public/images/gameOne/splashscreen.png);
    border: 1px solid black;
  }

  .gamelayer {
    width:640px;
    height:480px;
    position:absolute;
    display:none;
  }

  /* Game Starting Menu Screen */
  #gamestartscreen {
    padding-top:250px;
    text-align:center;
  }

  #gamestartscreen img {
    margin:10px;
    cursor:pointer;
  }

  /* Level Selection Screen */
  #levelselectscreen {
    padding-top:150px;
    padding-left:50px;	
  }

  #levelselectscreen input {
    margin:20px;
    cursor:pointer;
    background:url(../../public/images/gameOne/icons/level.png) no-repeat;
    color:yellow;
    font-size: 20px;
    width:64px;
    height:64px;
    border:0;
  }

  /* Loading Screen */
  #loadingscreen {
    background:rgba(100,100,100,0.3);	
  }

  #loadingmessage {
      margin-top:400px;
    text-align:center;
    height:48px;
    color:white;
    background:url(../../public/images/gameOne/loader.gif) no-repeat center;
    font:12px Arial;
  }

  /* Score Screen */
  #scorescreen  {
      height:60px;
      font: 32px Comic Sans MS;
      text-shadow: 0 0 2px #000;
    color:white;
  }

  #scorescreen img{
      opacity:0.6;
      top:10px;
      position:relative;
      padding-left:10px;
      cursor:pointer;
  }

  #scorescreen #score {
    position:absolute;
    top:5px;
    right:20px;
  }
</style>
