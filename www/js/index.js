/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');
        $(document).ready(function(){

            var sessionId = Math.floor(Math.random()*90000) + 10000;
            sessionStorage.setItem("sessionNumber", sessionId);

            //submit del messaggio
            $("#userMsgForm").submit(function(event){
                var input = $("#userMsgInput").val();
                callToDialogFlow(input);
                event.preventDefault();
            });
        });
        
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

function callToDialogFlow(query){
    var q = {
              "lang": "it",
              "query": query,
              "sessionId": sessionStorage.getItem("sessionNumber")
            };
    var p = JSON.stringify(q);
    console.log(p);
    $.ajax(
        {
            url: "https://api.dialogflow.com/v1/query?v=20150910",
            type: 'POST',
            contentType: "application/json",
            dataType: "json",
            headers:{"Authorization" : "Bearer 7772a6c6213840fc8a69eccdbdb950d4"},
            data: p,
            success: function(result){
                console.log(result);
                var messages;
                if(result.result.fulfillment.messages){
                    //svuoto il div che contiene i nuovi messaggi
                    $("#botSpeech").empty();
                    messages = result.result.fulfillment.messages;

                    var i;
                    for(i=0; i<messages.length; i++){
                        //per ogni messaggio ne identifico il tipo, per capire cosa mostrare
                        var type = messages[i].type;
                        switch(type){
                            case 0:
                                //messaggio testuale semplice
                                $("#botSpeech").append("<p>"+messages[i].speech+"</p>");
                                break;
                            case 1:
                                //messaggio tipo card
                                var card = $("<div></div>").addClass("card").css("width", "18rem");
                                card.append($("<img>").attr({src : messages[i].imageUrl}));
                                var cardBody = $("<div></div>").addClass("card-body");
                                cardBody.append($("<h5></h5>").addClass("card-title").html(messages[i].title));
                                cardBody.append($("<p></p>").addClass("card-text").html(messages[i].subtitle));
                                card.append(cardBody);
                                $("#botSpeech").append(card);
                            default: break;
                        }
                    }
                }

                $("#userMsgInput").val("");
            },
            error: function(xhr){
                console.log(xhr);
            }
        }
    );

}

