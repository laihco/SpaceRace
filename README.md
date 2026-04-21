# SpaceRace

A Phaser-based space survival game where the player manages fuel, food, and trash while traveling between planets.

## Overview
This project is structured around a main map scene and several minigames. The player starts on Earth and travels across the solar system while maintaining the spaceship through various tasks.

Fuel and food gradually decrease over time, and if either reaches zero, the game transitions to a game over scene.

## Features

### Main Map
- Animated map background  
- Resource management UI for fuel, trash, and food  
- Travel status display  
- Random transmission messages displayed over time  
- Sleep warning popup every 10 minutes  

### Planet Navigation (N)
- Destination selection with 8 planets  
- Navigation minigame required before travel begins  

### Refuel (R)
- Pipe rotation puzzle on a 6x6 grid  
- Connect the start and end tiles before time runs out  
- Success restores fuel  

### Trash Disposal (E)
- Pressing the red button opens the chamber and dumps garbage  
- Reduces the ship’s trash level  

### Farming (F)
- 3x3 farming grid  
- Crops with different growth times and values  
- Harvesting restores food  

### Crafting (C)
- Drag and drop system for processing materials  
- Combine resources to craft useful components  

### Game Over
- Displays the reason for failure  
- Press R to restart  

## AI Usage
- AI was used to explore how to represent distances between planets within a solar system.  
- AI was consulted on scaling travel time so that longer distances progress faster for better game pacing.  
- AI was used to understand how to calculate the spaceship’s position and remaining distance during travel in 2D space.  
