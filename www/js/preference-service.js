var PreferenceService = function () {

    var preferenceDAO = new PreferenceDAO();
    preferenceDAO.initialize().done(function () {
        console.log("Service initialized...");
    });

    this.createUser = function (user) {
        // var user = new Object();
        // user.userId = "User"+ Math.floor((Math.random() * 100) + 1);
        // user.lastName = "Tillier";
        // user.firstName = "Nicolas";
        // user.birthDate = "1979-12-20"
        // user.restingHeartRate = 58;
        // user.maxHeartRate = 190;
        // user.email = "nicolas.tillier@hotmail.com";
        preferenceDAO.insert(user).done(function () {
            alert("User Inserted...")
        });
    }

    this.findUsers = function (callBack) {
        preferenceDAO.findAll().done(function (result) {
            callBack(result);
        });
    }

}