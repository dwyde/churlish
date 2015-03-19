# churlish: chess in a URL

churlish is a chess viewer for web browsers. It's still in early development.

Game state is saved in the URL, which allows you to share games without storing anything on a server.

**Note:** the PGN parsing is currently rather fragile. If you can't paste a
game, please try removing comments, sub-variations, and annotations. Sorry!

## Demo
[A famous game](https://dwyde.github.io/churlish/#TVDLTsMwELz3K0bhiGpqHD8qDpVCOSBEoeHAoeohiU1bNWpQHij8PePAAdlaz87s7EhW6m738BUuPZLXoj11yX62ezv14V+7LmIrnXZiteKNXN4MF4/kF4duqOmX80Vs349/9qHGc9N+Hr8jm9VFdUayHs4BT0Vb4wb33NHjsWuGovWcmUmBkCJo3ApsPhS8gRLwKbJDipRopJaNVLTANr4TYwSyKqXDwJIvFbbBwnFHpVAZLKkfNEoNuSA5ElSxSOZlBNfYlN5CMvVlzoPcO0gm5yPpqUim515ysYHU0eYtbZNkYqaLXUmbjYPuCvyMHw==)

## Inspirations
- PGN viewers like [SCID](http://scid.sourceforge.net/)
- jbt's [markdown-editor](https://github.com/jbt/markdown-editor)

## Building blocks
- Chess logic: [chess.js](https://github.com/jhlywa/chess.js)
- Chess board: [chessboardjs](https://github.com/oakmac/chessboardjs)
- Compression for the URL: [pako](https://github.com/nodeca/pako)

