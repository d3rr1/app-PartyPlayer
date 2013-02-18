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

var timerChallenger; //var timer for popup

partyplayer.minigame.triggerChallenger = function(accept){
    $('#popupChallenge').popup('close');
    $('#popupChallenge').remove();
    clearInterval(timerChallenger); 
    partyplayer.sendMessageTo(partyplayer.getHost(), {ns:'minigame',cmd:'game',params:accept});
}

partyplayer.minigame.getGameData = function(){
    partyplayer.sendMessageTo(partyplayer.getHost(), {ns:'minigame', cmd:'getGameData'});
}

partyplayer.minigame.ondata = function(params){
    
    var gameData = params.data;
    buildGameDataList('self');
    
    function buildGameDataList(type){
        $('ul#playlist li').remove();
        
        switch(type){
            case 'self':
                $('ul#playlist').append(
                    '<li data-swatch="a" class="ui-li ui-li-divider ui-btn ui-bar-a ui-corner-top" data-role="list-divider">' +
                    'Select self-uploaded song for the fight!</li>'
                )
                for(var i=0; i<gameData.length;i++){
                    if(userProfile.userID.localeCompare(gameData[i].user.userID) == 0){
                    
                        var trItem = '';
                    	trItem += '<li class="playlist-item" fid="' + gameData[i].funnelID + '" uid="' + gameData[i].user.userID + '"><a href="#">';
                        trItem += '<img src="'+ gameData[i].user.thumbnail +'"/>';
                        trItem += '<p>Added by: ' + gameData[i].user.alias + '</p>';
                        
                        if (gameData[i].item.title) {
	                        trItem += '<h3>'+gameData[i].item.title+'</h3>';
	                    } else {
	                        trItem += '<h3>'+gameData[i].item.name+'</h3>';
	                    }

                        trItem += '<p>' + gameData[i].item.artist + ' / ' + gameData[i].item.album + '</p>';
                        trItem += '<span class="ui-li-count">Position: ' + (i+1) + '</span>'
                    	trItem += '</a></li>';
                    	
                    	$('ul#playlist').append(trItem);
            	    	try {
                    	    $('ul#playlist').listview('refresh');
                        } catch (err) {

                        }
                    } 
                };
                
                $('ul#playlist li').bind('click', function(){
                    //console.log($(this).attr('fid') + ' selected');
                    partyplayer.minigame.selection.player1 = {
                        userID:userProfile.userID,
                        funnelID:$(this).attr('fid')
                    }
                    console.log(partyplayer.minigame.selection);
                    //buildGameDataList('opponent');
                });
                break;
             case 'other':
                $('#game').append('<h3>Rest of Funnel Items</h3>' + 
                '<h4>Select which song to battle AGAINST...</h4>' +
                '<ul id="gamedata" data-role="listview">'); 
                for(var i=0; i<selection.pos;i++){
                     if(userProfile.userID.localeCompare(gameData[i].user.userID) != 0){
                        $('<li uid=' + gameData[i].user.userID + ' fid=' + gameData[i].funnelID + '>Position: ' + (i+1) + ' / '+ 
                        ' Added by: <img src=' + gameData[i].user.thumbnail + ' width="50" height-"50"/> ' + gameData[i].user.alias + ' / Name: ' 
                        + gameData[i].item.name + ' / Title: ' + gameData[i].item.title + ' / Artist: ' + gameData[i].item.artist + 
                        ' / Album: ' + gameData[i].item.album + '</li>').appendTo('ul#gamedata');
                    }
                }
                
                //if user cant select any items (because for example he selected the first song), go to previous screen
                if($('ul#gamedata').children().length <= 0){
                    buildGameDataList('self');
                    alert("Sorry! You can't battle for this song at the moment.");
                }
                
                $('ul#gamedata li').bind('click', function(){
                    console.log($(this).attr('fid') + ' selected');
                    selection.player2 = {
                        userID:$(this).attr('uid'),
                        funnelID:$(this).attr('fid')
                    }
                    delete selection.pos;
                    $(this).css({'background-color':'orange'});
                    console.log(selection);
                    buildGameDataList('opponent');
                });
                break;
             case 'opponent':
                $('<div data-role="popup" data-overlay-theme="a" id="popupChallenge" class="ui-content">' +
	            '<p>Challenging opponent!<p>' +
                '</div>').appendTo('#game');
                
                $('#game').trigger('create');
                
                $('#popupChallenge').popup('open');
                
                //hack to disable exiting popup if clicked outside the popup window
                $("#popupChallenge").on({
                    popupbeforeposition: function () {
                        $('.ui-popup-screen').off();
                    }
                });
                
                //send selected data to host
                partyplayer.sendMessageTo(partyplayer.getHost(), {ns:'minigame', cmd:'challenge', params:{data:selection}});
                break; 
                
        } //end switch
    }
}

