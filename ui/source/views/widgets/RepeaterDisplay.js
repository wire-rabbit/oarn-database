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

    enyo.kind({
        name: 'oarn.RepeaterDisplay',

        changed_row_indices: [],

        published: {
            /**
             * The API auth token, bound to the widget by a parent control.
             *
             * @type {string}
             * @default null
             * @public
             */
            token: null,

            /**
             * The oarn API object, instantiated in create.
             *
             * @type {object}
             * @public
             */
            api: null,

            /**
             * The current user's username, bound by the parent.
             *
             * @type {string}
             * @public
             */
            username: 'unset',

            /**
             * An array of objects described as follows, with the order in the array indicating left-to-right position:
             * {
             *      fieldName: [the database field name],
             *      fieldType: [DatePicker | DataSelect | TextBox | NumberSelect | SelectNotes],
             *      dataSelectName: [for DataSelect fieldType only, the name of the endpoint helper],
             *      nested_id_name: optional - it's used when the endpoint returns a select value ID as an object with an ID field inside
             *      readOnly: [true|false],
             *      headerText: [text for the header row],
             *      labelText: [will be used in the new record popup],
             *      allowNewRecords: [true | false],
             *      hasSelectButton: [true | false],
             *      postBodyOnly: [true | false] <= no field generated, just kept in the collection for patch calls,
             *      primaryKey: [true | false]
             *      validator: a function that must return true with the current value for a save to occur
             * }
             *
             */
            fields: [],

            staticPostFields: [], // fields like: {fieldName: 'family_id', value: 123}

            hasSimpleSelectButton: false, // if true, each row will include a select button that fires onRowSelected
            hasNotesSelectButton: false,

            allowsNewRecords: true,

            deleteMessage: 'Clicking \'Yes\' will permanently delete this record and ' +
                'cannot be undone. Continue anyway?',

            selectEndpoints: [], // endpoints for the SelectHelper,
            endpoint: '', // for GET requests
            patchEndpoint: '', // for PATCH requests
            postEndpoint: '', // for POST requests

            groupboxHeaderText: 'Header Unset',
            newRecordHeaderText: 'New Record Header Unset',
            newTooltipText: 'Create a new record',
            baseSaveString: 'Click to save.',

            /**
             * Sets the number of milliseconds before each autosave.
             *
             * @type {number}
             * @default 15000
             * @public
             */
            saveDelay: 15000,

            showTimeStampTooltip: true,

            maxWidth: 750, // the max-width pixels of the groupbox

            /**
             * Enyo's treatment of dropdowns in cases where a value is rolled back 
             * is buggy in 2.5.1. In those cases, setting this to true will use
             * custom DataSelect get/set methods when saving.
             *
             * @type {boolean}
             * @default false
             * @public 
             */
            altSelectSave: false // use custom DataSelect get/set methods rather than Enyo's
        },

        saveJob: null, // the timer for the autosave action

        events: {
            onAjaxError: '',
            onAjaxStarted: '',
            onAjaxFinished: '',
            onDirtyStateChanged: '',
            onRowSelected: '',
			onRowDeleted: '',
            onChangeAlert: '',
            onRepeaterRendered: '',
            onRepeaterDebug: '',
            onNewRecordCreated: ''
        },

        handlers: {
            onSelectListsAcquired: 'selectListsAcquiredHandler',
            onPopupClosed: 'popupClosedHandler'
        },

        components: [
            {name: 'mainGroupbox', kind: 'onyx.Groupbox', components: [
                {kind: 'onyx.GroupboxHeader', name: 'header', components: [
                    {name: 'headerText', classes: 'oarn-header', tag:'span'},
                    {kind: 'onyx.TooltipDecorator',
                        style: 'display: inline; float:right', components: [
                        {name: 'saveButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
                            src: 'static/assets/save-gray-small.png',
                            ontap: 'goSaveChanges'},
                        {name: 'saveTooltip', kind: 'onyx.Tooltip',
                            classes: 'oarn-tooltip', allowHtml: true}
                    ]},
                    {kind: 'onyx.TooltipDecorator', style: 'display: inline; float:right', components: [
                        {name: 'newButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
                            src: 'static/assets/blue-add.png', ontap: 'goNewRecord'},
                        {name: 'newTooltip', kind: 'onyx.Tooltip', classes: 'oarn-tooltip'}
                    ]}
                ]},
                {name: 'noResultsRow', content: 'No Records Found',
                    classes: 'oarn-no-results-text'},
                {name: 'repeaterScroller', kind: 'Scroller', horizontal: 'hidden',
                    maxHeight:'300px'}]
            },

            {name: 'notesGroupbox', showing: false, kind: 'onyx.Groupbox',
                style: 'width: 600px; padding-top:5px', components: [
                {kind: 'onyx.GroupboxHeader', components: [
                    {name: 'notesHeader', tag: 'span', classes: 'oarn-header'},
                    {kind: 'onyx.TooltipDecorator',	style: 'display: inline; float: right', components: [
                        {name: 'timestampButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
                            src: 'static/assets/clock-small.png', ontap: 'goTimestamp'},
                        {kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
                            content: 'Click to add a timestamp to the notes'}
                    ]},
                ]},
                {kind: 'onyx.InputDecorator', components: [
                    {name: 'notes', kind: 'onyx.TextArea', style: 'width:100%; height:250px;', placeholder: '',
                        oninput: 'goInput', classes: 'oarn-control'}
                ]}
            ]},

            {name: 'selectHelper', kind: 'oarn.SelectHelper'},
            {name: 'popupFactory', kind: 'oarn.PopupFactory'}
        ],

        bindings: [
            {from: '.token', to: '.api.token'},
            {from: '.token', to: '.selectHelper.token'}
        ],

        create: function () {
            this.inherited(arguments);
            this.api = new oarn.API();

            this.$.headerText.setContent(this.get('.groupboxHeaderText'));
            this.$.saveTooltip.setContent(this.get('.baseSaveString'));
            this.$.newTooltip.setContent(this.get('.newTooltipText'));
        },

        rendered: function () {
            this.inherited(arguments);

            this.$.mainGroupbox.applyStyle('max-width', this.get('.maxWidth') + 'px');
        },

        createRepeater: function () {
            if (!this.allowsNewRecords) {
                this.$.newButton.hide();
            }

            if (this.selectEndpoints.length > 0) {
                this.$.selectHelper.set('endpoints', this.get('.selectEndpoints'));
                this.$.selectHelper.loadSelectData();
            }
            else {
                this.refreshData();
            }
        },

        selectListsAcquiredHandler: function (inSender, inEvent) {
            this.refreshData();
        },

        refreshData: function () {
            this.set('.api.method', 'GET');
            var ajax = this.api.getAjaxObject(this.get('.endpoint'));
            ajax.go();
            ajax.error(enyo.bindSafely(this, 'processError'));
            ajax.response(enyo.bindSafely(this, 'processResponse'));

            this.doAjaxStarted();
        },

        processResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            var details = [];
            for (var i = 0; i < inResponse['results'].length; i++) {
                var detail = {};
                for (var j = 0; j < this.fields.length; j++) {
                    detail[this.fields[j]['fieldName']] = inResponse['results'][i][this.fields[j]['fieldName']];
                }
                if (inResponse['results'][i].hasOwnProperty('read_only')) {
                    detail['read_only'] = inResponse['results'][i]['read_only'];
                }
                details.push(detail);
            }

            if (this.collection == null) {
                this.collection = new enyo.Collection();
            }
            else {
                this.collection.empty();
            }
            this.collection.add(details);

            if (this.collection.length > 0) {
                this.$.noResultsRow.hide();
            }
            else {
                this.$.noResultsRow.show();
            }

            if (!this.firstRunComplete) {
                this.createRepeaterComponents();
            }
            else {
                this.$.repeater.setCount(this.collection.length);
            }

            if (this.refreshMode === 'newRecordCreated') {
                this.refreshMode = ''; // reset the mode so that in other contexts new record events aren't triggered
                this.doNewRecordCreated(); // trigger parent responses to new record creation.
            }
        },

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

        createRepeaterComponents: function () {
            // generate header row:
            var headerComponents = [];

            if (this.hasSimpleSelectButton || this.hasNotesSelectButton) {
                headerComponents.push({
                    tag: 'td',
                    style: 'width: 75px; display: inline-block; padding-right:5px',
                    allowHtml: true,
                    content: '&nbsp;'
                });
            }
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].postBodyOnly) {
                    continue;
                }
                var item_width = this.fields[i].fieldWidth;

                if (this.fields[i].fieldType == 'TextBox' || this.fields[i].fieldType == 'DatePicker' ||
                    this.fields[i].fieldType == 'DataSelect' || this.fields[i].fieldType == 'Checkbox' ||
                    this.fields[i].fieldType == 'NumberSelect') {
                    headerComponents.push({
                        tag: 'td',
                        style: 'width: ' + item_width + 'px; display: inline-block',
                        content: this.fields[i].headerText,
                        classes: 'oarn-groupbox-td-header'
                    });
                }
            }

            // generate controls:
            var generatedComponents = [];

            if (this.hasSimpleSelectButton || this.hasNotesSelectButton) {
                generatedComponents.push({
                    tag: 'td',
                    style: 'width: 75px; display: inline-block;margin-right:10px;',
                    components: [
                        {
                            kind: 'onyx.Button',
                            content: 'Select',
                            classes: 'onyx-dark',
                            ontap: 'rowSelected'
                        }
                    ]
                });
            }

            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].fieldType == 'TextBox') {
                    generatedComponents.push({
                        tag: 'td',
                        style: 'width: ' + this.fields[i].fieldWidth + 'px; display: inline-block',
                        components: [
                            {
                                name: 'txt_' + this.fields[i].fieldName,
                                kind: 'enyo.Input',
                                classes: 'oarn-control oarn-groupbox-control',
                                oninput: 'goInput',
                                style: 'width: 95%'
                            },
                            {
                                name: 'lbl_' + this.fields[i].fieldName,
                                kind: 'enyo.Input',
                                classes: 'oarn-control oarn-groupbox-control',
                                style: 'width: 95%',
                                disabled: true,
                                showing: false
                            }
                        ]
                    });
                }
                else if (this.fields[i].fieldType == 'NumberSelect') {
                    generatedComponents.push({
                        tag: 'td',
                        style: 'width: ' + this.fields[i].fieldWidth + 'px; display: inline-block',
                        components: [
                            {
                                name: 'txt_' + this.fields[i].fieldName,
                                kind: 'enyo.Input',
                                classes: 'oarn-control oarn-groupbox-control',
                                attributes: [{'type': 'number'},
                                    {'min': 0}, {'max': 1440}],
                                oninput: 'goInput',
                                style: 'width: 95%'
                            },
                            {
                                name: 'lbl_' + this.fields[i].fieldName,
                                kind: 'enyo.Input',
                                classes: 'oarn-control oarn-groupbox-control',
                                style: 'width: 95%',
                                disabled: true,
                                showing: false
                            }
                        ]
                    });
                }
                else if (this.fields[i].fieldType == 'Checkbox') {
                    generatedComponents.push({
                        tag: 'td',
                        style: 'width: ' + this.fields[i].fieldWidth + 'px; display: inline-block',
                        components: [
                            {
                                name: 'chk_' + this.fields[i].fieldName,
                                kind: 'enyo.Checkbox',
                                classes: 'oarn-control oarn-groupbox-control',
                                onchange: 'goInput'
                            },
                            {
                                name: 'lbl_' + this.fields[i].fieldName,
                                kind: 'enyo.Checkbox',
                                classes: 'oarn-control oarn-groupbox-control',
                                onchange: 'frozenCheckboxChanged',
                                showing: false
                            }
                        ]
                    });
                }
                else if (this.fields[i].fieldType == 'DatePicker') {
                    generatedComponents.push({
                        tag: 'td',
                        style: 'width: ' + this.fields[i].fieldWidth + 'px; display: inline-block',
                        components: [
                            {
                                name: 'date_' + this.fields[i].fieldName,
                                kind: 'oarn.DatePicker',
                                width: '95%',
                                classes: 'oarn-control',
                                oninput: 'goInput',
                                onInput: 'goInput',
                                emptyIsValid: this.fields[i].emptyIsValid
                            },
                            {
                                name: 'lbl_' + this.fields[i].fieldName,
                                kind: 'enyo.Input',
                                attributes: [{'readonly': true}],
                                style: 'width: 95%',
                                showing: false
                            },
                        ]
                    });
                }
                else if (this.fields[i].fieldType == 'DataSelect') {
                    generatedComponents.push({
                        tag: 'td',
                        style: 'width: ' + this.fields[i].fieldWidth + 'px; display: inline-block',
                        components: [
                            {
                                name: 'select_' + this.fields[i].fieldName,
                                kind: 'oarn.DataSelect',
                                classes: 'oarn-control oarn-groupbox-control',
                                onchange: 'goInput',
                                style: 'width: 95%'
                            },
                            {
                                name: 'lbl_' + this.fields[i].fieldName,
                                kind: 'enyo.Input',
                                classes: 'oarn-control oarn-groupbox-control',
                                style: 'width: 95%',
                                disabled: true,
                                showing: false
                            },
                            {
                                name: 'hidden_' + this.fields[i].fieldName,
                                kind: 'enyo.Input',
                                type: 'hidden'
                            }
                        ]
                    });
                }
            }

            generatedComponents.push(
                {tag: 'td', style: 'width: 30px; display: inline-block', components: [
                    {name: 'deleteButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
                        src: 'static/assets/blue-delete.png', ontap: 'goDelete'}
                ]}
            );

            var repeater = {
                name: 'repeater',
                kind: 'enyo.Repeater',
                multiSelect: false,
                onSetupItem: 'setupItem',
                components: [
                    {
                        name: 'itemWrapper',
                        tag: 'table',
                        style: 'width: 100%; border: 1px solid darkgray; border-collapse: collapse;',
                        classes: 'oarn-control',
                        components: [
                            {
                                name: 'headerRow',
                                style: 'border-bottom-style: 1px solid darkgray',
                                tag: 'tr',
                                components: headerComponents
                            },
                            {
                                name: 'itemRow',
                                tag: 'tr',
                                components: generatedComponents
                            }
                        ]
                    }
                ]
            };

            if (this.collection.length > 0) {
                this.$.noResultsRow.hide();
            }
            else {
                this.$.noResultsRow.show();
            }


            this.$.repeaterScroller.createComponent(
                repeater,
                {owner: this}
            );
            this.$.repeaterScroller.render();

            this.$.repeater.setCount(this.collection.length);

            // New record creation:
            if (this.allowsNewRecords) {
                var rows = [];

                for (var i = 0; i < this.fields.length; i++) {
                    var row = {};
                    if (!this.fields[i].readOnly) {
                        if (this.fields[i].fieldType == 'TextBox') {
                            row = {
                                tag: 'tr', components: [
                                    {tag: 'td',
                                        components: [
                                            {
                                                tag: 'label',
                                                content: this.fields[i].labelText,
                                                classes: 'oarn-control oarn-groupbox-control',
                                                attributes: [{'for': ('new_txt_' + this.fields[i].fieldName)}]}
                                        ]
                                    },
                                    {tag: 'td',
                                        components: [
                                            {
                                                name: ('new_txt_' + this.fields[i].fieldName),
                                                kind: 'enyo.Input',
                                                stlye: 'width: 95%',
                                                classes: 'oarn-control'
                                            }
                                        ]},
                                ]};
                        }
                        else if (this.fields[i].fieldType == 'NumberSelect') {
                            row = {
                                tag: 'tr', components: [
                                    {tag: 'td',
                                        components: [
                                            {
                                                tag: 'label',
                                                content: this.fields[i].labelText,
                                                classes: 'oarn-control oarn-groupbox-control',
                                                attributes: [{'for': ('new_txt_' + this.fields[i].fieldName)}]}
                                        ]
                                    },
                                    {tag: 'td',
                                        components: [
                                            {
                                                name: ('new_txt_' + this.fields[i].fieldName),
                                                kind: 'enyo.Input',
                                                stlye: 'width: 95%',
                                                classes: 'oarn-control',
                                                attributes: [{'type': 'number'},
                                                    {'min': 0}, {'max': 1440}]
                                            }
                                        ]},
                                ]};
                        }
                        else if (this.fields[i].fieldType == 'Checkbox') {
                            row = {
                                tag: 'tr', components: [
                                    {tag: 'td',
                                        components: [
                                            {
                                                tag: 'label',
                                                content: this.fields[i].labelText,
                                                classes: 'oarn-control oarn-groupbox-control',
                                                attributes: [{'for': ('new_chk_' + this.fields[i].fieldName)}]
                                            }
                                        ]
                                    },
                                    {
                                        tag: 'td',
                                        components: [
                                            {
                                                name: ('new_chk_' + this.fields[i].fieldName),
                                                kind: 'enyo.Checkbox',
                                                classes: 'oarn-control'
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                        else if (this.fields[i].fieldType == 'DatePicker') {
                            row = {
                                tag: 'tr', components: [
                                    {tag: 'td',
                                        components: [
                                            {
                                                tag: 'label',
                                                content: this.fields[i].labelText,
                                                classes: 'oarn-control oarn-groupbox-control',
                                                attributes: [{'for': ('new_date_' + this.fields[i].fieldName)}]}
                                        ]
                                    },
                                    {tag: 'td',
                                        components: [
                                            {
                                                name: ('new_date_' + this.fields[i].fieldName),
                                                kind: 'oarn.DatePicker',
                                                width: '95%',
                                                classes: 'oarn-control',
                                                onSelect: 'goInput',
                                                emptyIsValid: this.fields[i].emptyIsValid
                                            }
                                        ]},
                                ]};
                        }

                        else if (this.fields[i].fieldType == 'DataSelect') {
                            row = {
                                tag: 'tr', components: [
                                {tag: 'td',
                                    components: [
                                    {
                                        tag: 'label',
                                        content: this.fields[i].labelText,
                                        classes: 'oarn-control oarn-groupbox-control',
                                        attributes: [{'for': 'new_select_' + this.fields[i].fieldName}
                                        ]}
                                ]},
                                {tag: 'td',
                                    components: [
                                    {
                                        name: 'new_select_' + this.fields[i].fieldName,
                                        kind: 'oarn.DataSelect',
                                        classes: 'oarn-control oarn-groupbox-control',
                                        style: 'width: 95%'
                                    }
                                ]},
                            ]}
                        }

                        rows.push(row);
                    }
                }

                var buttonsRow = {name: 'buttonsRow', style: 'text-align: center; padding-top:5px',
                    components: [
                        {name: 'btnClose', kind: 'onyx.Button', content: 'Close',
                            style: 'margin: 5px 5px 5px 5px',	ontap: 'closeNewRecord'},
                        {name: 'btnSave', kind: 'onyx.Button', content: 'Create Record',
                            ontap: 'saveNewRecord', style: 'margin: 5px 5px 5px 5px',
                            classes: 'onyx-affirmative'}
                    ]};

                var newRecordPopup = {
                    name: 'newRecordPopup',
                    kind: 'onyx.Popup',
                    autoDismiss: false,
                    modal: true,
                    centered: true,
                    scrim: true,
                    floating: true,
                    style: 'background-color: #EAEAEA',
                    components: [
                        {
                            kind: 'onyx.Groupbox', components: [
                            {
                                kind: 'onyx.GroupboxHeader',
                                content: this.get('.newRecordHeaderText')
                            },
                            {
                                name: 'newRecordTable',
                                tag: 'table',
                                components: rows
                            },
                            buttonsRow
                        ]}
                    ]
                };

                this.createComponent(newRecordPopup, {owner: this});
                this.$.newRecordPopup.render();

                for (var i = 0; i < this.fields.length; i++) {
                    if (this.fields[i].fieldType == 'DataSelect') {
                        this.$['new_select_' + this.fields[i].fieldName].options_list.empty();
                        this.$['new_select_' + this.fields[i].fieldName].options_list.add(
                            this.$.selectHelper.optionsLists[this.fields[i].dataSelectName + '_options_list']
                        );
                    }
                }
            }

            this.firstRunComplete = true;
        },

        setupItem: function (inSender, inEvent) {
            var item = inEvent.item;

            if (this.collection.at(inEvent.index).get('read_only')) {
                item.$.deleteButton.hide();
                for (var i = 0; i < this.fields.length; i++) {
                    if (this.fields[i].postBodyOnly) {
                        continue;
                    }

                    if (this.fields[i].fieldType == 'TextBox') {
                        item.$['txt_' + this.fields[i].fieldName].hide();
                        item.$['lbl_' + this.fields[i].fieldName].show();
                        item.$['lbl_' + this.fields[i].fieldName].setValue(
                            this.collection.at(inEvent.index).get(this.fields[i].fieldName)
                        );
                    }
                    else if (this.fields[i].fieldType == 'NumberSelect') {
                        item.$['txt_' + this.fields[i].fieldName].hide();
                        item.$['lbl_' + this.fields[i].fieldName].show();
                        item.$['lbl_' + this.fields[i].fieldName].setValue(
                            this.collection.at(inEvent.index).get(this.fields[i].fieldName)
                        );
                    }
                    else if (this.fields[i].fieldType == 'Checkbox') {
                        item.$['chk_' + this.fields[i].fieldName].hide();
                        item.$['lbl_' + this.fields[i].fieldName].show();
                        item.$['lbl_' + this.fields[i].fieldName].setChecked(
                            this.collection.at(inEvent.index).get(this.fields[i].fieldName)
                        );
                    }
                    else if (this.fields[i].fieldType == 'DatePicker') {
                        item.$['date_' + this.fields[i].fieldName].hide();
                        item.$['lbl_' + this.fields[i].fieldName].show();

                        var testDate = null;
                        if (this.collection.at(inEvent.index).get(this.fields[i].fieldName) != null) {
                            testDate = moment(this.collection.at(inEvent.index).get(
                                this.fields[i].fieldName),'YYYY-MM-DD').format('MM/DD/YYYY');
                        }

                        item.$['lbl_' + this.fields[i].fieldName].setValue(testDate);
                    }
                    else if (this.fields[i].fieldType == 'DataSelect') {
                        item.$['select_' + this.fields[i].fieldName].hide();
                        item.$['lbl_' + this.fields[i].fieldName].show();

                        var options = this.$.selectHelper.optionsLists[this.fields[i].dataSelectName + '_options_list'];

                        var item_index = 0;
                        var item_value = this.collection.at(inEvent.index).get(this.fields[i].fieldName);
                        for (var oi = 0; oi < options.length; oi++){
                            if (options[oi]['value'] == item_value) {
                                item_index = oi;
                                break;
                            }
                        }

                        item.$['lbl_' + this.fields[i].fieldName].setValue(options[item_index].display_text);
                    }
                }
            }
            else { // read-write:
                item.$.deleteButton.show();
                for (var i = 0; i < this.fields.length; i++) {
                    if (this.fields[i].postBodyOnly) {
                        continue;
                    }

                    if (this.fields[i].fieldType == 'TextBox') {
                        if (this.fields[i].readOnly) {
                            item.$['txt_' + this.fields[i].fieldName].hide();
                            item.$['lbl_' + this.fields[i].fieldName].show();
                            item.$['lbl_' + this.fields[i].fieldName].setValue(
                                this.collection.at(inEvent.index).get(this.fields[i].fieldName)
                            );
                        } else {
                            item.$['txt_' + this.fields[i].fieldName].show();
                            item.$['lbl_' + this.fields[i].fieldName].hide();
                            item.$['txt_' + this.fields[i].fieldName].setValue(
                                this.collection.at(inEvent.index).get(this.fields[i].fieldName)
                            );
                        }
                    }
                    else if (this.fields[i].fieldType == 'NumberSelect') {
                        if (this.fields[i].readOnly) {
                            item.$['txt_' + this.fields[i].fieldName].hide();
                            item.$['lbl_' + this.fields[i].fieldName].show();
                            item.$['lbl_' + this.fields[i].fieldName].setValue(
                                this.collection.at(inEvent.index).get(this.fields[i].fieldName)
                            );
                        } else {
                            item.$['txt_' + this.fields[i].fieldName].show();
                            item.$['lbl_' + this.fields[i].fieldName].hide();
                            item.$['txt_' + this.fields[i].fieldName].setValue(
                                this.collection.at(inEvent.index).get(this.fields[i].fieldName)
                            );
                        }
                    }
                    else if (this.fields[i].fieldType == 'Checkbox') {
                        if (this.fields[i].readOnly) {
                            item.$['chk_' + this.fields[i].fieldName].hide();
                            item.$['lbl_' + this.fields[i].fieldName].show();
                            item.$['lbl_' + this.fields[i].fieldName].setChecked(
                                this.collection.at(inEvent.index).get(this.fields[i].fieldName)
                            );
                        }
                        else {
                            item.$['chk_' + this.fields[i].fieldName].show();
                            item.$['lbl_' + this.fields[i].fieldName].hide();
                            item.$['chk_' + this.fields[i].fieldName].setChecked(
                                this.collection.at(inEvent.index).get(this.fields[i].fieldName)
                            );
                        }
                    }
                    else if (this.fields[i].fieldType == 'DatePicker') {
                        if (this.fields[i].readOnly) {
                            item.$['date_' + this.fields[i].fieldName].hide();
                            item.$['lbl_' + this.fields[i].fieldName].show();

                            var testDate = null;
                            if (this.collection.at(inEvent.index).get(this.fields[i].fieldName) != null) {
                                testDate = moment(this.collection.at(inEvent.index).get(
                                    this.fields[i].fieldName),'YYYY-MM-DD').format('MM/DD/YYYY');
                            }

                            item.$['lbl_' + this.fields[i].fieldName].setValue(testDate);
                        } else {
                            item.$['date_' + this.fields[i].fieldName].show();
                            item.$['lbl_' + this.fields[i].fieldName].hide();

                            var testDate = null;
                            if (this.collection.at(inEvent.index).get(this.fields[i].fieldName) != null) {
                                testDate = moment(this.collection.at(inEvent.index).get(
                                    this.fields[i].fieldName),'YYYY-MM-DD').format('MM/DD/YYYY');
                            }

                            item.$['date_' + this.fields[i].fieldName].setValue(testDate);
                        }
                    }
                    else if (this.fields[i].fieldType == 'DataSelect') {
                        if (this.fields[i].readOnly) {
                            item.$['select_' + this.fields[i].fieldName].hide();
                            item.$['lbl_' + this.fields[i].fieldName].show();

                            var options = this.$.selectHelper.optionsLists[this.fields[i].dataSelectName + '_options_list'];

                            var item_index = 0;
                            var item_value = this.collection.at(inEvent.index).get(this.fields[i].fieldName);

                            item.$['hidden_' + this.fields[i].fieldName].setValue(item_value);

                            for (var oi = 0; oi < options.length; oi++){
                                if (options[oi]['value'] == item_value) {
                                    item_index = oi;
                                    break;
                                }
                            }

                            item.$['lbl_' + this.fields[i].fieldName].setValue(options[item_index].display_text);
                        } else {
                            item.$['select_' + this.fields[i].fieldName].show();
                            item.$['lbl_' + this.fields[i].fieldName].hide();

                            var options = this.$.selectHelper.optionsLists[this.fields[i].dataSelectName + '_options_list'];
                            var item_index = 0;
                            var item_value = this.collection.at(inEvent.index).get(this.fields[i].fieldName);

                            if (typeof item_value === "object" && this.fields[i].nested_id_name !== undefined) {
                                item_value = item_value[this.fields[i].nested_id_name];
                            }

                            for (var oi = 0; oi < options.length; oi++){
                                if (options[oi]['value'] == item_value) {
                                    item_index = oi;
                                }
                            }

                            item.$['select_' + this.fields[i].fieldName].selectedIndex = item_index;
                            item.$['select_' + this.fields[i].fieldName].options_list.empty();
                            item.$['select_' + this.fields[i].fieldName].options_list.add(options);
                        }
                    }
                }
            }

            if (inEvent.index == 0) {
                item.$.headerRow.show();
            }
            else {
                item.$.headerRow.hide();
            }

            if (inEvent.index == (this.collection.length - 1)) {
                this.doRepeaterRendered(); // alert parent that the repeater has finished being drawn.
            }
            return true;
        },

        groupboxHeaderTextChanged: function (inOldVal) {
            this.$.headerText.setContent(this.get('.groupboxHeaderText'));
        },

        newTooltipTextChanged: function (inOldVal) {
            this.$.newTooltip.setContent(this.get('.newTooltipText'));
        },

        dirtyChanged: function (inOldVal) {
            this.doDirtyStateChanged({'dirty': this.get('.dirty')});
        },

        goInput: function (inSender, inEvent) {
            if (inEvent.index != undefined) {
                var item = this.$.repeater.itemAtIndex(inEvent.index);

                var inputFieldName = '';
                if (inEvent.originator.name.indexOf('txt_') == 0) {
                    inputFieldName = inEvent.originator.name.substring(4, inEvent.originator.name.length);
                }
                else if (inEvent.originator.name.indexOf('chk_') == 0) {
                    inputFieldName = inEvent.originator.name.substring(4, inEvent.originator.name.length);
                }
                else if (inEvent.originator.name.indexOf('date_') == 0) {
                    inputFieldName = inEvent.originator.name.substring(5, inEvent.originator.name.length);
                }
                else if (inEvent.originator.name.indexOf('select_') == 0) {
                    inputFieldName = inEvent.originator.name.substring(7, inEvent.originator.name.length);
                }

                for (var i = 0; i < this.fields.length; i++) {
                    if (this.fields[i].fieldName == inputFieldName && this.fields[i].alertOnChange) {
                        this.doChangeAlert({
                            model: this.collection.at(inEvent.index),
                            fieldName: inputFieldName,
                            index: inEvent.index,
                            control: inEvent.originator // So the handler can maniuplate the form field
                        });
                    }
                }

                if (inEvent.originator.name.indexOf('txt_') == 0) {
                    this.collection.at(inEvent.index).set(inputFieldName,
                        item.$[inEvent.originator.name].getValue());
                }
                else if (inEvent.originator.name.indexOf('chk_') == 0) {
                    this.collection.at(inEvent.index).set(inputFieldName,
                        item.$[inEvent.originator.name].getChecked());
                }
                else if (inEvent.originator.name.indexOf('date_') == 0) {
                    var testDate = null;
                    if (this.collection.at(inEvent.index).get(inputFieldName) != null) {
                        testDate = moment(item.$[inEvent.originator.name].getValue(),
                            'MM/DD/YYYY').format('YYYY-MM-DD');
                    }
                    this.collection.at(inEvent.index).set(inputFieldName, testDate);

                }
                else if (inEvent.originator.name.indexOf('select_') == 0) {
                    this.collection.at(inEvent.index).set(inputFieldName,
                        item.$[inEvent.originator.name].getValue());
                }

                if (this.changed_row_indices.indexOf(inEvent.index) == -1) {
                    this.changed_row_indices.push(inEvent.index);
                }
            }


            if (inEvent.originator.name == 'notes') {
                this.set('.notesDirty', true);
            }

            this.set('.dirty', true);

            // Set the autosave job in motion:
            this.lastChanged = new Date();
            this.$.saveButton.setSrc('static/assets/save-small.png');
            this.saveJob = this.startJob('SaveInput', enyo.bindSafely(this, 'goSaveChanges'),
                this.get('saveDelay'));

            return true; // stop propagation of the event
        },

        goSaveChanges: function (inSender, inEvent) {
            if (this.pauseSave === true) {
                return; 
            }
            if (this.get('.dirty')) {
                if (this.changed_row_indices.length > 0 || this.notesDirty) {
                    if (this.changed_row_indices.indexOf(this.notesIndex) == -1 && this.notesIndex >= 0) {
                        this.changed_row_indices.push(this.notesIndex);
                    }

                    for (var i = 0; i < this.changed_row_indices.length; i++) {
                        var postBody = {};
                        if (this.changed_row_indices[i] == this.get('.notesIndex')) {
                            var notesFieldName = '';
                            for (var j = 0; j < this.fields.length; j++) {
                                if (this.fields[j].fieldType == 'SelectNotes') {
                                    notesFieldName = this.fields[j].fieldName;
                                    break;
                                }
                            }
                            if (notesFieldName != '') {
                                postBody[notesFieldName] = this.$.notes.getValue();
                                this.notesScratchPad = {
                                    value: this.$.notes.getValue(),
                                    index: this.get('.notesIndex'),
                                    fieldName: notesFieldName
                                };
                            }
                        }

                        var item = this.$.repeater.itemAtIndex(this.changed_row_indices[i]);
                        if (typeof item === 'undefined') {
                            this.doRepeaterDebug({changed_row_index: i});
                        }

                        if (item) {
                            for (var j = 0; j < this.fields.length; j++) {
                                if (this.fields[j].fieldType == 'TextBox' || this.fields[j].fieldType == 'NumberSelect') {
                                    if (this.fields[j].validator != undefined) {
                                        if (!this.fields[j].validator(item.$['txt_' +
                                            this.fields[j].fieldName].getValue())) {
                                            item.$['txt_' + this.fields[j].fieldName].addClass('oarn-invalid-input');
                                            return;
                                        }
                                        else {
                                            item.$['txt_' + this.fields[j].fieldName].removeClass('oarn-invalid-input');
                                            postBody[this.fields[j].fieldName] = item.$['txt_' + this.fields[j].fieldName].getValue();
                                        }
                                    }
                                    else {
                                        postBody[this.fields[j].fieldName] = item.$['txt_' +
                                            this.fields[j].fieldName].getValue();
                                    }

                                }
                                else if (this.fields[j].fieldType == 'Checkbox') {
                                    postBody[this.fields[j].fieldName] =
                                        item.$['chk_' + this.fields[j].fieldName].getChecked();
                                }
                                else if (this.fields[j].fieldType == 'DataSelect') {
                                    if (!this.fields[j].readOnly) {
                                        if (!this.altSelectSave) {
                                            if (typeof item !== 'undefined') {
                                                postBody[this.fields[j].fieldName] =
                                                item.$['select_' + this.fields[j].fieldName].getValue();
                                            } 
                                        } else {
                                            postBody[this.fields[j].fieldName] =
                                                item.$['select_' + this.fields[j].fieldName].getSelectedItem();
                                        }
                                    }
                                    else {
                                        postBody[this.fields[j].fieldName] = item.$['hidden_' + this.fields[j].fieldName].getValue();
                                    }
                                }
                                else if (this.fields[j].fieldType == 'DatePicker') {
                                    var postDate = null;
                                    if (!Number.isNaN(Date.parse(item.$['date_' + this.fields[j].fieldName].getValue()))) {
                                        var testDate = new Date(
                                            item.$['date_' + this.fields[j].fieldName].getValue()).toISOString();
                                        postDate = moment(testDate).format('YYYY-MM-DD');
                                    }
                                    if (!this.fields[j].emptyIsValid && postDate == null) {
                                        return;
                                    }

                                    postBody[this.fields[j].fieldName] = postDate;
                                }
                                else if (this.fields[j].postBodyOnly) {
                                    if (typeof this.collection.at(this.changed_row_indices[i]) !== 'undefined') {
                                        postBody[this.fields[j].fieldName] =
                                        this.collection.at(this.changed_row_indices[i]).get(this.fields[j].fieldName);
                                    } 
                                }
                            }

                            for (var j = 0; j < this.staticPostFields.length; j++) {
                                postBody[this.staticPostFields[j].fieldName] = this.staticPostFields[j].value;
                            }

                            var pkFieldName = '';
                            for (var p = 0; p < this.fields.length; p++) {
                                if (this.fields[p].primaryKey) {
                                    pkFieldName = this.fields[p].fieldName;
                                }
                            }

                            var pk = this.collection.at(this.changed_row_indices[i]).get(pkFieldName);

                            this.set('.api.token', this.get('.token'));
                            this.set('.api.method', 'PATCH');
                            var endpoint = this.get('.patchEndpoint') + pk + '/';
                            var ajax = this.api.getAjaxObject(endpoint);
                            ajax.postBody = postBody;
                            this.postBody = postBody;

                            this.doAjaxStarted();
                            ajax.go();
                            ajax.response(enyo.bindSafely(this, 'patchResponse'));
                            ajax.error(enyo.bindSafely(this, 'processError'));

                        } // end for loop
                    }
                }
            }
            return true; // stop propagation of the event.
        },

        patchResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            this.set('.dirty', false);
            this.set('.notesDirty', false);
            this.changed_row_indices = [];

            if (this.notesScratchPad != null) {
                this.collection.at(this.notesScratchPad.index).set(
                    this.notesScratchPad.fieldName,
                    this.notesScratchPad.value);
            }
            this.notesScratchPad = null;

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

        rowSelected: function (inSender, inEvent) {
            var index = 0;
            while (this.$.repeater.itemAtIndex(index) != undefined) {
                this.$.repeater.itemAtIndex(index).$.itemRow.removeClass('oarn-selected-row');
                index++;
            }

            this.$.repeater.itemAtIndex(inEvent.index).$.itemRow.addClass('oarn-selected-row');

            if (this.hasSimpleSelectButton) {
                // get primary key value:
                var pk = -1;
                for (var i = 0; i < this.fields.length; i++) {
                    if (this.fields[i].primaryKey) {
                        pk = this.collection.at(inEvent.index).get(this.fields[i].fieldName)
                    }
                }

                this.doRowSelected({
                    index: inEvent.index,
                    row: this.$.repeater.itemAtIndex(inEvent.index),
                    primaryKey: pk
                });
            }
            else {
                if (!this.notesDirty && this.notesIndex != inEvent.index) {
                    this.notesIndex = inEvent.index;

                    for (var i = 0; i < this.fields.length; i++) {
                        if (this.fields[i].fieldType == 'SelectNotes') {
                            this.$.notesGroupbox.show();
                            this.$.notesHeader.setContent(this.fields[i].headerText);
                            if (this.collection.at(inEvent.index).get(this.fields[i].fieldName) != null &&
                                this.collection.at(inEvent.index).get(this.fields[i].fieldName) != undefined) {
                                this.$.notes.setValue(this.collection.at(inEvent.index).get(this.fields[i].fieldName));
                            }
                            else {
                                this.$.notes.setValue('');
                            }
                        }
                    }
                }
                else if (this.notesDirty && this.notesIndex != inEvent.index) {
                    var msg = 'You appear to have unsaved changes in the notes. If you proceed any' +
                        ' changes since the last save will be lost. Continue anyway?';

                    this.set('confirmPopupMode', 'confirmDiscardNotes');
                    this.$.popupFactory.showConfirm('Unsaved Changes', msg);
                    this.set('.currentIndex', inEvent.index);
                }
            }
        },

        popupClosedHandler: function (inSender, inEvent) {
            if (this.get('.confirmPopupMode') == 'confirmDelete') {
                if ((inEvent.confirmed === undefined) || (inEvent.confirmed === false)) {
                    return true; // we only want to take action if a delete confirmation has occurred
                }
                else if ((inEvent.confirmed) && (this.get('.currentIndex') > -1)) {
                    // Get primary key value:
                    var pk;
                    for (var i = 0; i < this.fields.length; i++) {
                        if (this.fields[i].primaryKey) {
                            pk = this.collection.at(this.get('.currentIndex')).get(this.fields[i].fieldName);
                            break;
                        }
                    }

                    this.set('.api.token', this.get('.token'));
                    this.set('.api.method', 'DELETE');
                    var endpoint = this.deleteEndpoint + pk + '/';
                    var ajax = this.api.getAjaxObject(endpoint);

                    this.doAjaxStarted();
                    ajax.go();
                    ajax.response(enyo.bindSafely(this, 'deleteResponse'));
                    ajax.error(enyo.bindSafely(this, 'processError'));

                }
                this.set('.confirmPopupMode', '');
                return true;
            }
            else if (this.get('.confirmPopupMode') == 'confirmDiscardNotes') {
                if ((inEvent.confirmed === undefined) || (inEvent.confirmed === false)) {
                    return;
                }
                else if ((inEvent.confirmed) && (this.get('.currentIndex') > -1)) {
                    this.notesDirty = false;
                    this.notesIndex = this.get('.currentIndex');
                    this.$.notesGroupbox.show();

                    var fieldName = '';
                    for (var j = 0; j < this.fields.length; j++) {
                        if (this.fields[j].fieldType == 'SelectNotes') {
                            fieldName = this.fields[j].fieldName;
                            break;
                        }
                    }

                    this.$.notes.setValue(this.collection.at(this.notesIndex).get(fieldName));

                    if (this.changed_row_indices.length == 0) {
                        this.stopJob('SaveInput');
                        this.dirty = false;
                        this.$.saveButton.setSrc('static/assets/save-gray-small.png');
                    }

                    var index = 0;
                    while (this.$.repeater.itemAtIndex(index) != undefined) {
                        this.$.repeater.itemAtIndex(index).$.itemRow.removeClass('oarn-selected-row');
                        index++;
                    }

                    this.$.repeater.itemAtIndex(this.get('.currentIndex')).$.itemRow.addClass('oarn-selected-row');
                }
                return true;
            }
        },

        goNewRecord: function (inSender, inEvent) {
            this.$.newRecordPopup.show();
        },

        closeNewRecord: function (inSender, inEvent) {
            this.$.newRecordPopup.hide();
        },

        saveNewRecord: function (inSender, inEvent) {
            var postBody = {};

            for (var j = 0; j < this.staticPostFields.length; j++) {
                postBody[this.staticPostFields[j].fieldName] = this.staticPostFields[j].value;
            }

            for (var i = 0; i < this.fields.length; i++) {
                if (!this.fields[i].postBodyOnly && !this.fields[i].readOnly) {
                    if (this.fields[i].fieldType == 'TextBox') {
                        if (this.fields[i].validator != undefined) {
                            if (!this.fields[i].validator(this.$[('new_txt_' + this.fields[i].fieldName)].getValue())) {
                                this.$['new_txt_' + this.fields[i].fieldName].addClass('oarn-invalid-input');
                                return;
                            }
                            else {
                                this.$['new_txt_' + this.fields[i].fieldName].removeClass('oarn-invalid-input');
                                postBody[this.fields[i].fieldName] = this.$['new_txt_' +
                                this.fields[i].fieldName].getValue();
                            }
                        }

                        postBody[this.fields[i].fieldName] = this.$[('new_txt_' + this.fields[i].fieldName)].getValue();
                    }
                    else if (this.fields[i].fieldType == 'NumberSelect') {
                        if (this.fields[i].validator != undefined) {
                            if (!this.fields[i].validator(this.$[('new_txt_' + this.fields[i].fieldName)].getValue())) {
                                this.$['new_txt_' + this.fields[i].fieldName].addClass('oarn-invalid-input');
                                return;
                            }
                            else {
                                this.$['new_txt_' + this.fields[i].fieldName].removeClass('oarn-invalid-input');
                                postBody[this.fields[i].fieldName] = this.$['new_txt_' +
                                this.fields[i].fieldName].getValue();
                            }
                        }

                        postBody[this.fields[i].fieldName] = this.$[('new_txt_' + this.fields[i].fieldName)].getValue();
                    }
                    else if (this.fields[i].fieldType == 'Checkbox') {
                        postBody[this.fields[i].fieldName] =
                            this.$[('new_chk_' + this.fields[i].fieldName)].getChecked();
                    }
                    else if (this.fields[i].fieldType == 'DatePicker') {
                        var postDate = null;
                        if (!Number.isNaN(Date.parse(this.$['new_date_' + this.fields[i].fieldName].getValue()))) {
                            var testDate = new Date(
                                this.$['new_date_' + this.fields[i].fieldName].getValue()).toISOString();
                            postDate = moment(testDate).format('YYYY-MM-DD');
                        }

                        if (!this.fields[i].emptyIsValid && postDate == null) {
                            return;
                        }
                        postBody[this.fields[i].fieldName] = postDate;
                    }
                    else if (!this.fields[i].postBodyOnly && !this.fields[i].readOnly) {
                        if (this.fields[i].fieldType == 'DataSelect') {
                            postBody[this.fields[i].fieldName] =
                                this.$[('new_select_' + this.fields[i].fieldName)].getValue();
                        }
                    }
                }
            }

            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'POST');
            var endpoint = this.get('.postEndpoint');
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.postBody = postBody;

            this.doAjaxStarted();
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'postResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));
        },

        postResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            this.$.popupFactory.showSimple('New record created');

            this.$.notesGroupbox.hide();
            this.set('.notesIndex', -1);

            for (var i = 0; i < this.fields.length; i++) {
                if (!this.fields[i].postBodyOnly && !this.fields[i].readOnly) {
                    if (this.fields[i].fieldType == 'TextBox') {
                        this.$[('new_txt_' + this.fields[i].fieldName)].setValue('');
                    }
                    else if (this.fields[i].fieldType == 'NumberSelect') {
                        this.$[('new_txt_' + this.fields[i].fieldName)].setValue('');
                    }
                    if (this.fields[i].fieldType == 'Checkbox') {
                        this.$[('new_chk_' + this.fields[i].fieldName)].setChecked(false);
                    }
                    else if (this.fields[i].fieldType =='DatePicker') {
                        this.$[('new_date_' + this.fields[i].fieldName)].setValue(null);
                    }
                }
            }

            this.refreshMode = 'newRecordCreated';
            this.refreshData();
        },

        goDelete: function (inSender, inEvent) {

            this.set('.currentIndex', inEvent.index);
            this.set('confirmPopupMode', 'confirmDelete');
            this.$.popupFactory.showConfirm('Confirm Delete', this.deleteMessage);

            // get primary key value:
            var pk = -1;
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].primaryKey) {
                    pk = this.collection.at(inEvent.index).get(this.fields[i].fieldName)
                }
            }

            this.deleteScratchPad = {
                index: inEvent.index,
                row: this.$.repeater.itemAtIndex(inEvent.index),
                primaryKey: pk
            };
        },

        /**
         * After a successful delete operation, clear the controls and reset variables.
         * @param inRequest
         * @param inResponse
         */
        deleteResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            var index = this.get('currentIndex');
			this.doRowDeleted(this.deleteScratchPad);
            this.deleteScratchPad = null;

            if (this.get('.notesIndex') == this.get('.currentIndex')) {
                this.$.notesGroupbox.hide();
                this.set('.notesIndex', -1);
            }

            if (this.changed_row_indices.indexOf(index) > -1) {
                this.changed_row_indices.splice(this.changed_row_indices.indexOf(index), 1);
            }

            if (this.changed_row_indices.length == 0) {
                this.stopJob('SaveInput');
                this.notesDirty = false;
                this.dirty = false;
                this.$.saveButton.setSrc('static/assets/save-gray-small.png');
            }

            this.set('.currentIndex', -1); // clear the current index into the repeater.
            this.set('.notesIndex', -1);
            this.$.notesGroupbox.hide();

            var deletedModel = this.collection.at(index);
            this.collection.remove(deletedModel);
            this.$.repeater.setCount(this.collection.length);

            if (this.collection.length > 0) {
                this.$.noResultsRow.hide();
            }
            else {
                this.$.noResultsRow.show();
            }
        },

		getOptionsList: function (listName) {
			return this.$.selectHelper.optionsLists[listName];
		},

		getCollection: function () {
			return this.collection;
		},

        /**
         * Adds a line with the current username and timestamp:
         *
         * @param inSender
         * @param inEvent
         */
        goTimestamp: function(inSender, inEvent) {
            var date = new Date();
            var stamp = '\n*** ' + this.get('username') + ' - ' + date.toLocaleString() + ' ***\n';
            var newVal = this.$.notes.get('value') + stamp;

            this.$.notes.set('value', newVal);

            this.set('.notesDirty', true);
            if (this.changed_row_indices.indexOf(this.notesIndex) == -1 && this.notesIndex != undefined) {
                this.changed_row_indices.push(this.notesIndex);
            }
            this.set('.dirty', true);

            // Set the autosave job in motion:
            this.lastChanged = new Date();
            this.$.saveButton.setSrc('static/assets/save-small.png');
            this.startJob('SaveInput', enyo.bindSafely(this, 'goSaveChanges'),
                this.get('saveDelay'));
        },

        frozenCheckboxChanged: function(inSender, inEvent) {
            inSender.setChecked(
                !inSender.getChecked()
            );
        },

        pauseSaveTimer: function() {
            this.pauseSave = true;
        },

        startSaveTimer: function() {
            this.pauseSave = false;
            if (this.dirty) {
                this.saveJob = this.startJob('SaveInput', enyo.bindSafely(this, 'goSaveChanges'),
                this.get('saveDelay'));
            }
        }

    });

})(enyo, this);
