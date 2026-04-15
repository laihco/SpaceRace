class Trash extends Phaser.Scene
{
    constructor()
    {
        super('trashScene');
    }

    preload()
    {
        this.load.path = './assets/'
        this.load.image('closeButton', 'close_button.png');
        this.load.image('garbage1', 'garbage_bag1.png');
        this.load.image('garbage2', 'garbage_bag2.png');
        this.load.image('redButton', 'red_button.png');
    }

    init()
    {
        console.log("you're in tash task minigame");
    }

    create()
    {
        // give the main scene below a dark layer to make the mini game scene pop out
        this.add.rectangle(0, 0, game.config.width, game.config.height, 0x000000, 0.5).setOrigin(0);

        // mini game scene background
        this.add.rectangle(game.config.width/2, game.config.height/2, 350, 350, 0x405080).setOrigin(0.5);
        this.add.rectangle(game.config.width/2 - 50, game.config.height/2, 250, 350, 0xa6a6a6).setOrigin(0.5);

        // mask
        const mask = this.add.rectangle(game.config.width/2 - 50, game.config.height/2, 250, 350, 0x000000)
        .setVisible(false).createGeometryMask();

        // escape "x" close mini game
        const closeButton = this.add.image(75, 75, 'closeButton').setScale(0.1).setInteractive();
        closeButton.on('pointerdown', () => {
            console.log("close button clicked, minigame is closing...");
            this.scene.stop();
            this.scene.resume('mapScene');
        });

        // red button
        const redButton = this.add.image(centerX+125, centerY-80, 'redButton').setScale(0.2).setInteractive();
        redButton.on('pointerdown', () => {
            console.log("red button pressed, dumping garbage...");
            this.emptyGarbage();
        })

        // collision walls for garbage container
        this.walls = this.physics.add.staticGroup();

        this.walls.add(this.add.rectangle(centerX - 190, centerY, 25, 350, 0xff0000).setAlpha(0));  // left
        this.walls.add(this.add.rectangle(centerX + 90, centerY, 25, 350, 0xff0000).setAlpha(0));  // right

        this.bottom = this.add.rectangle(centerX - 50, centerY + 195, 270, 40, 0xff0000).setAlpha(0);    // bottom
        this.physics.add.existing(this.bottom, true);

        this.garbage1 = this.physics.add.sprite(0, 0, 'garbage1');
        this.garbage2 = this.physics.add.sprite(0, 0, 'garbage2');

        // garbage-worldbound event listner
        this.physics.world.on('worldbounds', (body) => {
            if (body.blocked.down) {
                body.gameObject.destroy();
                console.log("garbage destroyed");
            }
        })

        // randomly assign the position of garbage in the garbage container
        this.garbageGroup = this.physics.add.group({
            collideWorldBounds: true,
            gravityY: 500,  
            bounceY: 0.1
        });

        for (let i=0; i < 10; i++)
        {
            // let texture = Phaser.Math.RND.pick(['garbage1', 'garbage2']);
            let x = Phaser.Math.Between(centerX-160, centerX+50);
            let y = Phaser.Math.Between(centerY-150, centerY+100);

            let garbage = this.garbageGroup.create(x, y, 'garbage2');
            garbage.setScale(4);
            // garbage.setAngle(Phaser.Math.Between(0, 360));
            garbage.setSize(10, 5);
            garbage.setOffset(3, 8);
            garbage.setMask(mask);

            garbage.body.onWorldBounds = true;  // trigger 'worldbounds' event listner that destroy garbage
        }

        this.physics.add.collider(this.garbageGroup, this.walls);
        this.physics.add.collider(this.garbageGroup, this.bottom);
        this.physics.add.collider(this.garbageGroup, this.garbageGroup);

    }

    update()
    {

    }

    emptyGarbage() 
    {
        this.bottom.body.enable = false;
    }
}