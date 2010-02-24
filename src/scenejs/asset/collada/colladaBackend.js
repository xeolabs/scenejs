/**
 * Backend for asset nodes which extends the basic type to provide support for the COLLADA XML format
 *
 * @param cfg
 */

SceneJS._backends.installBackend(
        (function() {


            var SAXEventHandler = function() {

                this.characterData = "";
            }

            SAXEventHandler.prototype.characters = function(data, start, length) {
                this.characterData += data.substr(start, length);

            }


            SAXEventHandler.prototype.endDocument = function() {
                this._handleCharacterData();
            }


            SAXEventHandler.prototype.endElement = function(name) {
                this._handleCharacterData();
            }


            SAXEventHandler.prototype.processingInstruction = function(target, data) {
                this._handleCharacterData();
            }


            SAXEventHandler.prototype.setDocumentLocator = function(locator) {
                this._handleCharacterData();
            }


            SAXEventHandler.prototype.startElement = function(name, atts) {
                this._handleCharacterData();
            }


            SAXEventHandler.prototype.startDocument = function() {
                this._handleCharacterData();
            }


            SAXEventHandler.prototype.comment = function(data, start, length) {
                this._handleCharacterData();
            }


            SAXEventHandler.prototype.endCDATA = function() {
                this._handleCharacterData();
            }


            SAXEventHandler.prototype.startCDATA = function() {
                this._handleCharacterData();
            }


            SAXEventHandler.prototype.error = function(exception) {
                this._handleCharacterData();
            }

            SAXEventHandler.prototype.fatalError = function(exception) {
                this._handleCharacterData();
            }

            SAXEventHandler.prototype.warning = function(exception) {
                this._handleCharacterData();

            }


            SAXEventHandler.prototype._fullCharacterDataReceived = function(fullCharacterData) {
            }

            SAXEventHandler.prototype._handleCharacterData = function() {
                if (this.characterData != "") {
                    this._fullCharacterDataReceived(this.characterData);
                }
                this.characterData = "";

            }  // end function _handleCharacterData

            function startParser(xml) {
                var parser = new SAXDriver();
                var eventHandler = new SAXEventHandler();
                parser.setDocumentHandler(eventHandler);
                parser.setLexicalHandler(eventHandler);
                parser.setErrorHandler(eventHandler);
                parser.parse(xml);
            }

            return SceneJS.assetBackend({

                /** All asset backends have an type ID of this form:
                 * "asset." concatenated with the target file extension
                 */
                type: 'asset.dae',


                /** Special params for asset server
                 */
                serverParams: {
                    mode: 'xml'
                },

                /** Parses COLLADA XML into a scene node
                 */
                parse: function(xml) {
                    startParser(xml);
                    //                    var re = new RegExp("(\\')", "g");
                    //                    xml = xml.replace(re, xml);
                    var x;
                }
            });
        })()
        )
        ;


