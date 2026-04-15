class Load extends Phaser.Scene {
    constructor() {
        super('loadScene')
    }

    preload() {
        // load the character
        this.load.path = './assets/'
        this.load.spritesheet('ace', 'ace-sheet.png', {
            frameWidth: 150,
            frameHeight: 150,
        })

        //load the map
        this.load.spritesheet('map', 'bg_anim.png', { frameWidth: 155, frameHeight: 146 })

        //load the pipes
        this.load.spritesheet('pipe', 'pipes.png', {
            frameWidth: 32,
            frameHeight: 32
        })
    }

    create() {
        // ace animations (walking)
        this.anims.create({
            key: 'walk-down',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('ace', { start: 0, end: 3 }),
        })
        this.anims.create({
            key: 'walk-right',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('ace', { start: 4, end: 7 }),
        })
        this.anims.create({
            key: 'walk-up',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('ace', { start: 8, end: 11 }),
        })
        this.anims.create({
            key: 'walk-left',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('ace', { start: 12, end: 15 }),
        })

        // ace animations (swinging)
        this.anims.create({
            key: 'swing-down',
            frameRate: 8,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('ace', { start: 16, end: 19 }),
        })

        // proceed once loading completes
        this.scene.start('mapScene')
    }
}