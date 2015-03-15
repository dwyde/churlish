var init = function() {
  var board,
      game = new Chess(),
      undoStack = [],
      statusEl = $('#game-status'),
      pgnEl = $('#game-pgn'),
      pgnHeaders = {
        White: '#player-white',
        Black: '#player-black',
        Event: '#player-event'
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

    promotion = getPromotion(source, target);
    if (promotion === null) {
      return 'snapback';
    }

    // see if the move is legal
    move = game.move({
      from: source,
      to: target,
      promotion: promotion
    });

    // illegal move
    if (move === null) return 'snapback';

    // Overwrite the rest of the game.
    if (undoStack.length) {
      branch = confirm('Playing a move will overwrite the rest of this ' +
                       'game.\n\nIs that okay?');
      if (!branch) {
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
    pgnText = game.pgn({max_width: 60});
    sanitized = escapeHtml(pgnText);
    pgnEl.html(sanitized.split('\n').join('<br>'));
  }

  var updateEverything = function() {
    updateStatus();
    updatePgn();
    updatePosition();
    undoStack.length = 0;
    populatePgnHeaders();
  }

  var getPromotion = function(from, to) {
    var move, piece;

    piece = game.get(from);
    if (piece.type === 'p') {
      if ((piece.color === 'w' && to.charAt(1) === '8') ||
          (piece.color === 'b' && to.charAt(1) === '1')) {
        move = game.move({
          from: from,
          to: to,
          promotion: 'q'
        });
        if (move !== null) {
          game.undo();
          return promotionPrompt();
        }
      }
    }

    // No promotion needed
    return 'q';
  };

  var promotionPrompt = function() {
    var result, piece, text;

    text = 'Enter the letter for your promotion piece: (Q)ueen, (R)ook, ' +
           '(B)ishop, or k(N)ight';
    result = prompt(text) || '';
    piece = result.toLowerCase();
    if (['q', 'r', 'n', 'b'].indexOf(piece) !== -1) {
      return piece;
    } else {
      return null;
    }
  }

  // Replay buttons
  var goBack = function() {
    var move = game.undo();
    if (move !== null) {
      undoStack.push(move);
    }
    return move;
  };

  var goForward = function() {
    var move;
    if (undoStack.length) {
      move = undoStack.pop();
      game.move(move);
    }
  };

  $('#play-rewind').click(function() {
    var move;
    do {
      move = goBack();
    } while (move !== null);
    updatePosition();
    updateStatus();
  });

  $('#play-fast-forward').click(function() {
    do {
      goForward();
    } while (undoStack.length);
    updatePosition();
    updateStatus();
  });

  $('#play-back').click(function() {
    goBack();
    updatePosition();
    updateStatus();
  });

  $('#play-forward').click(function() {
    goForward();
    updatePosition();
    updateStatus();
  });

  // PGN paste
  $('#paste-game').submit(function() {
    var pgnText, success;
    pgnText = $('#pgn-input').val();
    success = game.load_pgn(pgnText);
    if (success) {
      updateEverything();
      updateUrl();
    } else {
      console.log('Unable to paste PGN:\n\n' + pgnText);
    }
    return false;
  });

  // Utility
  var escapeHtml = function(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').
                     replace(/>/g, '&gt;').replace(/"/g, '&quot;').
                     replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
  };

  var unescapeHtml = function(s) {
    return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').
             replace(/&gt;/g, '>').replace(/&quot;/g, '"').
             replace(/&#x27;/g, '\'').replace(/&#x2F;/g, '/');
  };

  var populatePgnHeaders = function() {
    var key;
    for (key in pgnHeaders) {
      $(pgnHeaders[key]).val(game.header_get(key) || '');
    }
  };

  // Initialization
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

  // PGN in the URL
  if (window.location.hash) {
    var encoded, hash, pgnText;
    hash = window.location.hash.replace(/^#/, '');
    encoded = pako.inflateRaw(atob(hash), {to: 'string'});
    pgnText = decodeURIComponent(escape(encoded));
    success = game.load_pgn(pgnText);
    if (success) {
      updateEverything();
    } else {
      console.log('Unable to load PGN from URL:\n\n' + pgnText);
    }
  }

  var updateUrl = function() {
    var text = unescape(encodeURIComponent(game.pgn()));
    window.location.hash = btoa(pako.deflateRaw(text, {to: 'string'}));
  }

  var cleanPgnHeader = function(value) {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  };

  var savePgnHeaders = function() {
    var key, value;

    game.headers_clear();

    for (key in pgnHeaders) {
      value = $(pgnHeaders[key]).val();
      if (value) {
        game.header(key, cleanPgnHeader(value));
      }
    }
  };

  // Don't save empty games.
  var shouldSave = function() {
    return game.history().length !== 0;
  }

  // Fast-forward to the end, then rewind to the displayed position.
  $('#save-pgn').submit(function() {
    var black, white, i, undoLength;

    if (!shouldSave()) {
      return false;
    }

    // Fast-forward, to avoid saving an incomplete game.
    undoLength = undoStack.length;
    if (undoLength) {
      for (i = 0; i < undoLength; i++) {
        game.move(undoStack[undoLength - i - 1]);
      }
    }

    // Update the URL.
    savePgnHeaders();
    updatePgn();
    updateUrl();

    // Rewind to the original position on the board.
    if (undoLength) {
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

}; // end init()
$(document).ready(init);
