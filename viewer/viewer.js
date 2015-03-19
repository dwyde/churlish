/**
 * A chess viewer for web browsers.
 *
 * This file is based on http://chessboardjs.com/examples#5000.
 */

var ChessViewer = (function() {
  var board,
      game = new Chess(),
      undoStack = [],
      statusEl = $('#game-status'),
      pgnEl = $('#game-pgn'),
      pgnHeaders = {
        White: $('#player-white'),
        Black: $('#player-black'),
        Event: $('#player-event')
      };

  // do not pick up pieces if the game is over
  // only pick up pieces for the side to move
  var onDragStart = function(source, piece, position, orientation) {
    if (game.game_over() === true ||
        (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false;
    }
  };

  var onDrop = function(source, target) {
    var branch, move, promotion;

    // see if the move is legal
    promotion = getPromotion(source, target);
    move = game.move({
      from: source,
      to: target,
      promotion: promotion
    });

    // illegal move
    if (move === null) {
      return 'snapback';
    }

    // Overwrite the rest of the game.
    if (undoStack.length !== 0) {
      branch = confirm('Playing a move will overwrite the rest of this ' +
                       'game.\n\nIs that okay?');
      if (branch !== true) {
        game.undo();
        return 'snapback';
      }
    }

    // Everything is okay.
    updateStatus();
    updatePgn();
    undoStack.length = 0;
  };

  // update the board position after the piece snap 
  // for castling, en passant, pawn promotion
  var updatePosition = function() {
    board.position(game.fen(), false);
  };

  var updateStatus = function() {
    var status = '';

    var moveColor = 'White';
    if (game.turn() === 'b') {
      moveColor = 'Black';
    }

    // checkmate?
    if (game.in_checkmate() === true) {
      status = 'Game over, ' + moveColor + ' is in checkmate.';
    }

    // draw?
    else if (game.in_draw() === true) {
      status = 'Game over, drawn position';
    }

    // game still on
    else {
      status = moveColor + ' to move';

      // check?
      if (game.in_check() === true) {
        status += ', ' + moveColor + ' is in check';
      }
    }

    statusEl.text(status);
  };

  var updatePgn = function() {
    var pgnText, sanitized;
    pgnText = game.pgn();
    sanitized = escapeHtml(pgnText);
    pgnEl.html(sanitized.split('\n').join('<br>'));
  }

  var updateBoard = function() {
    updatePosition();
    updateStatus();
  };

  var updateEverything = function() {
    updatePgn();
    updateBoard();
    undoStack.length = 0;
    populatePgnHeaders();
  }

  // Replay buttons
  var Replay = (function() {
    var goBack = function() {
      var move = game.undo();
      if (move !== null) {
        undoStack.push(move);
      }
      return move;
    };

    var goForward = function() {
      var move = null;
      if (undoStack.length !== 0) {
        move = undoStack.pop();
        game.move(move);
      }
      return move;
    };

    return {
      rewind: function() {
        var move;
        do {
          move = goBack();
        } while (move !== null);
      },
      back: function() {
        var move = goBack();
        return move;
      },
      forward: function() {
        var move = goForward();
        return move;
      },
      fastForward: function() {
        do {
          goForward();
        } while (undoStack.length !== 0);
      }
    };
  }());

  var AutoPlay = (function() {
    var timeoutId = null;

    var startAutoPlay = function() {
      timeoutId = setInterval(function() {
        var move = Replay.forward();
        if (move === null) {
          stopAutoPlay();
        } else {
          updateBoard();
        }
      }, 1000);
    }

    var stopAutoPlay = function() {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    return {
      stop: stopAutoPlay,
      toggle: function() {
        if (timeoutId === null) {
          startAutoPlay();
        } else {
          stopAutoPlay();
        }
      }
    }
  }());

  var getPromotion = (function() {
    var promotionPieces = ['q', 'r', 'n', 'b'];

    var promotionPrompt = function() {
      var result, piece, text;

      text = 'Enter the letter for your promotion piece: (Q)ueen, (R)ook, ' +
             '(B)ishop, or k(N)ight';
      result = prompt(text) || '';
      piece = result.toLowerCase();
      return (promotionPieces.indexOf(piece) !== -1) ? piece : null;
    };

    return function(from, to) {
      var move,
          piece = game.get(from);

      if (piece.type === 'p') {
        if ((piece.color === 'w' && to.charAt(1) === '8') ||
            (piece.color === 'b' && to.charAt(1) === '1')) {
          // Check if promotion is legal (with a Queen).
          move = game.move({from: from, to: to, promotion: 'q'});
          if (move !== null) {
            // If promotion is legal, do a takeback and then prompt.
            game.undo();
            return promotionPrompt();
          }
        }
      }

      // No promotion is needed, so default to a Queen.
      return 'q';
    }
  }());

  // Utility
  var escapeHtml = function(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').
                     replace(/>/g, '&gt;').replace(/"/g, '&quot;').
                     replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
  };

  // PGN
  var populatePgnHeaders = function() {
    var key;
    for (key in pgnHeaders) {
      if (pgnHeaders.hasOwnProperty(key)) {
        pgnHeaders[key].val(game.header_get(key) || '');
      }
    }
  };

  var updateUrl = function() {
    var gameData = undoStack.length.toString() + ';' + game.pgn();
    window.location.hash = btoa(pako.deflateRaw(gameData, {to: 'string'}));
  }

  var cleanPgnHeader = function(value) {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  };

  var savePgnHeaders = function() {
    var key, value;

    if ($('#pgn-clear-headers').is(':checked') === true) {
      game.headers_clear();
    }

    for (key in pgnHeaders) {
      if (pgnHeaders.hasOwnProperty(key)) {
        value = pgnHeaders[key].val();
        if (value !== '') {
          game.header(key, cleanPgnHeader(value));
        }
      }
    }
  };

  // Don't save empty games.
  var shouldSave = function() {
    return (game.history().length !== 0 ||
            undoStack.length !== 0);
  }

  // JavaScript event handlers

  // Move playback
  var playBackClick = function(replayFunc) {
    return function() {
      AutoPlay.stop();
      replayFunc();
      updateBoard();
    };
  };

  $('#play-rewind').click(playBackClick(Replay.rewind));
  $('#play-back').click(playBackClick(Replay.back));
  $('#play-forward').click(playBackClick(Replay.forward));
  $('#play-fast-forward').click(playBackClick(Replay.fastForward));

  $('#play-auto').click(AutoPlay.toggle);

  // PGN paste
  $('#paste-game').submit(function() {
    var pgnText, success;
    pgnText = $('#pgn-input').val();
    success = game.load_pgn(pgnText);
    if (success === true) {
      updateEverything();
      updateUrl();
    } else {
      console.log('Unable to paste PGN:\n\n' + pgnText);
    }
    return false;
  });

  // Fast-forward to the end, then rewind to the displayed position.
  $('#save-pgn').submit(function() {
    var black, white, i, undoLength;

    if (shouldSave() !== true) {
      return false;
    }

    // Fast-forward, to avoid saving an incomplete game.
    undoLength = undoStack.length;
    if (undoLength !== 0) {
      for (i = 0; i < undoLength; i++) {
        game.move(undoStack[undoLength - i - 1]);
      }
    }

    // Update the URL.
    savePgnHeaders();
    updatePgn();
    updateUrl();

    // Rewind to the original position on the board.
    if (undoLength !== 0) {
      for (; i > 0; i--) {
        game.undo();
      }
    }

    return false;
  });

  // PGN action select box
  $('#action-choices button').click(function() {
    var value = $(this).attr('id');
    if (value !== 'default') {
      $('#action-display div').each(function() {
        $(this).hide();
      });
    $('#action-' + value).toggle();
    }
  });

  // Create the board.
  var initBoard = function() {
    var cfg = {
      draggable: true,
      position: 'start',
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: updatePosition,
      pieceTheme: 'chessboardjs/img/pieces/{piece}.png'
    };
    board = new ChessBoard('board', cfg);
    updateStatus();
  };

  // PGN in the URL
  var parseUrl = function(gameText) {
    var match, matchLen, plyNumber, pgnText;

    match = /^[0-9]{1,5};/.exec(gameText);
    if (match !== null) {
      matchLen = match[0].length;
      plyNumber = parseInt(gameText.slice(0, matchLen - 1));
      pgnText = gameText.slice(matchLen);
    } else {
      plyNumber = 0;
      pgnText = gameText;
    }
    return {ply: plyNumber, pgn: pgnText};
  }

  var initUrl = function() {
    var hash, gameText, gameData, success;

    if (window.location.hash) {
      hash = window.location.hash.replace(/^#/, '');
      gameText = pako.inflateRaw(atob(hash), {to: 'string'});
      gameData = parseUrl(gameText);

      success = game.load_pgn(gameData.pgn);
      if (success === true) {
        updateEverything();
      } else {
        console.log('Unable to load PGN from URL:\n\n' + pgnText);
      }

      if (gameData.ply > 0 && gameData.ply <= game.history().length) {
        for (var i = 0; i < gameData.ply; i++) {
          Replay.back();
        }
        updateBoard();
      }
    }
  };

  return {
    // Initialize
    init: function() {
      initBoard();
      initUrl();
    }
  }
}()); // end ChessViewer

$(document).ready(ChessViewer.init);
