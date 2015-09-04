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
// var app = {
//     // Application Constructor
//     initialize: function() {
//         this.bindEvents();
//     },
//     // Bind Event Listeners
//     //
//     // Bind any events that are required on startup. Common events are:
//     // 'load', 'deviceready', 'offline', and 'online'.
//     bindEvents: function() {
//         document.addEventListener('deviceready', this.onDeviceReady, false);
//     },
//     // deviceready Event Handler
//     //
//     // The scope of 'this' is the event. In order to call the 'receivedEvent'
//     // function, we must explicity call 'app.receivedEvent(...);'
//     onDeviceReady: function() {
//         app.receivedEvent('deviceready');
//         navigator.splashscreen.hide();
//     },
//     // Update DOM on a Received Event
//     receivedEvent: function(id) {
//         var parentElement = document.getElementById(id);
//         var listeningElement = parentElement.querySelector('.listening');
//         var receivedElement = parentElement.querySelector('.received');

//         listeningElement.setAttribute('style', 'display:none;');
//         receivedElement.setAttribute('style', 'display:block;');

//         console.log('Received Event: ' + id);
//     }
// };
var socket;
function examine(number) {
    var i;
    var j;
    for (i = 0; i < 4; i++) {
        for (j = i + 1; j < 4; j++) {
            if (number[j] == number[i]) {
                return false;
            }
        }
    }
    return true;
}
var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        navigator.splashscreen.hide();
        socket = io('http://104.236.159.217');
    },
    confirmReady: function () {
        var number_reg = /^(\d){4}$/i;
        var number = $("#number").val().trim();
        if (number.length == 0) {
            swal({
                title: "warning",
                text: "Number cannot be empty!",
                type: "warning"
            });
            return false;
        } else if (!number_reg.test(number)) {
            swal({
                title: "warning",
                text: "The number must have 4 digits!",
                type: "warning"
            });
            return false;
        } else if (!examine(number)) {
            //numbers must be different
            swal({
                title: "warning",
                text: "Digits must be different!",
                type: "warning"
            });
            return false;
        }
        socket.emit('user operation', {
            "operation": "50",
            "number": number
        });
        return false;
    },
    guess: function () {
        var guess_reg = /^(\d){4}$/i;
        var guess = $("#g").val().trim();
        if (guess.length == 0) {
            swal({
                title: "warning",
                text: "Guess cannot be empty!",
                type: "warning"
            });
            return false;
        } else if (!guess_reg.test(guess)) {
            swal({
                title: "warning",
                text: "The number must have 4 digits!",
                type: "warning"
            });
            return false;
        } else if (!examine(guess)) {
            //number must be different
            swal({
                title: "warning",
                text: "Digits must be different!",
                type: "warning"
            });
            return false;
        }
        socket.emit('user operation', {
            "operation": "52",
            "number": guess
        });
    },
    enter: function() {
        var nickname = $("#n").val().trim();
        var roomNum = $("#r").val().trim();
        if (nickname.length == 0) {
            swal({
                title: "warning",
                text: "Enter a nickname!",
                type: "warning"
            });
            return false;
        }
        if (roomNum.length == 0) {
            swal({
                title: "warning",
                text: "Enter a room number!",
                type: "warning"
            });
            return false;
        }
        socket.emit('user nickname', {
            "nickname": nickname,
            "roomNum": roomNum
        });
        return false;
    },
    sendMessage: function() {
        var message = $("#m").val().trim();
        if (message.length == 0) {
            swal({
                title: "warning",
                text: "Message cannot be empty",
                type: "warning"
            });
            return false;
        }
        socket.emit('chat message', message);
        $('#m').val('');
        $('#m').focus();
        return false;
    }
};

