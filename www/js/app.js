var selectedDeviceId = null;
var trainingSessionId = null;

document.addEventListener('deviceready', function () {
  if (navigator.notification) { // Override default HTML alert with native dialog
      window.alert = function (message) {
          navigator.notification.alert(
              message,    // message
              null,       // callback
              "Native alert", // title
              'OK'        // buttonName
          );
      };
  }

  window.addEventListener("batterystatus", onBatteryStatus, false);

}, false);



$(document).ready(function() {
    $("#test-select-image").click(function() {
        event.preventDefault();
        if (!navigator.camera) {
            alert("Camera API not supported", "Error");
            return;
        }
        var options =   {   quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Album
            encodingType: 0     // 0=JPG 1=PNG
        };

        navigator.camera.getPicture(
            function(imgData) {
                $("#selected-picture-object").attr('src', "data:image/jpeg;base64,"+imgData);
            },
            function() {
                alert('Error taking picture', 'Error');
            },
            options);

        return false;
    });

    $("#test-alert").bind("click", function() {
        alert("Very important message !");
    });


    $("#test-geolocation").click(function(event) {
        event.preventDefault();
        if(!navigator.geolocation) {
            alert("Golocation API not supported", "Error");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function(position) {
                alert(position.coords.latitude + ',' + position.coords.longitude);
            },
            function() {
                alert("Golocation API not supported", "Error");
            });
        return false;
    });

    // BLE & HR recording
    $("#btn-scan-ble").click(scanBleDevices);
    $("#btn-start-training-session").click(startTrainingSession);
    $("#btn-stop-training-session").click(stopTrainingSession);
    $("#test-record-data").click(function () {
        recordHearRate(10);
    });
    $("#view-data-training-session").click(function () {
        trainingSessionService.getHrSensorData().done(function (result) {
            alert("Last session sensor data : "+ JSON.stringify(result));
        });
    });



    $("#btn-show-location").click(function () {
        showMap($("#test-map"));
    });

    $("#insert-user").click(function () {
        var preferenceService = new PreferenceService();
        preferenceService.createUser();
    });

    $("#retrieve-user").click(function () {
        var preferenceService = new PreferenceService();
        preferenceService.findUsers(function (result) {
            alert("User data "+ JSON.stringify(result));
        })
    });

    $("#btn-create-user").click(function () {
        var preferenceService = new PreferenceService();
        var newUser = new Object();
        newUser.userId = $("#create-user-form #userId").val();
        newUser.lastName = $("#create-user-form #lastName").val();
        newUser.firstName = $("#create-user-form #firstName").val();
        newUser.birthDate = $("#create-user-form #birthDate").val();
        newUser.restingHeartRate = $("#create-user-form #restingHeartRate").val();
        newUser.maxHeartRate = $("#create-user-form #maxHeartRate").val();
        newUser.email = $("#create-user-form #email").val();

        preferenceService.createUser(newUser);
    });
});

$("#pg-list-users").bind('pagebeforeshow', function () {
    loadUserList();
});

$("#pg-list-contacts").bind('pagebeforeshow', function () {
    loadContactList();
});

$("#pg-chart-test").bind('pagebeforeshow', function () {
    generateChart();
});


function loadUserList () {
    $("#user-list").empty();
    var preferenceService = new PreferenceService();
    preferenceService.findUsers(function (users) {
        for(i=0; i<users.length; i++) {
            $("#user-list").append(
                $("<li>")
                    .addClass("ui-li-item").append(
                    $("<a>")
                        .attr("id","user_"+users[i].id)
                        .append(users[i].last_name + ', ' + users[i].first_name)
                )
            );
        }
        $("#user-list").listview('refresh');
    });
}

function loadContactList () {
    if(navigator.contacts) {
        $("#contact-list").empty();
        searchContacts(function (contacts) {

            contacts.sort(function(a,b) {
                if (a.displayName < b.displayName)
                    return -1;
                if (a.displayName > b.displayName)
                    return 1;
                return 0;
            });

            for(i=0; i<contacts.length; i++) {
                $("#contact-list").append(
                    $("<li>")
                        .addClass("ui-li-item").append(
                        $("<a>")
                            .attr("id","contact_"+i)
                            .append(contacts[i].displayName)
                    )
                );
            }
            $("#contact-list").listview('refresh');
        });
    } else {
        alert("Cannot access contact list...");
    }
}

