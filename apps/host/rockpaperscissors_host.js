/*
 * Code contributed to the webinos project.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * (C) Copyright 2012, TNO
 *
 * Authors: Daryll Rinzema
 */
 
//the data needed for the game will be stored in these vars
var gameData;
var selectedData;

partyplayer.minigame.ongetGameData = function(params, ref, from){
    gameData = funnel.buildSortedCombi();
    console.log(gameData);
    partyplayer.sendMessageTo(from, {ns:"minigame", cmd:"data", params:{data:gameData}});
}

partyplayer.minigame.onchallenge = function(params, ref, from){
    selectedData = params.data;
    
    for(user in users){
        if(users[user].userID == selectedData.player1.userID){
            selectedData.player1.address = users[user].address;
        }
        if(users[user].userID == selectedData.player2.userID){
            selectedData.player2.address = users[user].address;
        }
    }    
    partyplayer.sendMessageTo(selectedData.player2.address, {ns:'minigame', cmd:'challengeplayer'});
}

partyplayer.minigame.ongame = function(params){
    //params = accepted: true/false by player2
    console.log(params);
    switch(params){
        case true:
            console.log('player2 accepted the challenge');
            partyplayer.sendMessageTo(selectedData.player1.address, {ns:'minigame', cmd:'game'}); //start the game on both sides
            partyplayer.sendMessageTo(selectedData.player2.address, {ns:'minigame', cmd:'game'}); 
            break;
        case false:
            console.log('player2 declined the challenge');
            //winstate, 0=draw, 1=win, 2=lost
            partyplayer.sendMessageTo(selectedData.player1.address, {ns:'minigame', cmd:'result', params:{win:1}});
            //minigame.switchItem();
            break;
    }
    
}

partyplayer.minigame.onchoice = function(params){
    
    //set choice for correct player
    for(player in selectedData){
        if((selectedData[player].userID).localeCompare(params.userID) == 0){
            //already convert the choice strings to number for easier comparison
            //rock=1, paper=2, scissors=3
            switch(params.choice){
                case 'rock':
                    selectedData[player].choice = 1;
                    break;
                case 'paper':
                    selectedData[player].choice = 2;
                    break;
                case 'scissors':
                    selectedData[player].choice = 3;
                    break;
            }
        }
    }
    
    for(player in selectedData){
        if(selectedData[player].hasOwnProperty('choice')){
            console.log(selectedData[player].userID + ' has made a choice: ' + selectedData[player].choice);
        } else {
            console.log(selectedData[player].userID + ' has NOT made a choice, exiting...');
            return;
        }
    }
    
    partyplayer.minigame.calcWinner();
}

partyplayer.minigame.calcWinner = function(){
    //console.log('calculating winner with...');
    //console.log(selectedData);
    
    var p1choice = selectedData.player1.choice;
    var p2choice = selectedData.player2.choice;
    
    //win true/false, will be set in the switch/case
    var endResult = {
        player1 : {
            win : ''
        },
        player2 : {  
            win : ''
        }
    };
    
    //rock=1, paper=2, scissors=3
    //0=draw, 1=win, 2=lost
    switch(p1choice){
        case 1:
            if(p1choice == p2choice){
                endResult.player1.win=0;
                endResult.player2.win=0;
            } else if(p1choice < p2choice){
                if(p2choice == 2){
                    endResult.player1.win=2;
                    endResult.player2.win=1;
                } else if(p2choice==3){
                    endResult.player1.win=1;
                    endResult.player2.win=2;
                }   
            }
            break;
        case 2:
            if(p1choice == p2choice){
                endResult.player1.win=0;
                endResult.player2.win=0;
            } else if(p1choice < p2choice){
                endResult.player1.win=2;
                endResult.player2.win=1;
            } else if(p1choice > p2choice){
                endResult.player1.win=1;
                endResult.player2.win=2;
            }
            break;
        case 3:
            if(p1choice == p2choice){
                endResult.player1.win=0;
                endResult.player2.win=0;
            } else if(p1choice > p2choice){
                if(p2choice == 2){
                    endResult.player1.win=1;
                    endResult.player2.win=2;
                } else if(p2choice==1){
                    endResult.player1.win=2;
                    endResult.player2.win=1;
                }   
            }
            break;
    }
    
    //if player1 won switch funnelItems
    if(endResult.player1.win == 1){
        partyplayer.minigame.switchItem();
    }
    //console.log(endResult);
    partyplayer.sendMessageTo(selectedData.player1.address, {ns:'minigame', cmd:'result', params:endResult.player1});
    partyplayer.sendMessageTo(selectedData.player2.address, {ns:'minigame', cmd:'result', params:endResult.player2});
}

partyplayer.minigame.switchItem = function(){
    var currentList = funnel.getFunnel();
    var items = {};
    
    for(var i=0;i<currentList.length;i++){
        if(currentList[i][0] == selectedData.player1.funnelID){
            items.index1 = i;
            items.votes1 = currentList[i][1];
        }
        if(currentList[i][0] == selectedData.player2.funnelID){
            items.index2 = i;
            items.votes2 = currentList[i][1];
        }
    }
    //switch votes
    currentList[items.index1][1] = items.votes2;
    currentList[items.index2][1] = items.votes1;
    
    //switch position
    var old = currentList[items.index2];
    currentList[items.index2] = currentList[items.index1];
    currentList[items.index1] = old; 
    
    funnel.setFunnel(currentList);

}
