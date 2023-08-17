import chess


class ChessAI:
    def __init__(self, board: chess.Board, max_depth: int = 3):
        self.board = board
        self.max_depth = max_depth
        
        self.piece_values = {
            'P': 10, 'N': 30, 'B': 30, 'R': 50, 'Q': 90, 'K': 900
        }

        self.pawn_table = [
            0,  0,  0,  0,  0,  0,  0,  0,
            50, 50, 50, 50, 50, 50, 50, 50,
            10, 10, 20, 30, 30, 20, 10, 10,
            5,  5, 10, 25, 25, 10,  5,  5,
            0,  0,  0, 20, 20,  0,  0,  0,
            5, -5,-10,  0,  0,-10, -5,  5,
            5, 10, 10,-20,-20, 10, 10,  5,
            0,  0,  0,  0,  0,  0,  0,  0
        ]

        self.knight_table = [
            -50,-40,-30,-30,-30,-30,-40,-50,
            -40,-20,  0,  0,  0,  0,-20,-40,
            -30,  0, 10, 15, 15, 10,  0,-30,
            -30,  5, 15, 20, 20, 15,  5,-30,
            -30,  0, 15, 20, 20, 15,  0,-30,
            -30,  5, 10, 15, 15, 10,  5,-30,
            -40,-20,  0,  5,  5,  0,-20,-40,
            -50,-40,-30,-30,-30,-30,-40,-50
        ]

        self.bishop_table = [
            -20,-10,-10,-10,-10,-10,-10,-20,
            -10,  0,  0,  0,  0,  0,  0,-10,
            -10,  0,  5, 10, 10,  5,  0,-10,
            -10,  5,  5, 10, 10,  5,  5,-10,
            -10,  0, 10, 10, 10, 10,  0,-10,
            -10, 10, 10, 10, 10, 10, 10,-10,
            -10,  5,  0,  0,  0,  0,  5,-10,
            -20,-10,-10,-10,-10,-10,-10,-20
        ]

        self.rook_table = [
            0,  0,  0,  0,  0,  0,  0,  0,
            5, 10, 10, 10, 10, 10, 10,  5,
            -5,  0,  0,  0,  0,  0,  0, -5,
            -5,  0,  0,  0,  0,  0,  0, -5,
            -5,  0,  0,  0,  0,  0,  0, -5,
            -5,  0,  0,  0,  0,  0,  0, -5,
            -5,  0,  0,  0,  0,  0,  0, -5,
            0,  0,  0,  5,  5,  0,  0,  0
        ]

        self.queen_table = [
            -20,-10,-10, -5, -5,-10,-10,-20,
            -10,  0,  0,  0,  0,  0,  0,-10,
            -10,  0,  5,  5,  5,  5,  0,-10,
            -5,  0,  5,  5,  5,  5,  0, -5,
            0,  0,  5,  5,  5,  5,  0, -5,
            -10,  5,  5,  5,  5,  5,  0,-10,
            -10,  0,  5,  0,  0,  0,  0,-10,
            -20,-10,-10, -5, -5,-10,-10,-20
        ]

        self.king_table_midgame = [
            -30,-40,-40,-50,-50,-40,-40,-30,
            -30,-40,-40,-50,-50,-40,-40,-30,
            -30,-40,-40,-50,-50,-40,-40,-30,
            -30,-40,-40,-50,-50,-40,-40,-30,
            -20,-30,-30,-40,-40,-30,-30,-20,
            -10,-20,-20,-20,-20,-20,-20,-10,
            20, 20,  0,  0,  0,  0, 20, 20,
            20, 30, 10,  0,  0, 10, 30, 20
        ]

        # Adjust the king_table for the endgame, as the king becomes a stronger piece and should be centralized
        self.king_table_endgame = [
            -50,-40,-30,-20,-20,-30,-40,-50,
            -30,-20,-10,  0,  0,-10,-20,-30,
            -30,-10, 20, 30, 30, 20,-10,-30,
            -30,-10, 30, 40, 40, 30,-10,-30,
            -30,-10, 30, 40, 40, 30,-10,-30,
            -30,-10, 20, 30, 30, 20,-10,-30,
            -30,-30,  0,  0,  0,  0,-30,-30,
            -50,-30,-30,-30,-30,-30,-30,-50
        ]

        self.piece_position_values = {
            'P': self.pawn_table,
            'N': self.knight_table,
            'B': self.bishop_table,
            'R': self.rook_table,
            'Q': self.queen_table
        }
        

    def minimax_alpha_beta(self, board: chess.Board, depth: int, alpha: int, beta: int, is_maximizing: bool) -> tuple[int, chess.Move]:
        if depth == 0 or board.is_game_over():
            return self.evaluate_board(board), None  # No move to return at leaf nodes or game-over state

        best_move = None
        if is_maximizing:
            max_eval = float('-inf')
            for move in board.legal_moves:
                board.push(move)
                eval, _ = self.minimax_alpha_beta(board, depth-1, alpha, beta, False)
                board.pop()
                if eval > max_eval:
                    max_eval = eval
                    best_move = move
                alpha = max(alpha, eval)
                if beta <= alpha:
                    break
            return max_eval, best_move
        else:
            min_eval = float('inf')
            for move in board.legal_moves:
                board.push(move)
                eval, _ = self.minimax_alpha_beta(board, depth-1, alpha, beta, True)
                board.pop()
                if eval < min_eval:
                    min_eval = eval
                    best_move = move
                beta = min(beta, eval)
                if beta <= alpha:
                    break
            return min_eval, best_move

    def evaluate_board(self, board: chess.Board) -> int:

        
        evaluation = 0

        # Determine if the game is in the endgame phase
        num_of_pieces = len(board.piece_map())
        is_endgame = not board.queens or num_of_pieces <= 14

        for square in chess.SQUARES:
            piece = board.piece_at(square)
            if piece:
                symbol = piece.symbol().upper()
                value = self.piece_values[symbol]
                
                if symbol == 'K':  # Special case for king depending on the phase of the game
                    position_value = self.king_table_endgame[square] if is_endgame else self.king_table_midgame[square]
                else:
                    position_value = self.piece_position_values[symbol][square]
                
                if piece.color == chess.BLACK:
                    value = -value
                    position_value = -position_value  # reverse the value for black pieces
                
                evaluation += value + position_value

        return evaluation

    def get_best_move(self, color: chess.Color):
        """
        Use progressive deepening and the minimax algorithm to get the best move for the given color.
        """
        best_move = None
        
        for depth in range(1, self.max_depth + 1):
            best_value = float('-inf') if color == chess.WHITE else float('inf')
            for move in self.board.legal_moves:
                self.board.push(move)
                is_maximizing = True if color == chess.WHITE else False
                board_value, _ = self.minimax_alpha_beta(self.board, depth - 1, float('-inf'), float('inf'), is_maximizing)  # Extract the evaluation value here
                self.board.pop()

                if color == chess.WHITE and board_value > best_value:
                    best_value = board_value
                    best_move = move
                elif color == chess.BLACK and board_value < best_value:
                    best_value = board_value
                    best_move = move

        return best_move