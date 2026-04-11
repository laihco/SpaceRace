/*  Space Race

*/

'use strict'

let config = {
    type: Phaser.AUTO,
    width: 500,
    height: 500,
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            debugShowStaticBody: false
        }
    },
    scene: [Load, PressureScene, Map]
}

let game = new Phaser.Game(config)

let { width, height } = game.config

const centerX = game.config.width / 2
const centerY = game.config.height / 2
let cursors = null