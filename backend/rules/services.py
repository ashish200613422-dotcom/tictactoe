from fastapi import HTTPException
from rules.schemas import Move
import random
import asyncio

game_over=False

winner=None

current_move="X"

board=[['','',''],
        ['','',''],
        ['','','']]


#check the winner------------------------------------------

def get_game_state():
    return {"message": "New game started",
            "board": board,
            "current_move": current_move,
            "winner": winner,
            "game_over": game_over}
    
def new_game():
    global board,current_move,game_over,winner
    board=[['','',''],
            ['','',''],
            ['','','']]
    
    current_move="X"

    game_over=False

    winner=None

    return get_game_state()


def bot_move():
    global board,winner,game_over
    #here i am trying to create a bot -------------------------------------------------------------
    
    next_move_bot=[]
    
    for row in range(len(board)):
        for col in range(len(board[0])):
            if board[row][col]=="":
                next_move_bot.append((row,col))

    if not next_move_bot:
        return get_game_state()
    rows,cols=random.choice(next_move_bot)
    
    board[rows][cols]="O"

    winner=check_winner()
    if winner:
        game_over=True
    if all(cell!="" for row in board for cell in row):
        game_over=True
    return get_game_state()

    
    
    
       # ----------------------------------------------------------------------------------------

def check_winner():
    for row in board:
       if row[0]!="" and row[0]==row[1]==row[2]:
            return row[0]
    for col in range(len(board[0])):
        if board[0][col]!="" and board[0][col]==board[1][col]==board[2][col]:
            return board[0][col]
    if board[0][0]!="" and board[0][0]==board[1][1]==board[2][2]:
        return board[0][0]
    if board[0][2]!="" and board[0][2]==board[1][1]==board[2][0]:
        return board[0][2]
    return None

# game moves--------------------------------------------------

async def the_game(move:Move):
    global current_move,game_over,winner,board
    row=move.row
    col=move.col
    if game_over:
        raise HTTPException(
             status_code=400,
               detail="The game is already over kid." )

    if board[row][col]!="":
        raise HTTPException(status_code=400,
                            detail="invalid move fool!")

    board[row][col]=current_move

    
    winner=check_winner()
    if winner:
        game_over=True
    if all(cell!="" for row in board for cell in row):
        game_over=True
    if game_over:
        return get_game_state()
    await asyncio.sleep(1)
    return bot_move()
    
def restart_game():
    return new_game()

