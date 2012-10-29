
SceneJS.Core = function(cfg) {
    this.type = cfg.type;
    this.useCount = 0;
    this.stateId = cfg.stateId;
    this.coreId = (cfg.coreId != undefined && cfg.coreId != null) ? cfg.coreId : this.stateId; // Use state ID as core ID by default
};

SceneJS.Core.prototype.constructor = SceneJS.Core;

