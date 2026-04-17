/*  Space Race

*/

'use strict'

let config = {
    type: Phaser.AUTO,
    width: 500,
    height: 500,
    render: {
        pixelArt: true
    },
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            debugShowStaticBody: false
        }
    },
<<<<<<< HEAD
    scene: [Load, Map, Trash, NavigationTask]
=======
    scene: [Load, Map, Trash, PressureScene]
>>>>>>> 54c46fd (updated fuel game to match, connected both minigames to main hud display)
}

let game = new Phaser.Game(config)

let { width, height } = game.config

const centerX = game.config.width / 2
const centerY = game.config.height / 2
let cursors = null
