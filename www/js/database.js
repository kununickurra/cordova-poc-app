var DBFactory = (function () {

    var instance;

    function createInstance() {
        var deferred = $.Deferred();
        var dbObject = new Object();
        dbObject.db = window.openDatabase("PreferenceDB", "1.0", "Preference local Database", 200000);
        dbObject.db.transaction(
            function (tx) {
                createDbSchema(tx);
            },
            function (error) {
                console.log('Transaction error: ' + error);
                deferred.reject('Transaction error: ' + error);
            },
            function () {
                console.log('Transaction success');
                deferred.resolve();
            }
        );
        deferred.promise();
        return dbObject;
    }

    var createDbSchema = function (tx) {
        var sql = "CREATE TABLE IF NOT EXISTS user ( " +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "user_id VARCHAR(50), " +
            "last_name VARCHAR(50), " +
            "first_name VARCHAR(50), " +
            "birth_date DATE, " +
            "resting_heart_rate INTEGER, " +
            "max_heart_rate INTEGER, " +
            "email VARCHAR(50))";
        tx.executeSql(sql, null,
            function () {
                console.log('Create USER table success');
            },
            function (tx, error) {
                alert('Create table error: ' + error.message);
            });

        sql = "CREATE TABLE IF NOT EXISTS heart_rate_data ( " +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "training_session_id VARCHAR(50), " +
            "sample_time DATETIME, " +
            "hr_value INTEGER)";
        tx.executeSql(sql, null,
            function () {
                console.log('Create heart_rate_data table success');
            },
            function (tx, error) {
                alert('Create table error: ' + error.message);
            });
    }


    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();


