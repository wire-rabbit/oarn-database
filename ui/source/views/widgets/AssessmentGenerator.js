//  The OARN Relief Nursery Database
//  Copyright (C) 2015  Oregon Association of Relief Nurseries
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU Affero General Public License as
//  published by the Free Software Foundation, either version 3 of the
//  License, or (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU Affero General Public License for more details.
//
//  You should have received a copy of the GNU Affero General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

(function (enyo, scope) {

    /**
     * Fires when an ajax call results in an error that is not handled locally.
     *
     * @event oarn.AssessmentGenerator#onAjaxError
     * @type {object}
     * @property {string} name - Name of the {@link oarn.AssessmentGenerator} control that
     * generated the event.
     * @property {object} xhrResponse - The error details
     * @public
     */

    /**
     * Fires when an ajax call is started, to alert parents to display spinners, ec.
     *
     * @event oarn.AssessmentGenerator#onAjaxStarted
     * @public
     */

    /**
     * Fires when an ajax call - one not handled locally - has returned, to alert parents to hide spinners, etc.
     *
     * @event oarn.AssessmentGenerator#onAjaxFinished
     * @public
     */

    /**
     * Fires when the assessment enters a dirty state.
     *
     * @event oarn.AssessmentGenerator#onDirtyStateChanged
     * @public
     */

    /**
     * {@link oarn.AssessmentGenerator} is a tool for creating lists of questions in a declarative way, with
     * auto-save and validation. Examples of its use are the [Child Assessment]{@link oarn.ChildAssessmentDetails}
     * and the [Family Assessment]{@link oarn.FamilyAssessmentDetails}.
     *
     * @class oarn.AssessmentGenerator
     * @extends enyo.Control
     * @public
     * @ui
     */
    enyo.kind(/** @lends oarn.AssessmentGenerator.prototype */{

        /**
         * @private
         */
        name: 'oarn.AssessmentGenerator',

        /**
         * @private
         */
        published:
            /**  @lends oarn.AssessmentGenerator.prototype */ {


            /**
             * The API auth token, bound to the widget by a parent control.
             *
             * @type {string}
             * @default ''
             * @public
             */
            token: '',


            /**
             * The OARN API object.
             *
             * @type {object}
             * @default null
             * @public
             *
             */
            api: null,

            /**
             * Indicates whether the user has readonly access to the assessment
             *
             * @type {boolean}
             * @default false
             * @public
             */
            currentOrgReadOnly: false,

            /**
             * Indicates whether the assessment has unsaved changes. Changing this value triggers a
             * [onDirtyStateChanged]{@link oarn.AssessmentGenerator#onDirtyStateChanged] event.
             *
             * @type {boolean}
             * @default false
             * @public
             */
            dirty: false,

            /**
             * If there is a memo field, when this is true a timestamp button will be included.
             *
             * @type {boolean}
             * @default true
             * @public
             */
			showTimeStampTooltip: true,

            /**
             * A css value that sets the maximum width for the containing Groupbox.
             *
             * @type {string}
             * @default '750px'
             * @public
             */
			maxWidth: '750px',

            /**
             * The name of the primary key field for the assessment
             *
             * @type {string}
             * @default ''
             * @public
             */
            pkFieldName: '',

            /**
             * This is bound from a parent and when it changes, a new set of data is pulled down
             *
             * @type {number}
             * @default -1
             * @public
             */
            assessmentID: -1,

            /**
             * These are set by the parent and used by the SelectHelper to generate the select lists
             * used in the assessment.
             *
             * @type {array}
             * @default []
             * @public
             */
            selectEndpoints: [],

            /**
             * API endpoint for the assessment, will have the assessmentID appended to it
             * should end in '/'
             *
             * @type {string}
             * @default ''
             * @public
             */
            endpointBase: '',

            /**
             * The delay, in milliseconds, between input and an autosave.
             *
             * @type {number}
             * @default 15000
             * @public
             */
            saveDelay: 15000,

            /**
             * An array of objects, each of which defines a single question on the assessment. The object's
             * properties are:
             *
             * - rowNumber <= An integer, indicating which row in the table this question should appear. If two
             * questions share the same number, they will appear in two columns
             *
             * - fieldName <= The name of the field in the POST sent to the API
             *
             * - questionText <= A string containing the question text
             *
             * - fieldType <= A string that defines the type of input. The following values are accepted:
             *      'text': enyo.Input
             *      'textarea': enyo.TextArea
             *      'checkbox': enyo.Checkbox
             *      'select': If readonly,a readonly enyo.Input, otherwise it is an oarn.DataSelect
             *      'selectWithOther': this is an attempt to combine a select with an 'other' textbox, but it's
             *      bugggy and at this point should not be used in production.
             *      'date': If readonly, a readonly enyo.Input, otherwise an oarn.DatePicker
             *
             * - otherLabel <= A string label for the selectWithOther fieldType,
             *
             * - dataSelectName <= Used to connect a question of type 'select' with a particular SelectEndpoint.
             *
             * - questionStyle <= A CSS style to apply to the question.
             *
             * - inputStyle <= A CSS style to apply to the input.
             *
             * - nullable <= A Boolean value, indicating whether the question is required.
             *
             * - requiredText <= The text to appear in a popup if a non-nullable field is left empty.
             *
             * - emptyIsValid <= A Boolean value for 'date' fields, indicating whether it may be left empty.
             *
             * @type {array}
             * @default []
             * @public
             */
            questions: [],

            /**
             * Identifies fields with values that do not change from assessment to assessment. Each object has
             * the fields:
             *
             * - fieldName <= The field name to use in the POST to the API.
             * - value <= The value to use.
             *
             * @type {array}
             * @default []
             * @public
             */
			staticPostFields: [],

            /**
             * The header text for the assessment Groupbox.
             *
             * @type {string}
             * @default 'Header Unset'
             * @public
             */
			groupboxHeaderText: 'Header Unset',

            /**
             * The text of the save button tooltip.
             *
             * @type {string}
             * @default 'Click to save'
             * @public
             */
            baseSaveString: 'Click to save.'
        },

        /**
         * @private
         */
        components: [

            {name: 'assessmentDisplay', kind: 'onyx.Groupbox', components: [
                {kind: 'onyx.GroupboxHeader', components: [
                    {name: 'headerText', classes: 'oarn-header', tag:'span'},
                    {kind: 'onyx.TooltipDecorator',
                        style: 'display: inline; float:right', components: [
                        {name: 'saveButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
                            src: 'static/assets/save-gray-small.png',
                            ontap: 'goSaveChanges'},
                        {name: 'saveTooltip', kind: 'onyx.Tooltip',
                            classes: 'oarn-tooltip', content: '', allowHtml: true}
                    ]}
                ]}
            ]},

            {name: 'selectHelper', kind: 'oarn.SelectHelper'},
            {name: 'popupFactory', kind: 'oarn.PopupFactory'}
        ],

        /**
         * @private
         */
        bindings: [
            {from: '.groupboxHeaderText', to: '.$.headerText.content'}
        ],

        /**
         * @private
         */
        events: {
            onAjaxError: '',
            onAjaxStarted: '',
            onAjaxFinished: '',
            onDirtyStateChanged: ''
        },

        /**
         * @private
         */
        handlers: {
            onSelectListsAcquired: 'selectListsAcquiredHandler',
            onPopupClosed: 'popupClosedHandler'
        },

        /**
         * @private
         */
        create: function () {
            this.inherited(arguments);

            this.api = new oarn.API();
        },

        /**
         * @private
         */
        rendered: function () {
            this.inherited(arguments);
            if (this.get('.currentOrgReadOnly')) {
                this.$.saveButton.hide();
            }

            this.$.saveTooltip.setContent(this.get('.baseSaveString'));
			this.$.assessmentDisplay.applyStyle('max-width', this.get('.maxWidth'));
        },

        createAssessment: function () {
            if (this.selectEndpoints.length > 0) {
                this.$.selectHelper.set('endpoints', this.get('.selectEndpoints'));
                this.$.selectHelper.loadSelectData();
            }
            else {
                this.drawAssessment();
            }
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        selectListsAcquiredHandler: function (inSender, inEvent) {
            this.drawAssessment();
        },

        /**
         * @private
         */
        drawAssessment: function () {
            if (this.$.tableBody != undefined && this.$.tableBody.hasNode()) {
                this.getData();
                return;
            }

            // first, how many rows and columns are there?
            var rowList = [];
            var colCounts = {};
            for (var i = 0; i < this.questions.length; i++) {
                if (rowList.indexOf(this.questions[i].rowNumber) == -1) {
                    rowList.push(this.questions[i].rowNumber);
                    colCounts[this.questions[i].rowNumber] = 1;
                }
                else {
                    colCounts[this.questions[i].rowNumber]++;
                }
            }
            var colspan = 0; // this is an abstract colspan, based on the number of questions
            for (var p in colCounts) {
                if (colCounts.hasOwnProperty(p)) {
                    if (colCounts[p] > colspan) {
                        colspan = colCounts[p];
                    }
                }
            }

            // now create a table:
            var tableBody = {name: 'tableBody', tag: 'table', components: []};
			for (var i = 0; i < rowList.length; i++) {
				var row = {tag: 'tr', components: [], classes: 'oarn-table-row'};
				for (var j = 0; j < this.questions.length; j++) {
					if (this.questions[j].rowNumber == rowList[i]) {
						var cell = {tag: 'td', components: []};
						var input = null;
                        var inputName = '';
                        var otherInput = null;

						var localColspan = colCounts[this.questions[j].rowNumber];

                        var maxLength = 100;
                        if (this.questions[j].maxLength != undefined) {
                            maxLength = this.questions[j].maxLength;
                        }

                        var otherLength = 100;
                        if (this.questions[j].otherLength != undefined) {
                            otherLength = this.questions[j].otherLength;
                        }

                        var inputStyle = '';
                        var questionStyle = '';
                        if (this.questions[j].inputStyle != undefined) {
                            inputStyle = this.questions[j].inputStyle;
                        }
                        if (this.questions[j].questionStyle != undefined) {
                            questionStyle = this.questions[j].questionStyle;
                        }

						if (this.get('.currentOrgReadOnly')) {
                            if (this.questions[j].fieldType == 'text') {
                                inputName = 'txt_' + this.questions[j].fieldName;
                                input = {
                                    name: inputName,
                                    kind: 'enyo.Input',
                                    attributes: [{'readonly':'readonly'}],
                                    style: inputStyle,
                                    classes: 'oarn-control oarn-groupbox-control oarn-table-control'
                                };
                            }
                            else if (this.questions[j].fieldType == 'textarea') {
                                inputName = 'txt_' + this.questions[j].fieldName;
                                input = {
                                    name: inputName,
                                    kind: 'enyo.TextArea',
                                    attributes: [{'readonly':'readonly'}],
                                    style: inputStyle,
                                    classes: 'oarn-control oarn-groupbox-control oarn-table-control'
                                };
                            }
                            else if (this.questions[j].fieldType == 'checkbox') {
                                inputName = 'chk_' + this.questions[j].fieldName;
                                input = {
                                    name: inputName,
                                    kind: 'enyo.Checkbox',
                                    style: inputStyle,
                                    onchange: 'frozenCheckboxChanged',
                                    classes: 'oarn-control oarn-groupbox-control oarn-table-control'
                                };
                            }
                            else if (this.questions[j].fieldType == 'select') {
                                inputName = 'select_' + this.questions[j].fieldName;
                                input = {
                                    name: inputName,
                                    kind: 'enyo.Input',
                                    attributes: [{'readonly':'readonly'}],
                                    style: inputStyle,
                                    classes: 'oarn-control oarn-groupbox-control oarn-table-control'
                                };
                            }
                            else if (this.questions[j].fieldType == 'selectWithOther') {
                                inputName = 'select_' + this.questions[j].fieldName;
                                input = {
                                    name: inputName,
                                    kind: 'enyo.Input',
                                    attributes: [{'readonly':'readonly'}],
                                    style: inputStyle,
                                    classes: 'oarn-control oarn-groupbox-control oarn-table-control'
                                };
                                otherInput = {
                                    name: 'other_' + this.questions[j].fieldName,
                                    kind: 'enyo.Input',
                                    attributes: [{'readonly':'readonly'}],
                                    style: inputStyle,
                                    classes: 'oarn-control oarn-groupbox-control oarn-table-control'
                                };
                            }
                            else if (this.questions[j].fieldType == 'date') {
                                inputName = 'date_' + this.questions[j].fieldName;
                                input = {
                                    name: inputName,
                                    kind: 'enyo.Input',
                                    attributes: [{'readonly':'readonly'}],
                                    style: inputStyle,
                                    classes: 'oarn-control oarn-groupbox-control oarn-table-control'
                                };
                            }
						}
						else {
                            if (this.questions[j].fieldType == 'text') {
                                inputName = 'txt_' + this.questions[j].fieldName;
                                input = {
                                    name: inputName,
                                    kind: 'enyo.Input',
                                    style: inputStyle,
                                    oninput: 'goInput',
                                    classes: 'oarn-control oarn-groupbox-control oarn-table-control',
                                    attributes: [{'maxlength': maxLength}]
                                };
                            }
                            else if (this.questions[j].fieldType == 'textarea') {
                                inputName = 'txt_' + this.questions[j].fieldName;
                                input = {
                                    name: inputName,
                                    kind: 'enyo.TextArea',
                                    style: inputStyle,
                                    oninput: 'goInput',
                                    classes: 'oarn-control oarn-groupbox-control oarn-table-control'
                                };
                            }
                            else if (this.questions[j].fieldType == 'checkbox') {
                                inputName = 'chk_' + this.questions[j].fieldName;
                                input = {
                                    name: inputName,
                                    kind: 'enyo.Checkbox',
                                    style: inputStyle,
                                    onchange: 'goInput',
                                    classes: 'oarn-control oarn-groupbox-control oarn-table-control'
                                };
                            }
                            else if (this.questions[j].fieldType == 'select') {
                                inputName = 'select_' + this.questions[j].fieldName;
                                input = {
                                    name: inputName,
                                    kind: 'oarn.DataSelect',
                                    onchange: 'goInput',
                                    style: inputStyle,
                                    classes: 'oarn-control oarn-groupbox-control oarn-table-control'
                                };
                            }
                            else if (this.questions[j].fieldType == 'selectWithOther') {
                                inputName = 'select_' + this.questions[j].fieldName;
                                input = {
                                    name: inputName,
                                    kind: 'oarn.DataSelect',
                                    onchange: 'goInput',
                                    style: inputStyle,
                                    classes: 'oarn-control oarn-groupbox-control oarn-table-control'
                                };
                                otherInput = {
                                    name: 'other_' + this.questions[j].fieldName,
                                    kind: 'enyo.Input',
                                    oninput: 'goInput',
                                    style: inputStyle,
                                    classes: 'oarn-control oarn-groupbox-control oarn-table-control',
                                    attributes: [{'maxlength': otherLength}]
                                };
                            }
                            else if (this.questions[j].fieldType == 'date') {
                                inputName = 'date_' + this.questions[j].fieldName;
                                input = {
                                    name: inputName,
                                    kind: 'oarn.DatePicker',
                                    style: inputStyle,
                                    onInput: 'goInput',
                                    width: this.questions[j].dateWidth,
                                    classes: 'oarn-control oarn-groupbox-control oarn-table-control',
                                    emptyIsValid: this.questions[j].emptyIsValid
                                };
                            }
						}

                        var label = {
                            name: 'lbl_' + this.questions[j].fieldName,
                            tag: 'label',
                            classes: 'oarn-control oarn-groupbox-control oarn-table-control',
                            content: this.questions[j].questionText,
                            attributes: [{'for': inputName}],
                            style: questionStyle
                        };

                        if (this.questions[j].questionClasses != undefined &&
                                this.questions[j].questionClasses != null) {
                            label.classes = label.classes + ' ' + this.questions[j].questionClasses;
                        }

                        var segment = null;
						if (this.questions[j].questionPosition == 'above') {
                            segment = {tag: 'td', attributes:[{'colspan':(colspan * 2)}], components: [
                                label, input
                            ]}
                            row.components.push(segment);
						}
                        else if (this.questions[j].questionPosition == 'inlineOneCell') {
                            label.classes = 'oarn-table-control';
                            input.classes = 'oarn-table-control';
                            row.components.push({
                                tag:'td', attributes:[{'colspan':colspan}], components: [
                                    label, input
                                ]
                            });
                        }
						else if (this.questions[j].questionPosition == 'questionOnly') {
							row.components.push({
								tag:'td', attributes:[{'colspan':colspan * 2}], components: [
									label
								]
							});
						}
						else { // 'inline' is the default
                            if (localColspan < colspan) {
                                row.components.push({tag: 'td', attributes:[{'colspan':(colspan)}],
                                    components: [label]});
                                row.components.push({tag: 'td', attributes:[{'colspan':(colspan)}],
                                    components: [input]});
                            }
                            else {
                                row.components.push({tag: 'td', components: [label]});
                                row.components.push({tag: 'td', components: [input]});
                            }
						}
					}
				}
				tableBody.components.push(row);
			}

			var assessment = this.$.assessmentDisplay.createComponent(tableBody, {owner: this});
			assessment.render();

            // now go through each field and if it's a select, add the list data
            if (!this.get('.currentOrgReadOnly')) {
                for (var i = 0; i < this.questions.length; i++) {
                    if (this.questions[i].fieldType == 'select' || this.questions[i].fieldType == 'selectWithOther') {
                        var fieldName = 'select_' + this.questions[i].fieldName;
                        var options = this.$.selectHelper.optionsLists[this.questions[i].dataSelectName + '_options_list'];
                        this.$[fieldName].options_list.empty();
                        this.$[fieldName].options_list.add(options);
                    }
                }
            }

            this.getData();
        },

        /**
         * @private
         */
        getData: function () {
            this.set('.api.method', 'GET');
            var ajax = this.api.getAjaxObject(this.get('.endpointBase') + this.get('.assessmentID') + '/');
            ajax.go();
            ajax.error(enyo.bindSafely(this, 'processError'));
            ajax.response(enyo.bindSafely(this, 'processResponse'));

            this.doAjaxStarted();
        },

        /**
         * @private
         * @param inRequest
         * @param inResponse
         */
        processResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.
            this.model = new enyo.Model(inResponse);

            var fieldNames = [];
            for (var i = 0; i < this.questions.length; i++) {
                if (this.questions[i].fieldType == 'text' || this.questions[i].fieldType == 'textarea') {
                    this.$['txt_' + this.questions[i].fieldName].setValue(inResponse[this.questions[i].fieldName]);
                }
                else if (this.questions[i].fieldType == 'checkbox') {
                    this.$['chk_' + this.questions[i].fieldName].setValue(inResponse[this.questions[i].fieldName]);
                }
                else if (this.questions[i].fieldType == 'select') {
                    var options = this.$.selectHelper.optionsLists[this.questions[i].dataSelectName + '_options_list'];

                    var item_index = 0;
                    var item_value = inResponse[this.questions[i].fieldName];
                    for (var oi = 0; oi < options.length; oi++){
                        if (options[oi]['value'] == item_value) {
                            item_index = oi;
                            break;
                        }
                    }

                    if (this.get('.currentOrgReadOnly')) {
                        this.$['select_' + this.questions[i].fieldName].setValue(options[item_index].display_text);
                    }
                    else {
                        this.$['select_' + this.questions[i].fieldName].selectedIndex = item_index;
                        this.$['select_' + this.questions[i].fieldName].options_list.empty();
                        this.$['select_' + this.questions[i].fieldName].options_list.add(options);
                    }

                }
                else if (this.questions[i].fieldType == 'selectWithOther') {
                    this.$['select_' + this.questions[i].fieldName].setValue(inResponse[this.questions[i].fieldName]);
                    this.$['txt_' + this.questions[i].otherFieldName].setValue(inResponse[this.questions[i].otherFieldName]);
                }
                else if (this.questions[i].fieldType == 'date') {
                    var valDate = null;
                    if (inResponse[this.questions[i].fieldName] != null) {
                        valDate = moment(inResponse[this.questions[i].fieldName],'YYYY-MM-DD').format('MM/DD/YYYY');
                    }
                    this.$['date_' + this.questions[i].fieldName].setValue(valDate);
                }
            }
        },

        /**
         * @private
         * @param inSender
         * @param inResponse
         * @returns {boolean}
         */
        processError: function (inSender, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            var status = inSender.xhrResponse.status;
            var detail = JSON.parse(inSender.xhrResponse.body);

            var detail_msg = '';
            for (var prop in detail) {
                if (detail.hasOwnProperty(prop)) {
                    detail_msg = prop + ': ' + detail[prop] + '<br>';
                }
            }

            this.$.popupFactory.showInfo('Database Communication Error', 'An error occurred while trying to ' +
                ' communicate with the server. ' +
                'Please provide the following information to your database administrator: ' +
                '<br><br>' + 'status: ' + status + '<br>' + detail_msg);

            this.set('.xhrResponse', inSender.xhrResponse);
            return true;
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        goInput: function (inSender, inEvent) {
            this.set('.dirty', true);

            // Set the autosave job in motion:
            this.lastChanged = new Date();
            this.$.saveButton.setSrc('static/assets/save-small.png');
            this.saveJob = this.startJob('SaveInput', enyo.bindSafely(this, 'goSaveChanges'),
                this.get('saveDelay'));
        },

        /**
         * In the read-only portions of the control, we want to prevent the user from changing
         * the state of the checkbox.
         *
         * @private
         * @param inSender
         * @param inEvent
         */
        frozenCheckboxChanged: function (inSender, inEvent) {
            inSender.setChecked(
                !inSender.getChecked()
            );
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        goSaveChanges: function (inSender, inEvent) {
            if (this.get('.dirty')) {
                var postBody = {};
                var error = false;
                var errorIndex = -1;

				for (var j = 0; j < this.staticPostFields.length; j++) {
					postBody[this.staticPostFields[j].fieldName] = this.staticPostFields[j].value;
				}

                for (var i = 0; i < this.questions.length; i++) {
                    if (this.questions[i].fieldType == 'text' || this.questions[i].fieldType == 'textarea') {
                        if (this.questions[i].required &&
                            (this.$['txt_' + this.questions[i].fieldName].getValue() == null ||
                             this.$['txt_' + this.questions[i].fieldName].getValue() == '')) {
                            error = true;
                            errorIndex = i;
                            break;
                        }
                        postBody[this.questions[i].fieldName] = this.$['txt_' + this.questions[i].fieldName].getValue();
                    }
                    if (this.questions[i].fieldType == 'select') {
                        if (this.questions[i].required &&
							(this.$['select_' + this.questions[i].fieldName].getValue() == '' ||
							 this.$['select_' + this.questions[i].fieldName].getValue() == null)) {
                            error = true;
                            errorIndex = i;
                            break;
                        }
                        postBody[this.questions[i].fieldName] = this.$['select_' + this.questions[i].fieldName].getValue();
                    }
                    if (this.questions[i].fieldType == 'selectWithOther') {
                        if (this.questions[i].required &&
                            this.$['select_' + this.questions[i].fieldName].getValue() == null) {
                            error = true;
                            errorIndex = i;
                            break;
                        }
                        postBody[this.questions[i].fieldName] = this.$['select_' + this.questions[i].fieldName].getValue();
                        postBody[this.questions[i].otherFieldName] = this.$['txt_' + this.questions[i].fieldName].getValue();
                    }
                    if (this.questions[i].fieldType == 'date') {
                        var postDate = null;
                        if (!Number.isNaN(Date.parse(this.$['date_' + this.questions[i].fieldName].getValue()))) {
                            var testDate = new Date(
                                this.$['date_' + this.questions[i].fieldName].getValue()).toISOString();
                            postDate = moment(testDate).format('YYYY-MM-DD');
                        }
                        else if (this.$['date_' + this.questions[i].fieldName].getValue() !== null) {
                            this.$.popupFactory.showInfo('Invalid Date',
                                this.questions[errorIndex].invalidText + ' is not a valid date.');
                            return;
                        }
                        if (postDate == null && this.questions[i].required) {
                            error = true;
                            errorIndex = i;
                            break;
                        }
                        postBody[this.questions[i].fieldName] = postDate;
                    }
                    if (this.questions[i].fieldType == 'checkbox') {
                        postBody[this.questions[i].fieldName] = this.$['chk_' + this.questions[i].fieldName].getValue();
                    }
                }

                if (inEvent != undefined &&
                    inEvent.originator.name == 'saveButton' &&
                    error) {
                    this.$.popupFactory.showInfo('Required Field Missing',
                        this.questions[errorIndex].requiredText + ' is required');
                    return;
                }
                else if (error) {
                    return;
                }

                postBody[this.get('.pkFieldName')] = this.get('.assessmentID');

                this.set('.api.token', this.get('.token'));
                this.set('.api.method', 'PATCH');
                var ajax = this.api.getAjaxObject(this.get('.endpointBase') + this.get('.assessmentID') + '/');
                ajax.postBody = postBody;

                this.doAjaxStarted();
                ajax.go();
                ajax.response(enyo.bindSafely(this, 'patchResponse'));
                ajax.error(enyo.bindSafely(this, 'processError'));
            }
        },

        /**
         * @private
         * @param inRequest
         * @param inResponse
         */
        patchResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            this.set('.dirty', false);
            this.set('.notesDirty', false);

            this.lastSaved = new Date();
            this.$.saveButton.setSrc('static/assets/save-gray-small.png');

            if (this.lastChanged < this.lastSaved) {
                if (this.get('showTimeStampTooltip')) {
                    var saveString = this.get('baseSaveString');
                    saveString += ' <em>(last saved: ' + this.lastSaved.toLocaleTimeString() + ')</em>';
                    this.$.saveTooltip.set('content', saveString);
                }

                this.stopJob('SaveInput');
            }
        },

        /**
         * @private
         * @param oldVal
         * @param newVal
         */
		maxWidthChanged: function (oldVal, newVal) {
			this.$.assessmentDisplay.applyStyle('max-width', this.get('.maxWidth'));
		},

        /**
         * @private
         * @param state
         */
		setDirty: function (state) {
			if (state) {
				this.set('.dirty', true);
			}
			else {
				this.$.saveButton.setSrc('static/assets/save-gray-small.png');
				this.stopJob('SaveInput');
				this.set('.dirty', false);
			}
		},

        /**
         * @private
         * @param inOldVal
         */
		dirtyChanged: function (inOldVal) {
			this.doDirtyStateChanged({'dirty': this.get('.dirty')});
		}
    });

})(enyo, this);

