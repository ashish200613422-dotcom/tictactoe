from fastapi import APIRouter
from rules.services import new_game,the_game,restart_game

router=APIRouter()

router.post("/game/new")(new_game)
router.post("/")(the_game)
router.post("/restart/game")(restart_game)