socket.on("error", function (msg) {
    switch (msg["statusCode"]) {
        case 0:
            swal({
                title: "warning",
                text: "You failed to join this room!",
                type: "warning"
            });
            break;
        case 1:
            swal({
                title: "warning",
                text: "Room is full!",
                type: "warning"
            });
            break;
        case 2:
            swal({
                title: "warning",
                text: "Duplicate nickname!",
                type: "warning"
            });
            break;
        case 3:
            $('#messages').append($('<li>').text("You created a room."));
            //swal({title: "warning", text: "You have created a new room!", type: "warning"});
            break;
        case 4:
            swal({
                title: "warning",
                text: "You have already logged in!",
                type: "warning"
            });
            break;
        case 5:
            swal({
                title: "warning",
                text: "No such room available!",
                type: "warning"
            });
            break;
        case 6:
            swal({
                title: "warning",
                text: "You don't have permission to do so!",
                type: "warning"
            });
            break;
        case 7:
            $('#messages').append("Your opponent left the room, the game stopped.");
            $("#inner-contaier").html('<div class="form-group"><input type="text" id="number" class="form-control" autocomplete="off" onkeydown="if (event.keyCode == 13) app.confirmReady();" placeholder="Enter your number here (each digit must be different)" maxlength="4"/><a href="javascript:;" id="ready-button" class="btn btn-fill btn-info" onclick="app.confirmReady()">Ready</a></div>');
            $("#outter-container").show();
            $("#guesses-container").hide();
            break;
        case 8:
            swal({
                title: "warning",
                text: "Your opponent is not ready!",
                type: "warning"
            });
            break;
        case 9:
            swal({
                title: "warning",
                text: "Digits must be different!",
                type: "warning"
            });
            break;
        default:
            console.log("Unkown error");
    }
});
socket.on("success", function (msg) {
        switch (msg["statusCode"]) {
            case 100:
                swal({
                    title: "warning",
                    text: "Your opponent is ready!",
                    type: "warning"
                });
                break;
            case 101:
                $("#newUserContainer").hide();
                $("#battleField").show();
                $('#messages').append($('<li>').text(msg["content"] + " entered the room~"));
                break;
            case 102:
                $("#outter-container").hide();
                $("#guesses").html('');
                $("#guesses-container").show();
                break;
            case 103:
                var results = msg["content"].split(":");
                $("#guesses").append($('<li>').text('You opponent got ' + results[0] + ' A ' + results[1] + ' B'));
                break;
            case 104:
                $("#messages").append($('<li class="message">').html('<span class="other">Your opponent won the game.</span>'));
                swal({
                    title: "Sorry",
                    text: "You lost the game!",
                    type: "danger"
                });
                setTimeout(function () {
                    $("#inner-contaier").html('<div class="form-group"><input type="text" id="number" class="form-control" autocomplete="off" onkeydown="if (event.keyCode == 13) confirmReady();" placeholder="Enter your number here (each digit must be different)" maxlength="4"/><a href="javascript:;" id="ready-button" class="btn btn-fill btn-info" onclick="app.confirmReady()">Ready</a></div>');
                    $("#outter-container").show();
                    $("#guesses-container").hide();
                }, 3000);
                break;
        }
    })
    //receive chat message from server
socket.on('chat message', function (msg) {
    $('#messages').append(msg);
    var messages = document.getElementById("messages");
    messages.scrollTop = messages.scrollHeight;
});
socket.on('self', function (msg) {
    switch (msg["statusCode"]) {
        case 100:
            $("#inner-contaier").html("<h3>Please wait the other player to start the game</h3>");
            break;
        case 101:
            $("#newUserContainer").hide();
            $("#battleField").show();
            //$('#messages').append($('<li>').text(msg["content"] +" entered the room~"));
            break;
        case 102:
            $("#outter-container").hide();
            $("#guesses").html('');
            $("#guesses-container").show();
            break;
        case 103:
            var results = msg["content"].split(":");
            $("#guesses").append($('<li>').text('You guessed ' + $("#g").val().trim() + ' and got ' + results[0] + ' A ' + results[1] + ' B'));
            $("#g").val('');
            var guesses = document.getElementById("guesses");
            guesses.scrollTop = guesses.scrollHeight;
            break;
        case 104:
            $("#messages").append($('<li class="message">').html('<span class="self">You won the game.</span>'));
            swal({
                title: "Congratulation",
                text: "You won the game!",
                type: "success"
            });
            setTimeout(function () {
                $("#inner-contaier").html('<div class="form-group"><input type="text" id="number" class="form-control" autocomplete="off" onkeydown="if (event.keyCode == 13) confirmReady();" placeholder="Enter your number here (each digit must be different)" maxlength="4"/><a href="javascript:;" id="ready-button" class="btn btn-fill btn-info" onclick="app.confirmReady()">Ready</a></div>');
                $("#outter-container").show();
                $("#guesses-container").hide();
            }, 3000);
            break;
    }
});