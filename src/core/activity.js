/**
 * Progress indicator widget
 */
var SceneJS_Activity = function (id, options) {

//    var body = document.getElementsByTagName("body")[0];
//    var newdiv = document.createElement('div');
//    newdiv.style.height = "10px";
//    newdiv.style.width = "100px";
//    newdiv.style.padding = "0";
//    newdiv.style.margin = "0";
//    newdiv.style.left = "0";
//    newdiv.style.top = "0";
//    newdiv.style.position = "absolute";
//    newdiv.style["z-index"] = "11000";
//    newdiv.color = "#00FF00";
//    //newdiv.innerHTML += '<canvas id="' + canvasId + '" style="width: 100%; height: 100%; margin: 0; padding: 0;"></canvas>';
//    body.appendChild(newdiv);

    this.tasks = {};
    this.numTasks = 0;

    var tasks = new SceneJS_Map(this.tasks);

    this.taskStarted = function () {
        var taskId;
        var description;
        if (arguments.length == 2) {
            taskId = arguments[0];
            if (tasks.items[taskId]) {
                return taskId;
            }
            description = arguments[1];
            tasks.addItem(taskId, description);
        } else {
            description = arguments[0];
            taskId = tasks.addItem(description);
        }
        //console.log("[STARTED ] " + taskId + ": " + description);
        this.numTasks++;
        return taskId;
    };

    this.taskFinished = function (taskId) {
        var task = tasks.items[taskId];
        if (!task) {
            return;
        }
        tasks.removeItem(taskId);
       // console.log("[FINISHED] " + taskId + ": " + task);
        this.numTasks--;
        if (this.numTasks == 0) {
         //   console.log("No tasks running.");
        }
    };

    function showActivity() {
    }

    function hideActivity() {
    }

};

