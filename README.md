
# Chess Trainer

![](https://i.imgur.com/w7tvJCI.png)

## About project

Chess Trainer is a project of chess application which main purpose is to help you memorize certain openings and their variations.
It is currently in early-development stage and code will always be open for everyone.

Everyone is welcomed to contribute to project. Current stack is Laravel as backend and Vue as frontend.
## Current work

Need for better algorithm optimization, especially method with highest impact on performance should be greatly optimized. Main goal is to greatly optimize `Chessboard.makeMove` method, which currently lowers performance significantly mostly because of creating many nested deep copies of pieces collection. Most likely problem lies in computation of legal moves inside `Chessboard.makeMove` method.

## Contribute

### Design

If somebody is a volounteer graphic designer who could design application logo, chessboard & pieces graphics or color scheme, etc. - it would be much appreciated! Of course I would credit such wonderful person as one of the main creators of this app!

### Programming

Any technology stack ideas, structural pattern ideas or bug finds, anything related to programming will be seriously considered and implemented (well, unless the idea is just clearly bad or way over-complicated, let's keep it simple and nice)

### Chess data

Contribution by gathering chess data like puzzles, opening variations, etc. would be much appreciated!