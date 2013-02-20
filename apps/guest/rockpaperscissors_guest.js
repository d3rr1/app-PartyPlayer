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

var timerChallenger; //timer for popup when challenged
var popupID = '#popupAction';
var locationID = '#playlist';

partyplayer.minigame.triggerChallenger = function(accept){
    clearInterval(timerChallenger); 
    partyplayer.sendMessageTo(partyplayer.getHost(), {ns:'minigame',cmd:'game',params:accept});
}

partyplayer.minigame.getGameData = function(){
    partyplayer.sendMessageTo(partyplayer.getHost(), {ns:'minigame', cmd:'getGameData'});
}

partyplayer.minigame.ondata = function(params){
    
    var gameData = params.data;
    locationID = '#playlist';
    popupID = '#popupAction';
    buildGameDataList('self');
    
    //make the items appear in popup instead removing the current playlist
    function buildGameDataList(type){
        
        switch(type){
            case 'self':
                $(popupID).html(
                    '<ul id="selection" data-role="listview" data-inset="true" data-theme="a">'
                );
                $('ul#selection').append(
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
                    	
                    	$('ul#selection').append(trItem);
            	    	try {
                    	    $('ul#selection').listview('refresh');
                        } catch (err) {

                        }
                    } 
                };
                $(locationID).trigger('create');
                $(popupID).popup('open');
                
                $('ul#selection li.playlist-item').bind('click', function(){
                    //console.log($(this).attr('fid') + ' selected');
                    partyplayer.minigame.selection.p1 = {
                        userID:userProfile.userID,
                        funnelID:$(this).attr('fid')
                    }
                    console.log(partyplayer.minigame.selection);
                    buildGameDataList('opponent');
                });
                break;
             case 'opponent':
                $(popupID).popup('close');
                $( popupID ).bind({
                    popupafterclose: function(event, ui) {
                        $('#popupAction').html('<h3>Challenging opponent...</h3>');
                        $('#popupAction').popup('open');
                    }
                });
                
                //send selected data to host
                partyplayer.sendMessageTo(partyplayer.getHost(), {ns:'minigame', cmd:'challenge', params:{data:partyplayer.minigame.selection}});
                break; 
                
        } //end switch
    }
}

partyplayer.minigame.onchallengeplayer = function(){
    
    
    locationID = location.hash;
    popupID = '#popupChallenge';
    
    //build popup
    $('<div data-role="popup" id="popupChallenge" data-theme="a" data-overlay-theme="a" class="ui-content">' +
      '<p>Someone wants to challenge you!<p>' +
      '<div data-theme="a" data-role="button" onclick="partyplayer.minigame.triggerChallenger(true)">Accept</div>' +
      '<div data-theme="a" data-role="button" onclick="partyplayer.minigame.triggerChallenger(false)">Decline</div>' +
      '</div>').appendTo(locationID);
      
    $(locationID).trigger('create');
    
    //hack to disable exiting popup if clicked outside the popup window
    $(popupID).on({
        popupbeforeposition: function () {
            $('.ui-popup-screen').off();
        }
    });
    
    //open popup
    $(popupID).popup('open');
    
    //start counting for accept true/false
    //timerChallenger = setTimeout(function(){minigame.triggerChallenger(false)}, 5000);
}

partyplayer.minigame.ongame = function(){
    var selection = {};
    selection.userID = userProfile.userID;
     $(popupID).unbind();
     $(popupID).bind({
        popupafterclose: function(event, ui) {
           $(popupID).html(
                '<h3>Select your weapon!</h3>' +
                '<div id="btngrp" data-role="controlgroup" data-type="horizontal">'
            );
            $('<button id="rock"><img src="images/rock.png" width=100 height=100><p>Rock</p></button>').click(function(){
                applyChoice($(this));
            }).appendTo('#btngrp');
            $('<button id="paper"><img src="images/paper.png" width=100 height=100><p>Paper</p></button>').click(function(){
                applyChoice($(this));
            }).appendTo('#btngrp');
            $('<button id="scissors"><img src="images/scissors.png" width=100 height=100><p>Scissors</p></button>').click(function(){
                applyChoice($(this));
            }).appendTo('#btngrp');
            
            $(locationID).trigger('create');
            var interval = setTimeout(function(){
                $(popupID).popup('open');
            }, 500);
        }
    });
    $(popupID).popup('close');
   
    //build the Rock-Paper-Scissors screen  
    //make using popupAction
    

    
    /*
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
     */
    
     var applyChoice = function(o){
        selection.choice = $(o).attr('id');
        console.log(selection);
        partyplayer.sendMessageTo(partyplayer.getHost(), {ns:'minigame', cmd:'choice', params:selection});
        $(popupID).bind({
            popupafterclose: function(event, ui) {
                $(popupID).html(
                    '<h3>Awaiting results...</h3>'
                );
                $(popupID).popup('open');
            }
        });
        $(popupID).popup('close');
     }
}

partyplayer.minigame.onresult = function(params){    
    //winstate, 0=draw, 1=win, 2=lost
    
    $(popupID).unbind();

    switch(params.win){
    case 0:
        $(popupID).html('<h3>It is a draw!</h3>');
        break;
    case 1:
        $(popupID).html('<h3>You win!</h3>');
        break;
    case 2:
        $(popupID).html('<h3>You lose!</h3>');
        break;
    }
    $('<div data-theme="a" data-role="button">OK</div>').appendTo(popupID).click(function(){
        $(popupID).popup('close');
        if(locationID.localeCompare('#playlist') != 0){
            $(popupID).remove();
        }
        location.hash = locationID;
    });
    $(locationID).trigger('create');
    
}