// Bind to "mobileinit" before you load jquery.mobile.js
$( document ).on( "mobileinit", function() {
    $.mobile.listview.prototype.options.autodividersSelector = function( elt ) {
        var text = $.trim( elt.text() ) || null;
        if ( !text ) {
            return null;
        }
        if ( !isNaN(parseFloat(text)) ) {
            return "0-9";
        } else {
            text = text.slice( 0, 1 ).toUpperCase();
            return text;
        }
    };
});


//// CHART
function generateChart() {
    trainingSessionService.getHrSensorData().done(function (result) {

        var hrData = new Array();
        for(i=0; i<result.length;i++) {
            hrData[i] = result[i] =
                {
                    x: result[i].sample_time,
                    y: result[i].hr_value

                }
        }

        var chartConfig = {
            type: 'line',
            data: {
                datasets: [{
                    label: "HR Bpm",
                    data: hrData,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                title:{
                    display:true,
                    text:"Last training session HR read"
                },
                scales: {
                    xAxes: [{
                        type: "time",
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Date'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'value'
                        }
                    }]
                }
            }
        };
        var myChart = new Chart($("#test-chart"), chartConfig);
    });
}



function createChart() {
    var myChart = new Chart($("#test-chart"), {
        type: 'bar',
        data: {
            labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}
//// END CHART

//// Start BLE & HEART RATE

var selectedDeviceId = null;
var trainingSessionId = null;
var trainingSessionService = new TrainingSessionService();

function startTrainingSession() {
    if(trainingSessionId == null) {
        trainingSessionId = "HR-" + new Date().getTime();
        $("#lbl-current-training-session").text(trainingSessionId);
    } else {
        alert("training session in progress...");
    }
}

function stopTrainingSession() {
    trainingSessionId = null;
    $("#lbl-current-training-session").text("");
}

function heartRateDataUpdated (buffer) {
    // Decode the ArrayBuffer into a typed Array based on the data you expect
    var data = new Uint8Array(buffer);
    var hrValue = 0;
    if(data.length >= 2) {
        hrValue = data[1];
        $("#test-heart-rate-data").text(data[1]);
        recordHearRate(hrValue);
    }
}

function recordHearRate(hrValue) {
    // Check if data needs to be recorded.
    if(trainingSessionId != null) {
        var sensorData = new Object();
        sensorData.trainingSessionId = trainingSessionId;
        sensorData.sampleTime = new Date();
        sensorData.hrValue = hrValue;
        trainingSessionService.recordHrSensorData(sensorData);
    }

}



function readHeartRate() {
    ble.read(selectedDeviceId, "180d", "2a37",
        function (data) {
            alert("Success reading heart beat, data : "+JSON.stringify(data))
        },
        function (data) {
            alert("ERROR reading heart beat, data : "+JSON.stringify(data))
        });

}


function connectBleDevice(deviceId) {
    ble.connect(deviceId,
        function (data) {
            selectedDeviceId = deviceId;
            alert(JSON.stringify(data));
            ble.startNotification(selectedDeviceId, "180d", "2a37", heartRateDataUpdated,
                function (data) {
                    alert("ERROR reading heart beat, data : "+JSON.stringify(data))
                });
        },
        function () {
            alert("Cannot connect to device")
        });
}

function renderDeviceList (device) {
    $("#ble-device-list").empty();

    $("#ble-device-list").append(
    $("<li>").addClass("ui-li-item").append(
        $("<a>")
            .attr("id","ble-device-1")
            .append(device.name)
            .click(function () {
                alert("Device ID :"+device.id)
                connectBleDevice(device.id)
            })));

    $("#ble-device-list").listview('refresh');
}

function scanBleDevices() {
    ble.scan([], 5,
        renderDeviceList,
        function() {
            alert("Cannot scan BLE devices")
        });
}
//// Stop BLE & HEART RATE


function onBatteryStatus(status) {
    var batteryStatus = "Unplugged";
    if(status.isPlugged) {
        batteryStatus = "Plugged";
    }
    $("#test-battery-status").text("Level: " + status.level + " (" + batteryStatus + ")");
}


// START Search Contacts
function searchContacts (successCallBack) {
    var fields       = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name];
    navigator.contacts.find(fields, successCallBack, function (errorMessage) {
       alert("Cannot get contacts : "+errorMessage)
    });
}