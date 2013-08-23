importScripts("jiglib.all.min.js");

var numBodies = 0;

addEventListener("message",
    function (e) {

        var data = e.data;

        switch (data.cmd) {

            case "createBody":
                var bodyId = data.bodyId;
                var body = data.body;
                var shape = body.shape;
                switch (shape) {
                    case "box":
                        break;
                    case "sphere":
                        break;
                    default:
                        return;
                }
                numBodies++;
                break;

            case "removeBody":
                var bodyId = data.bodyId;
                numBodies--;
                break;

            case "integrate":

                var updates = [];
                for (var i = 0, len = numBodies; i < len; i++) {

                    // Position
                    updates.push(Math.random() * 10 - 5);
                    updates.push(Math.random() * 10 - 5);
                    updates.push(Math.random() * 10 - 5);

                    // Identity rotation matrix
                    updates.push(1);
                    updates.push(0);
                    updates.push(0);
                    updates.push(0);

                    updates.push(0);
                    updates.push(1);
                    updates.push(0);
                    updates.push(0);

                    updates.push(0);
                    updates.push(0);
                    updates.push(1);
                    updates.push(0);

                    updates.push(0);
                    updates.push(0);
                    updates.push(0);
                    updates.push(1);
                }

                self.postMessage(updates);

                break;
        }
    }, false);