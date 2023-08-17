import chess
import chess.engine
from django.conf import settings
import os
import openai
from django.http import HttpRequest, JsonResponse
from chess_ai.ai.chess_ai import ChessAI
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

openai.api_key = settings.OPENAI_API_KEY

class AIMoveView(APIView):

    def post(self, request: HttpRequest) -> Response:
        fen = request.data.get('fen', '')
        board = chess.Board(fen)

        if board.is_game_over():
            return Response({'error': 'Game over!'}, status=status.HTTP_400_BAD_REQUEST)

        current_turn = board.turn
        move = ChessAI(board).get_best_move(current_turn)
        

        if move:
            board.push(move)

        response_data = {
            'move': str(move),
            'updated_fen': board.fen(),
            'current_turn': 'w' if board.turn == 'b' else 'b'
        }
        return Response(response_data)


class ChessGPTView(APIView):
    
    def get_best_move_for_GPT_response(self, fen):
        """Use Stockfish to get the best move for a given position."""
        
        # Check the OS and set the Stockfish path accordingly
        if os.name == 'nt':  # Windows
            stockfish_name = 'stockfish-windows-x86-64-avx2.exe'
            stockfish_path = os.path.join(settings.BASE_DIR, 'stockfish', 'windows', stockfish_name)
        else:  # Linux or other Unix-based
            stockfish_name = 'stockfish-ubuntu-x86-64-avx2'
            stockfish_path = os.path.join(settings.BASE_DIR, 'stockfish', 'linux', stockfish_name)
        os.chmod(stockfish_path, 0o755)
    
        board = chess.Board(fen)

        try:
            with chess.engine.SimpleEngine.popen_uci(stockfish_path) as engine:
                result = engine.play(board, chess.engine.Limit(time=2.0))
                move = result.move
        except Exception as e:
            print("Error occurred:", str(e))
            move = None

        return move
    
    def post(self, request: HttpRequest) -> Response:
        user_input = request.data.get('text', '')
        fen = request.data.get('fen', '')
        
        move = self.get_best_move_for_GPT_response(fen)
        board = chess.Board(fen)
        
        # Get the piece that is being moved
        piece = board.piece_at(move.from_square)
        piece_name = piece.symbol().lower()
        piece_dict = {
            'p': 'pawn',
            'r': 'rook',
            'n': 'knight',
            'b': 'bishop',
            'q': 'queen',
            'k': 'king'
        }
        
        messages = [
            {"role": "system", "content": "You are a Chess expert analyzing a game. Provide concise, user-friendly explanations. Prioritize brevity while maintaining clarity and context."},
            {"role": "user", "content": f"Context: Stockfish suggests that the best move is for the {piece_dict[piece_name]} to move to {move.uci()}. The board is in FEN-state: \"{fen}\". But please answer this question/statement first: {user_input}"},
        ]
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=150
        )
        chat_gpt_response = response['choices'][0]['message']['content']

        return Response({"message": chat_gpt_response}, status=status.HTTP_200_OK)
