class Craft extends Phaser.Scene
{
    constructor()
    {
        super('craftScene');
    }

    preload()
    {
        this.load.path = './assets/'
        this.load.image('closeButton', 'close_button.png');
        this.load.image('arrow', 'arrow.png');
        this.load.image('copperNode', 'copper_node.png');
        this.load.image('copperOre', 'copper_ore.png');
        this.load.image('circuitComponents', 'circuit_components.png');
        this.load.image('motherboard', 'motherboard.png');
        this.load.image('meteorite', 'meteorite.png');
        this.load.image('ironOre', 'iron_ore.png');
    }

    init()
    {

    }

    create() 
    {
        // tint main scene as background
        this.add.rectangle(0, 0, game.config.width, game.config.height, 0x000000, 0.5).setOrigin(0);

        // minigame bckg
        this.add.rectangle(centerX + 5, centerY, 450, 350, 0xe6e6e6).setOrigin(0.5);

        // mask
        const mask = this.add.rectangle(centerX + 5, centerY, 450, 350, 0x000000)
        .setVisible(false).createGeometryMask();

        // crafting slots
        this.craftingGrid = this.physics.add.staticGroup();
        for (let i=0; i < 4; i++) {
            let craftingSlot = this.add.rectangle(0, 0, 60, 60, 0x919191);
            craftingSlot.setInteractive({dropZone: true});
            craftingSlot.setData('isCraftingSlot', true);

            this.craftingGrid.add(craftingSlot);
            console.log("craftingSlot created");
        }
        Phaser.Actions.GridAlign(this.craftingGrid.getChildren(), {
            width: 2,
            height: 2,
            cellWidth: 70,
            cellHeight: 70,
            x: centerX - 190,
            y: 120
        });

        // arrow
        this.add.image(centerX - 3, centerY - 65, 'arrow').setScale(0.3);
        this.add.image(centerX - 3, centerY + 55,'arrow').setScale(0.3);

        // result slot
        this.add.rectangle(centerX + 80, centerY - 65, 60, 60, 0x919191);
        this.add.rectangle(centerX + 80, centerY + 55, 60, 60, 0x919191);

        // debris slot
        this.add.rectangle(centerX + 175, centerY, 60, 350, 0x919191);

        // processing slot
        let procSlot = this.add.rectangle(centerX - 90, centerY + 55, 60, 60, 0x919191);
        procSlot.setInteractive({dropZone: true});
        procSlot.setData('isProcessor', true);
        console.log(procSlot.data);

        // close button
        const closeButton = this.add.image(30, 75, 'closeButton').setScale(0.1).setInteractive();
        closeButton.on('pointerdown', () => {
            console.log("close button clicked, minigame is closing...");
            this.scene.stop();
            this.scene.resume('mapScene');
        });

        // collision walls for debris container
        this.walls = this.physics.add.staticGroup();

        this.walls.add(this.add.rectangle(centerX + 127, centerY, 25, 350, 0xff0000).setAlpha(0));  // left
        this.walls.add(this.add.rectangle(centerX + 223, centerY, 25, 350, 0xff0000).setAlpha(0));  // right
        this.bottom = this.add.rectangle(centerX, centerY + 190, 500, 30, 0xff0000).setAlpha(0);    // bottom
        this.physics.add.existing(this.bottom, true);

        // randomly assign different debris type
        this.debrisGroup = this.physics.add.group({
            gravityY: 500
        });

        this.physics.add.collider(this.debrisGroup, this.walls);
        this.physics.add.collider(this.debrisGroup, this.bottom);
        this.physics.add.collider(this.debrisGroup, this.debrisGroup);

        /* for testing purpose
        this.physics.add.collider(this.debrisGroup, this.debrisGroup, (d1, d2) => {
            // d1.setVelocity(35);
            // d2.setVelocity(35);

            d1.setVelocity(0);
            d2.setVelocity(0);
            d1.body.setAllowGravity(false);
            d2.body.setAllowGravity(false);
            
        });
        */

        // spawn debris
        const items = ['copperNode', 'meteorite', 'circuitComponents'];
        
        for (let i=0; i < 5; i++)
        {
            let x = Phaser.Math.Between(centerX + 162, centerX + 184);
            let y = 120 - (i*80);
            const randomItem = Phaser.Math.RND.pick(items);
            let debris = this.debrisGroup.create(x, y, randomItem);
            debris.setInteractive({draggable: true});
            debris.body.setSize(17, 17);
            //debris.body.setCircle(10);
            debris.setScale(2);
            debris.setData('type', randomItem);
            debris.setMaxVelocity(0, 300);
            debris.setMask(mask);
            console.log(debris);
        }

        this.input.on('dragstart', (pointer, gameObject) => {
            // dragged object won't fall down
            gameObject.setDepth(1); 
            gameObject.body.setAllowGravity(false);
            gameObject.body.enable = true;
            gameObject.setVelocity(0);

            /* for testing purpose
            this.debrisGroup.getChildren().forEach(debris => {
                if (debris !== gameObject && debris.x > centerX + 100) { 
                    debris.body.setAllowGravity(true);
                }
            });
            */
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            // follow the mouse
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('drop', (pointer, gameObject, dropZone) => {
            // snap the object position to the drop zone
            gameObject.x = dropZone.x;
            gameObject.y = dropZone.y;
            
            gameObject.body.setAllowGravity(false);
            gameObject.setVelocity(0);
            gameObject.body.enable = false;

            if (dropZone.getData('isProcessor')) {
                this.processItem(gameObject);
                console.log("processing " + gameObject.type);
            }
        });
        
        this.input.on('dragend', (pointer, gameObject, dropped) => {
            gameObject.setDepth(0);
            // fall if not drop in drop zone
            if (!dropped) {
                gameObject.body.setAllowGravity(true);
            }
        });
        
    }

    update()
    {

    }

    processItem(debris)
    {
        let debrisType = debris.getData('type');
        let resultType = '';

        if (debrisType === 'copperNode') resultType = 'copperOre';
        else if (debrisType === 'meteorite') resultType = 'ironOre';

        console.log(resultType);

        this.time.delayedCall(800, () => {
            debris.destroy();

            let result = this.debrisGroup.create(centerX + 80, centerY + 55, resultType);
            result.setScale(2);
            result.setInteractive({draggable: true});
            result.setData('type', resultType);
            result.body.setAllowGravity(false);
            result.body.enable = false;

        });
    }
}