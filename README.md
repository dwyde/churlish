# churlish: chess in a URL

churlish is a chess viewer for web browsers. It's still in early development.

Game state is saved in the URL, which allows you to share games without storing anything on a server.

**Note:** the PGN parsing is currently rather fragile. If you can't paste a
game, please try removing comments, sub-variations, and annotations. Sorry!

## Demo
[A famous game](https://dwyde.github.io/churlish/#TVA9T8MwFNz7K07piGpqEjtmqhTKgBCFpgNDxeDE7ocaNSiJUfj3nAMDsvV87+7dO8n7xy9/HZC82e7cJx+z/e48+H/t2sZWGmXEasUbubINV4fkF/s+NPTLxTK276c/e2jw0nafp+/IFo2tL0jW4eLxbLsGt3jgjgFPfRts5zgzkwI+g1e4E9gcUjiNVMBlKI4ZMqKRWjFSUQLb+E6MFijqjA6NnHyVYutzGO6oU9Qa99SPCpWCXJIcCepYJPMKghtsKpdDMvV1wYPSGUgmlyPpqUiml05ysYZU0eZy2iZJx0wTu4q2PA6aOfgZPw==)

## Inspirations
- PGN viewers like [SCID](http://scid.sourceforge.net/)
- jbt's [markdown-editor](https://github.com/jbt/markdown-editor)

## Building blocks
- Chess logic: [chess.js](https://github.com/jhlywa/chess.js)
- Chess board: [chessboardjs](https://github.com/oakmac/chessboardjs)
- Compression for the URL: [pako](https://github.com/nodeca/pako)

