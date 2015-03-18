# churlish: chess in a URL

churlish is a chess viewer for web browsers. It's still in early development.

Game state is saved in the URL, which allows you to share games without storing anything on a server.

**Note:** the PGN parsing is currently rather fragile. If you can't paste a
game, please try removing comments, sub-variations, and annotations. Sorry!

## Demo
[A famous game](http://dwyde.github.io/churlish/#HU3LbsIwELzzFaP0WNWt61eq3tz2gBC05MIBcUhsFxBRgwJB4e87jlbanZ3Z2VHqfbs5HK8JxU89tFh2/flwL3azrW/rcELxOZwSFnXf4hkf3fB3xfzSDXUf883XLZGgsz9euM+kQNJIBq8Cq1+FaKEEoobfa2iikZofqRiBdZ4TYwV80HRYOPKNwjo5lPwRFILFG/W9QWMgX0iOBCE3yTxP8IhVEx0kU7+fWKhiCcnkaiQ9Ncn0Kko+tpAm26KjbZJszizz1tDm8mH58A8=)

## Inspirations
- PGN viewers like [SCID](http://scid.sourceforge.net/)
- jbt's [markdown-editor](https://github.com/jbt/markdown-editor)

## Building blocks
- Chess logic: [chess.js](https://github.com/jhlywa/chess.js)
- Chess board: [chessboardjs](https://github.com/oakmac/chessboardjs)
- Compression for the URL: [pako](https://github.com/nodeca/pako)

