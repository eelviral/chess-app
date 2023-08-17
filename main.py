import tkinter as tk

WHITE_IMAGES = 'images/white/'
BLACK_IMAGES = 'images/black/'
SCREEN_WIDTH = 900

class ChessUI:
    """
    This class creates and manages the graphical user interface for a chess game. It includes
    functionality to draw the game board, game pieces, and handle user interaction.

    Attributes:
        game (ChessGame): The chess game to use.
        root (Tk): The root Tkinter instance.
        canvas (Canvas): The Tkinter canvas to draw the game on.
        images (dict): Dictionary mapping piece symbols to their corresponding image files.
        first_click (tuple): The coordinates of the first click, or None if no click has been made yet.
        selected_piece (Piece): The currently selected chess piece, or None if no piece is selected.
        legal_moves (list): List of all current legal moves.
        click_handler (ClickHandler): Instance of the click handler to manage click events.
    """

    def __init__(self, board: chess.Board):
        """
        Initializes the ChessUI with a given chess game, sets up the game window,
        and binds mouse click events to the click handler.

        Args:
            chess_game (chess): The chess game being played.
        """
        self.board = board

        # Initialize screen
        self.root = tk.Tk()
        self.canvas = tk.Canvas(self.root, width=SCREEN_WIDTH, height=SCREEN_WIDTH)
        self.canvas.pack()

        # Set the window icon and title
        self.root.iconbitmap('images/ico/chess-icon.ico')
        self.root.title("Chess")

        # Center the canvas
        self.center_canvas()

        # Load images
        self.images = self.__load_images()

        # Event handling
        self.first_click = None
        self.selected_piece = None
        self.legal_moves = []
        # self.click_handler = ClickHandler(self)
        # self.canvas.bind("<Button-1>", self.click_handler.handle_click)
        
        self.current_turn = 'w'  # Let's start with white

    @staticmethod
    def __load_images() -> dict:
        """
        Load images for each black and white chess piece.

        Returns:
            dict: A dictionary mapping piece symbols to their respective image files.
        """
        images = {}
        pieces = {
            'pawn': 'P',
            'knight': 'N',
            'bishop': 'B',
            'rook': 'R',
            'queen': 'Q',
            'king': 'K'
        }

        for piece, symbol in pieces.items():
            images[symbol.upper()] = tk.PhotoImage(file=f'{WHITE_IMAGES}{piece}.png')
            images[symbol.lower()] = tk.PhotoImage(file=f'{BLACK_IMAGES}{piece}.png')
        return images

    def draw_board(self):
        """
        Draws the chess board on the canvas, alternating the square colors.
        If there are any legal moves for a selected piece, the squares of these moves are highlighted green.
        """
        for i in range(8):
            for j in range(8):
                x1 = i * 100 + 50
                y1 = j * 100 + 50
                x2 = x1 + 100
                y2 = y1 + 100
                color = "#deb887" if (i + j) % 2 == 0 else "#4d3222"
                # if (i, j) in self.legal_moves:
                #     color = "#00ff00"  # Highlight with green color for legal moves
                self.canvas.create_rectangle(x1, y1, x2, y2, fill=color)

    def draw_pieces(self):
        """
        Iterates through all chess pieces on the game board and draws them on the canvas at their respective locations.
        """
        for square in chess.SQUARES:
            piece = self.board.piece_at(square)
            if piece:
                rank = square // 8  # 0-7 representing rows
                file = square % 8   # 0-7 representing columns
                
                # Convert rank and file to canvas coordinates
                x = (file + 0.5) * 100 + 50
                y = (7 - rank + 0.5) * 100 + 50  # We reverse the rank here since chess rank 0 starts from the bottom
                    
                image = self.images.get(piece.symbol())
                if image:
                    self.canvas.create_image(x, y, image=image, anchor=tk.CENTER)

    def draw_labels(self):
        """
        Draws labels for the chess board columns (A-H) and rows (1-8) on the canvas.
        """
        labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
        for i in range(8):
            x = i * 100 + 100
            y = 25
            self.canvas.create_text(x, y, text=labels[i])
            y = 875
            self.canvas.create_text(x, y, text=labels[i])
            x = 25
            y = i * 100 + 100
            self.canvas.create_text(x, y, text=8 - i)
            x = 875
            self.canvas.create_text(x, y, text=8 - i)

    def center_canvas(self):
        """
        Centers the game window on the screen, accounting for screen resolution.
        """
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()

        # Positioning the window in the center of the screen
        x_coordinate = (screen_width / 2) - (SCREEN_WIDTH / 2)
        y_coordinate = (screen_height / 2) - (SCREEN_WIDTH / 1.95)

        self.root.geometry("%dx%d+%d+%d" % (SCREEN_WIDTH, SCREEN_WIDTH, x_coordinate, y_coordinate))

    def update(self):
        """
        Updates the chess board and pieces by deleting all canvas content and redrawing the board,
        pieces, and labels. After drawing, it also allows the AI to play its move if it's its turn.
        """
        self.canvas.delete("all")
        self.draw_board()
        self.draw_pieces()
        self.draw_labels()

        # Check game status
        if self.board.is_game_over():
            print("Game Over!")
            return

        # AI's turn to play for both white and black until game ends
        if self.current_turn == 'w':
            move = self.get_best_move('w')
            if move:
                self.board.push(move)
                self.current_turn = 'b'
                self.root.after(50, self.update)  # Delay for 1 second before updating
        elif self.current_turn == 'b':
            move = self.get_best_move('b')
            if move:
                self.board.push(move)
                self.current_turn = 'w'
                self.root.after(50, self.update)  # Delay for 1 second before updating

                
    def get_best_move(self, color: str, max_depth: int = 3):
        """
        Use progressive deepening and the minimax algorithm to get the best move for the given color.
        """
        best_move = None
        
        for depth in range(1, max_depth + 1):
            best_value = float('-inf') if color == 'w' else float('inf')
            for move in self.board.legal_moves:
                self.board.push(move)
                board_value, _ = minimax_alpha_beta(self.board, depth - 1, float('-inf'), float('inf'), not color == 'w')  # Extract the evaluation value here
                self.board.pop()

                if color == 'w' and board_value > best_value:
                    best_value = board_value
                    best_move = move
                elif color == 'b' and board_value < best_value:
                    best_value = board_value
                    best_move = move

        return best_move

    def run(self):
        """
        Starts the Tkinter event loop, which waits for user interaction until the game window is closed.
        """
        self.update()
        self.root.mainloop()

if __name__ == "__main__":
    board = chess.Board()
    gui = ChessUI(board)
    gui.run()
