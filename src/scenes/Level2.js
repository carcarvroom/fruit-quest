import Phaser from 'phaser';
import React from 'react'
import { IonPhaser } from '@ion-phaser/react'

class Level2 extends Phaser.Scene {
    constructor(){
        super('level1')
    }

    preload() {
        this.load.image('tiles', 'terrain.png')
        this.load.tilemapTiledJSON('map', 'level-2.json')
        this.load.image('purple background', 'purple-background.png')
        this.load.atlas('guy', 'virtual-guy.png', 'virtual-guy.json')
        this.load.atlas('cherry objects', 'cherry-objects.png', 'cherry-objects.json')
        this.load.image('cherry', 'cherry.png')
        this.load.audio('times up', 'times-up.m4a')
        this.load.audio('fruit collected', 'fruit-collected.m4a')

        this.cursors = this.input.keyboard.createCursorKeys()
        this.scale.setGameSize(992, 608)
    }

    create() {
        // Map
        const map = this.make.tilemap({ key: 'map'})

        const background = map.addTilesetImage('purple-background', 'purple background', 16, 16)
        map.createStaticLayer('background', background)
        
        const terrain = map.addTilesetImage('terrain', 'tiles', 16, 16)
        const tileset = map.createStaticLayer('terrain', terrain)
        tileset.setCollisionByProperty({collides : true})

        //Character
        this.guy = this.physics.add.sprite(30, 350, 'guy', 'run-1.png')
        this.anims.create({
            key: 'guy-idle',
            frames: this.anims.generateFrameNames('guy', { start: 1, end: 11, prefix: 'idle-', suffix: '.png' }),
            repeat: -1,
            frameRate: 15
        })
        this.anims.create({
            key: 'guy-walking-right',
            frames: this.anims.generateFrameNames('guy', { start: 1, end: 12, prefix: 'run-', suffix: '.png' }),
            repeat: -1,
            frameRate: 15
        })
        this.anims.create({
            key: 'guy-walking-left',
            frames: this.anims.generateFrameNames('guy', { start: 1, end: 12, prefix: 'run-', suffix: '-right.png' }),
            repeat: -1,
            frameRate: 15
        })
        this.anims.create({
            key: 'guy-jumping',
            frames: [{ key: 'guy', frame: 'jump.png' }]
        })

        this.physics.add.existing(this.guy)   
        this.guy.body.setCollideWorldBounds(true) 
        this.physics.add.collider(this.guy, tileset)        
        
        this.camera = this.cameras.main.startFollow(this.guy, true)
        this.camera.setBounds(0, 0, 1984, 608)

        // Objects

        this.anims.create({
          key: 'cherry objects',
          frames: this.anims.generateFrameNames('cherry objects', { start: 1, end: 16, prefix: 'cherry-', suffix: '.png'}),
          repeat: -1,
          frameRate: 10
        })

        const cherryLayer = map.getObjectLayer('fruit')['objects']
        const cherry = this.physics.add.staticGroup()
        cherryLayer.forEach(object => {
            let c = cherry.create(object.x, object.y, 'cherry objects')
            c.setScale(object.width/16, object.height/16); 
            c.setOrigin(0); 
            c.body.width = object.width; 
            c.body.height = object.height;
            c.play('cherry objects', true) 
        })
        
        // Object and Character Collision
        this.physics.add.overlap(this.guy, cherry, this.collectFruit, null, this)

        this.fruitScore = 0
        this.text = this.add.text(845, 20, `Fruit: ${this.fruitScore}`, {
            fontSize: '20px',
            fill: '#ffffff'
          });
        this.text.setScrollFactor(0);

        this.timeInSeconds = 30;
        this.timerText = this.add.text(30, 20, `Time left: ${this.timeInSeconds}`, {
            fontSize: '20px', 
            fill: '#ffffff'
        });
        this.timerText.setScrollFactor(0);
        this.timeEvent = this.time.addEvent({ delay: 1000, callback: this.countdown, callbackScope: this, loop: true})
    }

    countdown() {
      this.timeInSeconds -= 1
      this.timerText.setText(`Time left: ${this.timeInSeconds}`)
      if(this.timeInSeconds===0) {
        this.sound.play('times up');
          this.timeEvent.paused = true
          let userId = localStorage.getItem('user_id')
          fetch('https://fruit-quest-api.herokuapp.com/scores', {
              method: 'POST',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  score: this.fruitScore,
                  user_id: userId,
                  level_id: 5
              })
          })
          .then(res => res.json())
          .then(json => {

              if(json.requirePatch) {
                  fetch('https://fruit-quest-api.herokuapp.com/scores')
                  .then(res => res.json())
                  .then(json => {
                      let scoreId = json.find(score => score.user_id == userId && score.level_id == 5).id
                      fetch(`https://fruit-quest-api.herokuapp.com/scores/${scoreId}`, {
                          method: 'PATCH',
                          headers: {
                              'Accept': 'application/json',
                              'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                              score: this.fruitScore
                          })
                      })
                      .catch(err => console.log('Level2.js Score Patch Error:', err))
                  })
                  .catch( err => console.log('Level2.js Score Fetch Error:', err))
              } 
          })
          .catch(err => console.log('Level2.js Score Post Error:', err))
      }
    }
      
    collectFruit (player, cherry) {
      if(this.timeInSeconds>0) {
        cherry.disableBody(true, true)
        this.fruitScore ++
        this.text.setText(`Fruits: ${this.fruitScore}`)
        this.sound.play('fruit collected');
      }
      return false
    }

    update() {
        if (this.cursors.left.isDown) {
            this.guy.setVelocityX(-160)
            this.guy.anims.play('guy-walking-left', true)
        } else if (this.cursors.right.isDown) {
            this.guy.setVelocityX(160)
            this.guy.anims.play('guy-walking-right', true)
        } else {
            this.guy.setVelocityX(0)
            this.guy.anims.play('guy-idle', true)
        }
        if (this.cursors.space.isDown || this.cursors.up.isDown) {
            this.guy.setVelocityY(-330)
        }
      } 
}

export default class LevelTwo extends React.Component {
  state = {
    game: {
      parent: 'game-container',
      width: 1984,
      height: 608,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 1000 }
        }
      },
      type: Phaser.AUTO,
      scene: [Level2]
    }
  }

  render() {
    const { game } = this.state
    return (
      <IonPhaser game={game} />
    )
  }
}
