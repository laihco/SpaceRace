/*  Space Race

*/

'use strict'

let config = {
    type: Phaser.AUTO,
    width: 772,
    height: 729,
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            debugShowStaticBody: false
        }
    },
    scene: [Load, Map]
}

let game = new Phaser.Game(config)

let { width, height } = game.config

const centerX = game.config.width / 2
const centerY = game.config.height / 2
let cursors = null