import "./playBoard.css";
import {React} from "react";
import { useState, useEffect, useRef} from 'react';



var PlayBoard = ({players}) => {

    const [player1TurnState, setPlayer1TurnState] = useState(true);
    const player1TurnRef = useRef(player1TurnState);

    const gameStart = useRef(false);

    const [winnerState, setWinnerState] = useState(null);
    const winnerRef = useRef(winnerState);

    const [playingType, setPlayingType] = useState("Human vs Machine");

    const [boardData, setBoardData]  = useState((() => {
        let arr = new Array(15);
        for (var i = 0; i < 15; i++) {
            arr[i] = new Array(15).fill("");
        }
        return arr
    })());

    const [winPos, setWinPos] = useState([]);

    const boardDataRef = useRef(boardData);

    const [player1Min, setPlayer1Min] = useState(5);
    const [player1Sec, setPlayer1Sec] = useState(0);

    const [player2Min, setPlayer2Min] = useState(5);
    const [player2Sec, setPlayer2Sec] = useState(0);

    const remainTime1 = useRef(5*60*1000);
    const remainTime2 = useRef(5*60*1000);

    const timeCheckPoint1 = useRef(null);
    const timeCheckPoint2 = useRef(null);

    const [playerName2, setPlayerName2] = useState("Player 2");
    const [playerName1, setPlayerName1] = useState("Player 1");
    
/*---------------------- default player algorithm ----------------------*/

    function checkBoxPoint(row, col, value) {
        var dirs = [[1,0], [0,1], [1,1], [1,-1]];
        var points = [];
        dirs.forEach(dir => {
            // Find the largest effect range for current position
            var effectRange = [0, 1];
            for (let i = 1; i < 5; i++) {
                var rowCur = row-i*dir[0];
                var colCur = col-i*dir[1];
                if (rowCur>=0 && rowCur <= 14 && colCur>=0 && colCur<=14) {
                    if (boardData[rowCur][colCur]===value || boardData[rowCur][colCur]===""){
                        effectRange[0] -= 1;
                    } else {
                        break;
                    }
                    
                }  else {
                    break;
                }
            };

            for (let i = 1; i < 5; i++) {
                rowCur = row+i*dir[0];
                colCur = col+i*dir[1];
                if (rowCur>=0 && rowCur <= 14 && colCur>=0 && colCur<=14) {
                    if (boardData[rowCur][colCur]===value || boardData[rowCur][colCur]===""){
                        effectRange[1] += 1;
                    } else {
                        break;
                    }
                    
                }  else {
                    break;
                }
            };

            // Check for possible of winning position
            if (effectRange[1]-effectRange[0] < 5) {
                points = [...points, 0];
            } else {
                var maxPoint = 0;
                for (let i = effectRange[0]; i< effectRange[1]-4; i++) {
                    var point = (value==="O")?0.5:0;
                    for (let j = i; j< i+5; j++) {
                        if (boardData[row+j*dir[0]][col+j*dir[1]]===value) {
                            point += 1;
                        }
                    };
                    // Increase the chance that they would choose denser area
                    rowCur = row + dir[0];
                    colCur = col + dir[1];
                    if (rowCur >= 0 && rowCur <= 14 && colCur >= 0 && colCur <= 14) {
                        if (boardData[rowCur][colCur] === "") {
                            point -= 0.25;
                        }
                    };

                    rowCur = row - dir[0];
                    colCur = col - dir[1];
                    if (rowCur >= 0 && rowCur <= 14 && colCur >= 0 && colCur <= 14) {
                        if (boardData[rowCur][colCur] === "") {
                            point -= 0.25;
                        }
                    };

                    if (i<0 && i>-4) {
                        point += 0.3;
                    };

                    rowCur = row + (i-1)*dir[0];
                    colCur = col + (i-1)*dir[1];
                    if (rowCur < 0 || rowCur > 14 || colCur < 0 || rowCur > 14 || (boardData[rowCur][colCur] !=="" && boardData[rowCur][colCur] !== value)) {
                        point -= 0.25;
                    };

                    rowCur = row + (i+5)*dir[0];
                    colCur = col + (i+5)*dir[1];
                    if (rowCur < 0 || rowCur > 14 || colCur < 0 || rowCur > 14 || (boardData[rowCur][colCur] !=="" && boardData[rowCur][colCur] !== value)) {
                        point -= 0.25;
                    };

                    if (point > maxPoint) {
                        maxPoint = point;
                    }
                };
                points = [...points, maxPoint];
            }
        });
        return points;
    };

    function betterScore(score1, score2) {
        for (var i=0; i< Math.min(score1.length, score2.length); i++) {
            if (score1[i] > score2[i]) {
                return score1;
            } else if (score2[i] > score1[i]) {
                return score2;
            }
        }
        return score2;
    }

    function machineMove() {
        var maxPoint = [];
        var maxPos = [7,7];
        for (var i=0; i<15; i++) {
            for (var j=0; j<15; j++) {
                if (boardData[i][j] === "") {
                    var combineScore = [...checkBoxPoint(i,j,"X"), ...checkBoxPoint(i,j,"O")].sort().reverse();
                        maxPoint = betterScore(maxPoint,combineScore);
                        if (maxPoint === combineScore) {
                            maxPos = [i,j];
                        }
                }
            }
        };
        console.log(maxPoint)
        let tmp = new Array(...boardData);
        tmp[maxPos[0]][maxPos[1]] = "O";
        setBoardData(tmp);
    }


    useEffect(() => {
        function getTime() {
            if (gameStart.current) {
                if (player1TurnRef.current) {
                    if (timeCheckPoint1.current) {
                        remainTime1.current -= Date.now() - timeCheckPoint1.current;
                        timeCheckPoint1.current = Date.now();
                        if (remainTime1.current > 0) {
                            setPlayer1Min(Math.floor(remainTime1.current/1000/60));
                            setPlayer1Sec(Math.floor((remainTime1.current/1000)%60));
                        } else {
                            setPlayer1Min(0);
                            setPlayer1Sec(0);
                        }
                        
                    } else {
                        timeCheckPoint1.current = Date.now();
                    }
                } else {
                    if (timeCheckPoint2.current) {
                        remainTime2.current -= Date.now() - timeCheckPoint2.current;
                        timeCheckPoint2.current = Date.now();
                        if (remainTime2.current > 0) {
                            setPlayer2Min(Math.floor(remainTime2.current/1000/60));
                            setPlayer2Sec(Math.floor((remainTime2.current/1000)%60));
                        } else {
                            setPlayer2Min(0);
                            setPlayer2Sec(0);
                        }
                    } else {
                        timeCheckPoint2.current = Date.now();
                    }
                }
            }
            
        };


        function checkTimeWinner() {
            if (remainTime1.current < 0) {
                setWinnerState("player2");
                winnerRef.current = "player2";
            } else if (remainTime2.current < 0) {
                setWinnerState("player1");
                winnerRef.current = "player1";
            }
        };



        const interval = setInterval(() => {
            if (winnerRef.current) {
                clearInterval(interval)
            };
            getTime();
            checkTimeWinner();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    function checkWinnerBox(row, column) {
        var foundWinner = false;
        var dirs = [[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]];

        dirs.forEach(element => {
            if (foundWinner) {
                return false;
            }
            if (row + 4*element[0]>=0 && row + 4*element[0]<=14 && column + 4*element[1]>=0 && column + 4*element[1]<=14) {
                for (let i = 1; i<5; i++) {
                    if (boardDataRef.current[row+element[0]*i][column+element[1]*i] === boardDataRef.current[row][column]) {
                        if (i === 4) {
                            setWinPos([[row,column],[row+element[0],column+element[1]],[row+2*element[0],column+2*element[1]],[row+3*element[0],column+3*element[1]],[row+4*element[0],column+4*element[1]]]);
                            foundWinner = true;
                        }
                    } else {
                        break;
                    }
                }
            }
        });
        return foundWinner;  
    };

    function checkOnClickWinner() {
        for (var i=0; i<15; i++) {
            for (var j=0; j<15; j++) {
                if (boardDataRef.current[i][j] !== "") {
                    if (checkWinnerBox(i,j)) {
                        if (boardDataRef.current[i][j] === "X") {
                            setWinnerState("player1");
                            winnerRef.current = "player1";
                        } else {
                            setWinnerState("player2");
                            winnerRef.current = "player2";
                        }
                        break;
                    }
                }
            }
            if (winnerRef.current) {
                break;
            }
        }
    };

    const handleButtonOnClick = function(row, column) {
        if (boardData[row][column] === "" && !winnerState) {
            if (!gameStart.current) {
                gameStart.current = true;
            }
            let tmp = new Array(...boardData);
            tmp[row][column] = (player1TurnState)?"X":"O";
            setBoardData(tmp);
            checkOnClickWinner();
            if (playingType === "Human vs Machine") {
                setPlayer1TurnState(true);
                machineMove();
                checkOnClickWinner();
            } else {
                setPlayer1TurnState((player1TurnState)?false:true);
            }
        }
    };

    const handlePlayTypeOnClick = function() {
        setPlayingType((playingType==="Human vs Machine")?"Human vs Human": "Human vs Machine")
    };

    useEffect(() => {
        player1TurnRef.current = player1TurnState;
    }, [player1TurnState])

    useEffect(() => {
        boardDataRef.current = boardData;
    }, [boardData])


    function checkInclude(array, row, column) {
        var include = false;
        for (var i=0; i<array.length; i++) {
            if (array[i][0] === row && array[i][1] === column) {
                include = true;
            }
        };
        return include;
    }


    return (
        <div className="game">
            <h1 className="title">GAME XO</h1>
            <label className="play-type"> Play Mode: {playingType} </label>
            <button onClick={handlePlayTypeOnClick} className="play-type-button"> Change Mode</button>
            <div className="game-scene">
                <div className="player-info">
                    <div className="player-container1">
                        <div className="game-result"> {(winnerState)?((winnerState==="player1")?"Winner":"Loser"):""} </div>
                        <div className="player-timer"> {player1Min}:{("0"+String(player1Sec)).slice(-2)}</div>
                        <img src="player1.png" alt="Player1image" className={`player-icon + ${(player1TurnState)?"on-turn":""}`}></img>
                        <form>
                            <input type="text" className="player-name" value={playerName1} name="firstname" maxLength={25} onInput={e => setPlayerName1(e.target.value)}></input>
                        </form>
                    </div>
                </div>
                <div className="board-scene">
                {
                    boardData.map((item, index) => 
                        <div className="play-row">
                            {
                            item.map((subitem, subindex) => 
                                <button onClick={function() {handleButtonOnClick(index, subindex);}} className={`play-box + ${(player1TurnState)?" box-turn1 ":" box-turn2 "} + ${(checkInclude(winPos,index,subindex))?" winpos":""}`}>{(subitem)?subitem:(String.fromCharCode(160)+String.fromCharCode(160)+String.fromCharCode(160))}</button>
                            )}
                        </div>
                    )
                }
                </div>
                <div className="player-info">
                    <div className="player-container2">
                        <div className="game-result"> {(winnerState)?((winnerState==="player2")?"Winner":"Loser"):""} </div>
                        <div className="player-timer">{player2Min}:{("0"+String(player2Sec)).slice(-2)}</div>
                        <img src="player2.png" alt="Player2image" className={`player-icon + ${(player1TurnState)?"":"on-turn"}`}></img>
                        <form>
                            <input type="text" className="player-name" value={(playingType==="Human vs Machine")?"Machine":playerName2} name="firstname" maxLength={25} onInput={e => setPlayerName2(e.target.value)}></input>
                        </form>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}


export default PlayBoard