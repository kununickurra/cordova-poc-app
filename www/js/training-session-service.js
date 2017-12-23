var TrainingSessionService = function () {

    this.db = DBFactory.getInstance().db;

    this.recordHrSensorData = function(data) {
        var deferred = $.Deferred();
        this.db.transaction(
            function (tx) {
                var sql = "INSERT INTO heart_rate_data (training_session_id, sample_time, hr_value) VALUES (?,?,?)";
                tx.executeSql(sql, [data.trainingSessionId, data.sampleTime, data.hrValue],
                    function (tx) {
                        deferred.resolve();
                    });
            },
            function (error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    }

    this.getHrSensorData = function(trainingSessionId) {
        var deferred = $.Deferred();
        this.db.transaction(
            function (tx) {
                var sql = "SELECT * FROM heart_rate_data where training_session_id = (SELECT MAX(training_session_id) FROM heart_rate_data)"
                tx.executeSql(sql, [], function (tx, results) {
                    deferred.resolve(results.rows);
                });
            },
            function (error) {
                deferred.reject("Transaction Error: " + error.message);
            }
        );
        return deferred.promise();
    }
}