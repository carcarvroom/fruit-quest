import Phaser from 'phaser';
import React from 'react'
import { IonPhaser } from '@ion-phaser/react'

class Level1 extends Phaser.Scene {
    constructor(){
        super('level1')
    }

    preload() {
        this.load.image('tiles', 'terrain.png')
        this.load.tilemapTiledJSON('map', 'level-1.json')
        this.load.image('green background', 'green-background.png')
        this.load.atlas('guy', 'virtual-guy.png', 'virtual-guy.json')
        this.load.atlas('pineapple objects', 'pineapple-objects.png', 'pineapple-objects.json')
        this.load.image('pineapple', 'pineapple.png')
        this.load.audio('times up', 'times-up.m4a')
        this.load.audio('fruit collected', 'fruit-collected.m4a')

        this.cursors = this.input.keyboard.createCursorKeys()
        this.scale.setGameSize(992, 608)
    }

    create() {
        // Map
        const map = this.make.tilemap({ key: 'map'})

        const background = map.addTilesetImage('green background', 'green background', 16, 16)
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
          key: 'pineapple objects',
          frames: this.anims.generateFrameNames('pineapple objects', { start: 1, end: 17, prefix: 'pineapple-', suffix: '.png'}),
          repeat: -1,
          frameRate: 8
        })

        const pineappleLayer = map.getObjectLayer('fruit')['objects']
        const pineapple = this.physics.add.staticGroup()
        pineappleLayer.forEach(object => {
            let c = pineapple.create(object.x, object.y, 'pineapple objects')
            c.setScale(object.width/16, object.height/16); 
            c.setOrigin(0); 
            c.body.width = object.width; 
            c.body.height = object.height;
            c.play('pineapple objects', true) 
        })
        
        // Object and Character Collision
        this.physics.add.overlap(this.guy, pineapple, this.collectFruit, null, this)

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
                  level_id: 4
              })
          })
          .then(res => res.json())
          .then(json => {

              if(json.requirePatch) {
                  fetch('https://fruit-quest-api.herokuapp.com/scores')
                  .then(res => res.json())
                  .then(json => {
                      let scoreId = json.find(score => score.user_id == userId && score.level_id == 4).id
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
                      .catch(err => console.log('Level1.js Score Patch Error:', err))
                  })
                  .catch( err => console.log('Level1.js Score Fetch Error:', err))
              } 
          })
          .catch(err => console.log('Level1.js Score Post Error:', err))
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

export default class LevelOne extends React.Component {
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
      scene: [Level1]
    }
  }

  render() {
    const { game } = this.state
    return (
      <IonPhaser game={game} />
    )
  }
}
