# Office Wars ⚔️🛡️

A turn-based strategy game built with Wasp 🐝

Wasp is a domain specific language for building full-stack web apps with ease. This
project was created for the [Wasp Hackathon #2](https://hackathon.wasp-lang.dev).

## Contributors

This project is brought to you by:

* Luís Silva 🥷 ([Github](https://github.com/LudeeD))
* Roland Kajatin 🧙🏼‍♂️ ([Github](https://github.com/Kajatin), [BlueSky](https://bsky.app/profile/kajatin.bsky.social))

If you want to contribute yourself, ensure you have a functioning `node` and `npm` installation.
Then you'll need to install `wasp` on your system. To learn more, head on over to the
[getting started guide](https://wasp-lang.dev/docs/quick-start).

## Useful commands

* `wasp start` - starts the development server
* `wasp db migrate-dev` - runs the database migrations in development mode
* `wasp db studio` - opens the database studio

# Ideas

1. auth and login (this already works) -> so everyone has their own user
1. each user has some configuration options, like the color of their tank and maybe some specs as we discussed - they could get a faster but weaker tank or slower but stronger stuff like this
1. any user can create a new game, which generates a code for that game
1. other players can join that game’s lobby using the code
1. once all players are in the lobby, the game starts
1. the plays in turns and let’s plan out exactly what that means together
1. players can be involved in multiple games at the same time and they can just switch between them (like we could do a 1v1 but also free for all in the office, or team vs team)
1. you cannot change the specs of your tank while in a game though, unless it’s a powerup or something like that
1. you can forfeit a game if you want but then you’re out completely
1. once a game is over, the winner is crowned and the user gets a victory point
1. we can have a leaderboard as well