partyplayer.minigame.onchallengeplayer = function(){
       
    var id = location.hash;
    
    //build popup
    $('<div data-role="popup" data-overlay-theme="a" id="popupChallenge" class="ui-content">' +
	    '<p>Someone wants to challenge you!<p>' +
	    '<button onclick="minigame.triggerChallenger(true)">Accept</button>' +
	    '<button onclick="minigame.triggerChallenger(false)">Decline</button>' +
    '</div>').appendTo(id);
    
    $(id).trigger('create');
    
    //hack to disable exiting popup if clicked outside the popup window
    $("#popupChallenge").on({
        popupbeforeposition: function () {
            $('.ui-popup-screen').off();
        }
    });
    
    //open popup
    $('#popupChallenge').popup('open');
    
    //start counting for accept true/false
    //timerChallenger = setTimeout(function(){minigame.triggerChallenger(false)}, 5000);
}

partyplayer.minigame.ongame = function(){
    var selection = {};
    selection.userID = userProfile.userID;
    
    if(location.ash != 'minigame1'){
        location.hash = 'minigame1';
    }
    
    $('#popupChallenge').popup('close');
    $('#popupChallenge').remove();
    
    //build the Rock-Paper-Scissors screen  
     $('#game').fadeOut(200, function(){
        $(this).html('');
        $('<h3>Select your weapon!</h3>').appendTo('#game');
        $('<div id="btngrp" data-role="controlgroup" data-type="horizontal">').appendTo('#game');
        $('<button id="rock"><img src="images/rock.png" width=100 height=100><p>Rock</p></button>').click(function(){
            applyChoice($(this));
        }).appendTo('#btngrp');
        $('<button id="paper"><img src="images/paper.png" width=100 height=100><p>Paper</p></button>').click(function(){
            applyChoice($(this));
        }).appendTo('#btngrp');
        $('<button id="scissors"><img src="images/scissors.png" width=100 height=100><p>Scissors</p></button>').click(function(){
            applyChoice($(this));
        }).appendTo('#btngrp');
        
        $('#content').trigger('create');
        $(this).fadeIn(200);
     });
     
     var applyChoice = function(o){
        selection.choice = $(o).attr('id');
        console.log(selection);
        partyplayer.sendMessageTo(partyplayer.getHost(), {ns:'minigame', cmd:'choice', params:selection});
        
        $('#game').fadeOut(200, function(){
            $(this).html('');
            $('<h3>Awaiting results...</h3>').appendTo(this);
            $(this).fadeIn(200);
        });
     }
}

partyplayer.minigame.onresult = function(params){    
    //winstate, 0=draw, 1=win, 2=lost
    
    $('#popupChallenge').popup('close');
    $('#popupChallenge').remove();
    
    switch(params.win){
        case 0:
            $('#game').fadeOut(200, function(){
                $(this).html('');
                $('<h3>It is a draw!</h3>').appendTo(this);
                $(this).fadeIn(200);
            });
            break;
        case 1:
            $('#game').fadeOut(200, function(){
                $(this).html('');
                $('<h3>Congratulations... you won!</h3>').appendTo(this);
                $(this).fadeIn(200);
            });
            break;
        case 2:
            $('#game').fadeOut(200, function(){
                $(this).html('');
                $('<h3>You lost!</h3>').appendTo(this);
                $(this).fadeIn(200);
            });
            break;                    
    }
}


