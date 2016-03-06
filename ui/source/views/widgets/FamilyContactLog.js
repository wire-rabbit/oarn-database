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
        name: 'oarn.FamilyContactLog',

        family_member_options_list: [],
        employee_options_list: [],
        contact_type_options_list: [],

        changed_row_indices: [],

        notesDirty: false,
        notesIndex: -1,

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
             * When the state has changed but not yet saved, this is set to true.
             * It is used to alert parent controls that we have unsaved changes here.
             *
             * @type {Boolean}
             * @public
             */
            dirty: false,

            /**
             * The initial tooltip text for the save button. After changes this will be retained
             * and, if `showTimeStampTooltip` is `true`, the last saved timestamp will be
             * added to the end.
             *
             * @type {String}
             * @default 'Click to save.'
             * @public
             */
            baseSaveString: 'Click to save.',

            maxLength: 10000,

            /**
             * Sets the number of milliseconds before each autosave.
             *
             * @type {number}
             * @default 15000
             * @public
             */
            saveDelay: 15000,

            /**
             * Determines whether a last saved timestamp will be added to the tooltip after saving.
             *
             * @type {Boolean}
             * @default true
             * @public
             */
            showTimeStampTooltip: true,

            selectedOrganization: null,
            currentOrgReadOnly: false,
            currentOrgReadWrite: false,
            currentOrgAdmin: false
        },

        components: [
            {kind: 'onyx.Groupbox', style: 'max-width:750px;', components: [
                {kind: 'onyx.GroupboxHeader', components: [
                    {content: 'Contact Log', classes: 'oarn-header', tag:'span'},
                    {kind: 'onyx.TooltipDecorator',
                        style: 'display: inline; float:right', components: [
                        {name: 'saveButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
                            src: 'static/assets/save-gray-small.png',
                            ontap: 'goSaveChanges'},
                        {name: 'saveTooltip', kind: 'onyx.Tooltip',
                            classes: 'oarn-tooltip', content: '', allowHtml: true}
                    ]},
                    {kind: 'onyx.TooltipDecorator', style: 'display: inline; float:right', components: [
                        {name: 'newButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
                            src: 'static/assets/blue-add.png', ontap: 'goNewContact'},
                        {kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
                            content: 'Create a new contact log entry for this family.'}
                    ]}
                ]},
                {name: 'noResultsRow', content: 'No Contact Log Records Found',
                    classes: 'oarn-no-results-text'},
                {name: 'repeaterScroller', kind: 'Scroller', horizontal: 'hidden',
                    maxHeight:'300px', components:[
                    {name: 'repeater', kind: 'enyo.Repeater', multiSelect: false, onSetupItem: 'setupItem',
                        components: [
                            {name: 'itemWrapper', tag: 'table',
                                style: 'width: 100%; border: 1px solid darkgray; border-collapse: collapse;',
                                classes: 'oarn-control', components: [
                                {name: 'headerRow', style: 'border-bottom-style: 1px solid darkgray', tag: 'tr',
                                    components: [
                                        {tag: 'td', style: 'width: 75px; display: inline-block',
                                            allowHtml:true, content: '&nbsp;'},
                                        {tag: 'td', style: 'width: 60px; display: inline-block',
                                            content: 'Contact Log ID',
                                            classes: 'oarn-groupbox-td-header'},
                                        {tag: 'td', style: 'width: 170px; display: inline-block',
                                            content: 'Employee',
                                            classes: 'oarn-groupbox-td-header'},
                                        {tag: 'td', style: 'width: 170px; display: inline-block',
                                            content: 'Family Member',
                                            classes: 'oarn-groupbox-td-header'},
                                        {tag: 'td', style: 'width: 100px; display: inline-block',
                                            content: 'Contact Type',
                                            classes: 'oarn-groupbox-td-header'},
                                        {tag: 'td', style: 'width: 95px; display: inline-block',
                                            content: 'Contact Date',
                                            classes: 'oarn-groupbox-td-header'},
                                        {tag: 'td', style: 'width: 30px; display: inline-block',
                                            allowHtml:true, content: '&nbsp;'},
                                    ]},
                                {tag: 'tr', components: [
                                    {tag: 'td', style: 'width: 75px; display: inline-block', components: [
                                        {kind: 'onyx.Button', content: 'Select',
                                            classes: 'onyx-dark', ontap: 'contactSelected'}
                                    ]},
                                    {tag: 'td', style: 'width: 60px; display: inline-block', components: [
                                        {name: 'lblContactLogID', kind: 'enyo.Input',
                                            classes: 'oarn-control oarn-groupbox-control',
                                            style: 'width: 95%; font-size: smaller',
                                            disabled: true}
                                    ]},
                                    {tag: 'td', style: 'width: 170px; display: inline-block', components: [
                                        {name: 'selectEmployee', kind: 'oarn.DataSelect', style: 'width: 95%',
                                            classes: 'oarn-control oarn-groupbox-control',
                                            onchange: 'goInput'},
                                        {name: 'lblEmployee', kind: 'enyo.Input', style: 'width: 95%',
                                            classes: 'oarn-control oarn-groupbox-control',
                                            disabled: true, showing: false}
                                    ]},
                                    {tag: 'td', style: 'width: 170px; display: inline-block', components: [
                                        {name: 'selectFamilyMember', kind: 'oarn.DataSelect',
                                            classes: 'oarn-control oarn-groupbox-control',
                                            onchange: 'goInput', style: 'width: 95%'},
                                        {name: 'lblFamilyMember', kind: 'enyo.Input',
                                            classes: 'oarn-control oarn-groupbox-control', style: 'width: 95%',
                                            disabled: true, showing: false}
                                    ]},
                                    {tag: 'td', style: 'width: 100px; display: inline-block', components: [
                                        {name: 'selectContactType', kind: 'oarn.DataSelect',
                                            classes: 'oarn-control oarn-groupbox-control',
                                            onchange: 'goInput', style: 'width: 95%'},
                                        {name: 'lblContactType', kind: 'enyo.Input',
                                            classes: 'oarn-control oarn-groupbox-control', style: 'width: 95%',
                                            disabled: true, showing: false}
                                    ]},
                                    {tag: 'td', style: 'width: 95px; display: inline-block', components: [
                                        {name: 'txtContactDate', kind: 'oarn.DatePicker', width: '95%',
                                            classes: 'oarn-control', oninput: 'goInput', onInput: 'goInput',
                                            emptyIsValid: false},
                                        {name: 'lblContactDate', kind: 'enyo.Input', attributes: [{'readonly': true}],
                                            style: 'width: 95%', showing: false},
                                    ]},
                                    {tag: 'td', style: 'width: 30px; display: inline-block', components: [
                                        {name: 'deleteButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
                                            src: 'static/assets/blue-delete.png', ontap: 'goDelete'}
                                    ]}
                                ]}
                            ]}
                        ]}
                ]}
            ]},

            {name: 'newRecordPopup', kind: 'onyx.Popup', autoDismiss: false, modal: true,
                centered: true, scrim: true, floating: true, style: 'background-color: #EAEAEA',
                components: [

                    {kind: 'onyx.Groupbox', components: [
                        {kind: 'onyx.GroupboxHeader', content: 'New Contact Log Entry'},
                        {tag: 'table', components: [
                            {tag: 'tr', components: [
                                {tag: 'td', components: [
                                    {tag: 'label', content: 'Employee:',
                                        classes: 'oarn-control oarn-groupbox-control',
                                        attributes: [{'for': 'new_selectEmployee'}]}
                                ]},
                                {tag: 'td', components: [
                                    {name: 'new_selectEmployee', kind: 'oarn.DataSelect',
                                        classes: 'oarn-control oarn-groupbox-control', style: 'width: 95%'}
                                ]},
                            ]},
                            {tag: 'tr', components: [
                                {tag: 'td', components: [
                                    {tag: 'label', content: 'Family Member:',
                                        classes: 'oarn-control oarn-groupbox-control',
                                        attributes: [{'for': 'new_selectFamilyMember'}]}
                                ]},
                                {tag: 'td', components: [
                                    {name: 'new_selectFamilyMember', kind: 'oarn.DataSelect',
                                        classes: 'oarn-control oarn-groupbox-control', style: 'width: 95%'}
                                ]},
                            ]},
                            {tag: 'tr', components: [
                                {tag: 'td', components: [
                                    {tag: 'label', content: 'Contact Type:',
                                        classes: 'oarn-control oarn-groupbox-control',
                                        attributes: [{'for': 'new_selectContactType'}]}
                                ]},
                                {tag: 'td', components: [
                                    {name: 'new_selectContactType', kind: 'oarn.DataSelect',
                                        classes: 'oarn-control oarn-groupbox-control', style: 'width: 95%'}
                                ]},
                            ]},
                            {tag: 'tr', components: [
                                {tag: 'td', components: [
                                    {tag: 'label', content: 'Contact Date:',
                                        classes: 'oarn-control oarn-groupbox-control',
                                        attributes: [{'for': 'new_txtContactDate'}]}
                                ]},
                                {tag: 'td', components: [
                                    {name: 'new_txtContactDate', kind: 'oarn.DatePicker', width: '95%',
                                        classes: 'oarn-control', onSelect: 'goInput', emptyIsValid: false}
                                ]},
                            ]},
                            {tag: 'tr', components: [
                                {tag: 'td', attributes: [{'colspan': 2}], components: [
                                    {kind: 'onyx.Groupbox', components: [
                                        {kind: 'onyx.GroupboxHeader', components: [
                                            {name: 'new_headerNotes', tag: 'span', classes: 'oarn-header',
                                            content: 'Contact Notes:'},
                                            {kind: 'onyx.TooltipDecorator',	style: 'display: inline; float: right',
                                                components: [
                                                    {name: 'newTimestampButton', kind: 'onyx.IconButton',
                                                        classes: 'oarn-icon-button',
                                                        src: 'static/assets/clock-small.png',
                                                        ontap: 'newNotesTimestamp'},
                                                    {kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
                                                        content: 'Click to add a timestamp to the notes'}
                                                ]},
                                        ]},
                                        {kind: 'onyx.InputDecorator', components: [
                                            {name: 'newNotes', kind: 'onyx.TextArea',
                                                style: 'width:100%; height:250px;', placeholder: '',
                                                classes: 'oarn-control'}
                                        ]}
                                    ]}
                                ]}
                            ]}
                        ]},
                        {name: 'buttonsRow', style: 'text-align: center; padding-top:5px',
                            components: [
                                {name: 'btnClose', kind: 'onyx.Button', content: 'Close',
                                    style: 'margin: 5px 5px 5px 5px',	ontap: 'closeNewRecord'},
                                {name: 'btnSave', kind: 'onyx.Button', content: 'Create Record',
                                    ontap: 'saveNewRecord', style: 'margin: 5px 5px 5px 5px',
                                    classes: 'onyx-affirmative'}
                            ]}
                    ]}
                ]},

            {name: 'notesGroupbox', showing: false, kind: 'onyx.Groupbox',
                style: 'width: 600px; padding-top:5px', components: [
                {kind: 'onyx.GroupboxHeader', components: [
                    {name: 'headerNotes', tag: 'span', classes: 'oarn-header'},
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

            {name: 'popupFactory', kind: 'oarn.PopupFactory'}
        ],

        observers: {
            watchSelectReturned: ['familyMemberOptionsReturned',
                'employeeOptionsReturned', 'contactTypeOptionsReturned']
        },

        /**
         * @private
         */
        events: {
            onAjaxError: '',

            onAjaxStarted: '',

            onAjaxFinished: '',

            onFamilyMemberOptionsReturned: '', // handled locally

            onEmployeeOptionsReturned: '', // handled locally

            onContactTypeOptionsReturned: '', // handled locally

            onDirtyStateChanged: ''
        },

        /**
         * @private
         */
        handlers: {
            onFamilyMemberOptionsReturned: 'familyMemberOptionsReturnedHandler',

            onEmployeeOptionsReturned: 'employeeOptionsReturnedHandler',

            onContactTypeOptionsReturned: 'contactTypeOptionsReturnedHandler',

            onPopupClosed: 'popupClosedHandler'

        },

        create: function () {
            this.inherited(arguments);

            this.api = new oarn.API();
            this.set('.$.saveTooltip.content', this.baseSaveString);

        },

        rendered: function () {
            this.inherited(arguments);

            if (this.get('.currentOrgReadOnly')) {
                this.$.saveButton.hide();
                this.$.newButton.hide();
                this.$.timestampButton.hide();
                this.$.notes.setDisabled(true);
            }
        },

        refreshData: function () {
            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'GET');
            var endpoint = 'api/v1/family/contact-log/?family_id='+ this.get('.selectedFamilyID');
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));

            this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
        },

        processResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            var details = [];
            for (var i = 0; i < inResponse['results'].length; i++) {
                var detail = {
                    'contact_log_id': inResponse['results'][i]['contact_log_id'],
                    'family': inResponse['results'][i]['family'],
                    'employee': inResponse['results'][i]['employee'],
                    'family_member': inResponse['results'][i]['family_member'],
                    'ref_contact_type': inResponse['results'][i]['ref_contact_type'],
                    'contact_date': inResponse['results'][i]['contact_date'],
                    'contact_log_notes': inResponse['results'][i]['contact_log_notes'],
                    'read_only': inResponse['results'][i]['read_only']
                };
                details.push(detail);
            }

            this.collection = new enyo.Collection();
            this.collection.add(details);

            if (this.collection.length  > 0) {
                this.$.noResultsRow.hide();
            }
            else {
                this.$.noResultsRow.show();
            }

            this.$.repeater.setCount(this.collection.length);
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
                ' retrieve data from the server. ' +
                'Please provide the following information to your database administrator: ' +
                '<br><br>' + 'status: ' + status + '<br>' + detail_msg);

            this.set('.xhrResponse', inSender.xhrResponse);
            return true;
        },

        goNewContact: function (inSender, inEvent) {
            this.$.newRecordPopup.show();
        },

        closeNewRecord: function (inSender, inEvent) {
            this.$.newRecordPopup.hide();
        },

        saveNewRecord: function (inSender, inEvent) {
            var testDate = null;
            var contactDate = null;
            if (!Number.isNaN(Date.parse(this.$.new_txtContactDate.getValue()))) {
                testDate = new Date(this.$.new_txtContactDate.getValue()).toISOString();
                contactDate = moment(testDate).format('YYYY-MM-DD');
            }

            if (contactDate == null) {
                this.$.popupFactory.showInfo('Invalid Data', 'A contact date is required.');
                return;
            }

            var postBody = {
                'family': this.get('.selectedFamilyID'),
                'employee': this.$.new_selectEmployee.getValue(),
                'family_member': this.$.new_selectFamilyMember.getValue(),
                'ref_contact_type': this.$.new_selectContactType.getValue(),
                'contact_date': contactDate,
                'contact_log_notes': this.$.newNotes.getValue()
            }

            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'POST');
            var endpoint = 'api/v1/family/contact-log/';
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.postBody = postBody;

            this.doAjaxStarted();
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'postResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));
        },

        postResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            this.$.popupFactory.showSimple('New contact log entry created');

            this.$.new_selectEmployee.setSelected(0);
            this.$.new_selectFamilyMember.setSelected(0);
            this.$.new_selectContactType.setSelected(0);
            this.$.new_txtContactDate.setValue(null);
            this.$.newNotes.setValue(null);

            this.refreshData();
        },

        selectedFamilyIDChanged: function (oldVal) {
            if (this.employee_options_list.length == 0 || this.family_member_options_list.length == 0 ||
            this.contact_type_options_list.length == 0) {
                // if no data for the dropdowns, start those fetch requests and let them
                // call the main refresh routine when complete.
                if (this.get('.selectedFamilyID') > 0) {
                    this.set('.familyMemberOptionsReturned', false);
                    this.set('.employeeOptionsReturned', false);
                    this.set('.contactTypeOptionsReturned', false);
                    this.loadSelectData();
                }
            }
            else {
                // We already have the dropdown data, so go straight to main refresh:
                if (this.get('.selectedFamilyID') > 0) {
                    this.refreshData();
                }
            }
        },

        watchSelectReturned: function(previous, current, property) {
            if (this.get('.familyMemberOptionsReturned') && this.get('.employeeOptionsReturned')
            && this.get('.contactTypeOptionsReturned')) {
                this.doAjaxFinished();
                this.$.new_selectEmployee.options_list.empty();
                this.$.new_selectEmployee.options_list.add(this.employee_options_list);

                this.$.new_selectFamilyMember.options_list.empty();
                this.$.new_selectFamilyMember.options_list.add(this.family_member_options_list);

                this.$.new_selectContactType.options_list.empty();
                this.$.new_selectContactType.options_list.add(this.contact_type_options_list);

                this.refreshData(); // load a fresh batch of languages for this person record.
            }
        },

        loadSelectData: function () {
            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'GET');
            var endpoint = 'api/v1/family/adult-search/?family_id=' + this.get('.selectedFamilyID');
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processFamilyMembersResponse'));
            ajax.error(enyo.bindSafely(this, 'processError')); // we can share error handling

            endpoint = 'api/v1/program/family/person/?staff_only=true&limit=500';
            ajax = this.api.getAjaxObject(endpoint);
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processEmployeesResponse'));
            ajax.error(enyo.bindSafely(this, 'processError')); // we can share error handling

            endpoint = endpoint = 'api/v1/ref/contact-types';
            ajax = this.api.getAjaxObject(endpoint);
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processContactTypesResponse'));
            ajax.error(enyo.bindSafely(this, 'processError')); // we can share error handling

            this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
        },

        processFamilyMembersResponse: function (inRequest, inResponse) {
            var details = [];
            for (var i = 0; i < inResponse['results'].length; i++) {
                if (inResponse['results'][i] !== undefined) {
                    var firstName = inResponse['results'][i]['first_name'];
                    var lastName = inResponse['results'][i]['last_name'];
                    var personID = inResponse['results'][i]['person_id'];
                    var isChild = inResponse['results'][i]['is_child'];

                    var summary = personID + ' - ' +  lastName + ', ' + firstName;
                    if (isChild) {
                        summary = summary + ' (child)';
                    }

                    var detail = {
                        value: personID,
                        display_text: summary
                    };
                    details.push(detail);
                }

            }
            this.family_member_options_list = details;
            this.doFamilyMemberOptionsReturned();
        },

        processContactTypesResponse: function (inRequest, inResponse) {
            var details = [];
            details.push({value: null, display_text: ''}); // let the user select a null row.

            for (var i = 0; i < inResponse['results'].length; i++) {
                if (inResponse['results'][i] !== undefined) {
                    var detail = {
                        value: inResponse['results'][i]['ref_contact_type_id'],
                        display_text: inResponse['results'][i]['description']
                    };
                    details.push(detail);
                }

            }
            this.contact_type_options_list = details;
            this.doContactTypeOptionsReturned();
        },

        processEmployeesResponse: function (inRequest, inResponse) {
            var details = [];
            for (var i = 0; i < inResponse['results'].length; i++) {
                if (inResponse['results'][i] !== undefined) {
                    var detail = {
                        value: inResponse['results'][i]['person_id'],
                        display_text: inResponse['results'][i]['last_name'] + ', ' +
                        inResponse['results'][i]['first_name']
                    };
                    details.push(detail);
                }
            }
            this.employee_options_list = details;
            this.doEmployeeOptionsReturned();
        },

        familyMemberOptionsReturnedHandler: function (inSender, inEvent) {
            this.set('.familyMemberOptionsReturned', true);
            return true;
        },

        employeeOptionsReturnedHandler: function (inSender, inEvent) {
            this.set('.employeeOptionsReturned', true);
            return true;
        },

        contactTypeOptionsReturnedHandler: function (inSender, inEvent) {
            this.set('.contactTypeOptionsReturned', true);
            return true;
        },

        setupItem: function (inSender, inEvent) {
            var item = inEvent.item;

            if (inEvent.index == 0) {
                item.$.headerRow.show();
            }
            else {
                item.$.headerRow.hide();
            }

            var family_member_index = 0;
            var family_member_value = this.collection.at(inEvent.index).get('family_member');
            for (var i = 0; i < this.family_member_options_list.length; i++){
                if (this.family_member_options_list[i]['value'] == family_member_value) {
                    family_member_index = i;
                }
            }

            var employee_index = 0;
            var employee_value = this.collection.at(inEvent.index).get('employee');
            for (var i = 0; i < this.employee_options_list.length; i++) {
                if (this.employee_options_list[i]['value'] == employee_value) {
                    employee_index = i;
                }
            }

            var contact_type_index = 0;
            var contact_type_value = this.collection.at(inEvent.index).get('ref_contact_type');
            for (var i = 0; i < this.contact_type_options_list.length; i++){
                if (this.contact_type_options_list[i]['value'] == contact_type_value) {
                    contact_type_index = i;
                }
            }

            var contactDate = null;
            if (this.collection.at(inEvent.index).get('contact_date') != null) {
                contactDate = moment(this.collection.at(inEvent.index).get(
                    'contact_date'),'YYYY-MM-DD').format('MM/DD/YYYY');
            }

            item.$.lblContactLogID.setValue(this.collection.at(inEvent.index).get('contact_log_id'));

            if (this.collection.at(inEvent.index).get('read_only')) {
                item.$.selectEmployee.hide();
                item.$.selectFamilyMember.hide();
                item.$.selectContactType.hide();
                item.$.txtContactDate.hide();

                item.$.lblEmployee.show();
                item.$.lblFamilyMember.show();
                item.$.lblContactType.show();
                item.$.lblContactDate.show();

                item.$.deleteButton.hide();

                item.$.lblEmployee.setValue(this.employee_options_list[employee_index].display_text);
                item.$.lblFamilyMember.setValue(this.family_member_options_list[family_member_index].display_text);
                item.$.lblContactType.setValue(this.contact_type_options_list[contact_type_index].display_text)
                item.$.lblContactDate.setValue(contactDate);
            }
            else {
                item.$.selectEmployee.show();
                item.$.selectFamilyMember.show();
                item.$.selectContactType.show();
                item.$.txtContactDate.show();

                item.$.lblEmployee.hide();
                item.$.lblFamilyMember.hide();
                item.$.lblContactType.hide();
                item.$.lblContactDate.hide();

                item.$.deleteButton.show();

                item.$.selectEmployee.selectedIndex = employee_index;
                item.$.selectEmployee.options_list.empty();
                item.$.selectEmployee.options_list.add(this.employee_options_list);

                item.$.selectFamilyMember.selectedIndex = family_member_index;
                item.$.selectFamilyMember.options_list.empty();
                item.$.selectFamilyMember.options_list.add(this.family_member_options_list);

                item.$.selectContactType.selectedIndex = contact_type_index;
                item.$.selectContactType.options_list.empty();
                item.$.selectContactType.options_list.add(this.contact_type_options_list);

                item.$.txtContactDate.setValue(contactDate);
            }

            return true;
        },

        goInput: function (inSender, inEvent) {
            if (inEvent.index != undefined) {
                var item = this.$.repeater.itemAtIndex(inEvent.index);

                if (inEvent.originator.name == 'selectEmployee') {
                    this.collection.at(inEvent.index).set('employee', item.$.selectEmployee.getValue());
                }
                else if (inEvent.originator.name == 'selectFamilyMember') {
                    this.collection.at(inEvent.index).set('family_member', item.$.selectFamilyMember.getValue());
                }
                else if (inEvent.originator.name == 'selectContactType') {
                    this.collection.at(inEvent.index).set('ref_contact_type', item.$.selectContactType.getValue());
                }
                else if (inEvent.originator.name == 'txtContactDate') {
                    var contactDate = null;
                    if (this.collection.at(inEvent.index).get('contact_date') != null) {
                        contactDate = moment(item.$.txtContactDate.getValue(),'MM/DD/YYYY').format('YYYY-MM-DD');
                    }
                    this.collection.at(inEvent.index).set('contact_date', contactDate);
                }

                if (this.changed_row_indices.indexOf(inEvent.index) == -1) {
                    this.changed_row_indices.push(inEvent.index);
                }
            }
            else if (inEvent.originator.name == 'notes') {
                this.set('.notesDirty', true);

                if (this.changed_row_indices.indexOf(this.notesIndex) == -1) {
                    this.changed_row_indices.push(this.notesIndex);
                }
            }

            this.set('.dirty', true);

            // Set the autosave job in motion:
            this.lastChanged = new Date();
            this.$.saveButton.setSrc('static/assets/save-small.png');
            this.saveJob = this.startJob('SaveNotesInput', enyo.bindSafely(this, 'goSaveChanges'),
                this.get('saveDelay'));
        },

        goSaveChanges: function (inSender, inEvent) {
            if (this.get('.dirty')) {
                if (this.changed_row_indices.length > 0 || this.notesDirty) {
                    if (this.changed_row_indices.indexOf(this.notesIndex) == -1 && this.notesIndex >= 0) {
                        this.changed_row_indices.push(this.notesIndex);
                    }

                    for (var i = 0; i < this.changed_row_indices.length; i++) {
                        var item = this.$.repeater.itemAtIndex(this.changed_row_indices[i]);
                        if (item == undefined) {
                            enyo.log('item is undefined');
                        }

                        var contactDate = null;
                        if (!Number.isNaN(Date.parse(item.$.txtContactDate.getValue()))) {
                            var testDate = new Date(item.$.txtContactDate.getValue()).toISOString();
                            contactDate = moment(testDate).format('YYYY-MM-DD');
                        }

                        if (contactDate == null) {
                            return; // we can't save, but this is timed so no popup
                        }

                        var postBody = null;
                        if (i == this.get('.notesIndex')) {
                            postBody = {
                                'family': this.get('.selectedFamilyID'),
                                'employee': item.$.selectEmployee.getValue(),
                                'family_member': item.$.selectFamilyMember.getValue(),
                                'ref_contact_type': item.$.selectContactType.getValue(),
                                'contact_date': contactDate,
                                'contact_log_notes': this.$.notes.getValue()
                            };

                            this.collection.at(this.changed_row_indices[i]).set(
                                'contact_log_notes', this.$.notes.getValue());
                        }
                        else {
                            postBody = {
                                'family': this.get('.selectedFamilyID'),
                                'employee': item.$.selectEmployee.getValue(),
                                'family_member': item.$.selectFamilyMember.getValue(),
                                'ref_contact_type': item.$.selectContactType.getValue(),
                                'contact_date': contactDate
                            };
                        }

                        var pk = this.collection.at(this.changed_row_indices[i]).get('contact_log_id');

                        this.set('.api.token', this.get('.token'));
                        this.set('.api.method', 'PATCH');
                        var endpoint = 'api/v1/family/contact-log/' + pk + '/';
                        var ajax = this.api.getAjaxObject(endpoint);
                        ajax.postBody = postBody;

                        this.doAjaxStarted();
                        ajax.go();
                        ajax.response(enyo.bindSafely(this, 'patchResponse'));
                        ajax.error(enyo.bindSafely(this, 'processError'));
                    }
                }
            }
        },

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

                this.stopJob('SaveNotesInput');
            }
        },

        contactSelected: function (inSender, inEvent) {
            if (!this.notesDirty && this.notesIndex != inEvent.index) {
                this.notesIndex = inEvent.index;

                this.$.notesGroupbox.show();
                this.$.headerNotes.setContent('Notes for contact ID: ' +
                    this.collection.at(inEvent.index).get('contact_log_id'));

                if (this.collection.at(inEvent.index).get('contact_log_notes') != null) {
                    this.$.notes.setValue(this.collection.at(inEvent.index).get('contact_log_notes'));
                }
            }
            else if (this.notesDirty && this.notesIndex != inEvent.index) {
                var msg = 'You appear to have unsaved changes in the notes. If you proceed any' +
                    ' changes since the last save will be lost. Continue?';

                this.set('confirmPopupMode', 'confirmDiscardNotes');
                this.$.popupFactory.showConfirm('Unsaved Changes', msg);
                this.set('.currentIndex', inEvent.index);
            }
        },

        goTimestamp: function(inSender, inEvent) {
            var date = new Date();
            var stamp = '\n*** ' + this.get('username') + ' - ' + date.toLocaleString() + ' ***\n';
            var newVal = this.$.notes.get('value') + stamp;

            // If the new value is larger than the max length, trim it back:
            if (newVal.length > this.get('maxLength')) {
                newVal = newVal.substr(0, this.get('maxLength'));
            }

            this.$.notes.set('value', newVal);

            // Set the autosave job in motion:
            if (this.changed_row_indices.indexOf(this.get('.notesIndex')) == -1) {
                this.changed_row_indices.push(this.get('.notesIndex'));
            }

            this.notesDirty = true;
            this.dirty = true;
            this.lastChanged = new Date();
            this.$.saveButton.setSrc('static/assets/save-small.png');
            this.saveJob = this.startJob('SaveNotesInput', enyo.bindSafely(this, 'goSaveChanges'),
                this.get('saveDelay'));
        },

        newNotesTimestamp: function(inSender, inEvent) {
            var date = new Date();
            var stamp = '\n*** ' + this.get('username') + ' - ' + date.toLocaleString() + ' ***\n';
            var newVal = this.$.newNotes.get('value') + stamp;

            // If the new value is larger than the max length, trim it back:
            if (newVal.length > this.get('maxLength')) {
                newVal = newVal.substr(0, this.get('maxLength'));
            }

            this.$.newNotes.set('value', newVal);
        },


        goDelete: function (inSender, inEvent) {
            var msg = 'Clicking \'Yes\' will permanently delete this contact log entry and ' +
                'cannot be undone. Continue?';

            this.set('.currentIndex', inEvent.index);
            this.set('confirmPopupMode', 'confirmDelete');
            this.$.popupFactory.showConfirm('Confirm Delete', msg);
        },

        popupClosedHandler: function (inSender, inEvent) {
            if (this.get('.confirmPopupMode') == 'confirmDelete') {
                if ((inEvent.confirmed === undefined) || (inEvent.confirmed === false)) {
                    return; // we only want to take action if a delete confirmation has occurred
                }
                else if ((inEvent.confirmed) && (this.get('.currentIndex') > -1)) {

                    var pk = this.collection.at(this.get('.currentIndex')).get('contact_log_id');

                    this.set('.api.token', this.get('.token'));
                    this.set('.api.method', 'DELETE');
                    var endpoint = 'api/v1/family/contact-log/' + pk + '/';
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
                    this.$.headerNotes.setContent('Notes for contact ID: ' +
                        this.collection.at(this.notesIndex).get('contact_log_id'));

                    this.$.notes.setValue(this.collection.at(this.notesIndex).get('contact_log_notes'));
                    if (this.changed_row_indices.length == 0) {
                        this.stopJob('SaveNotesInput');
                        this.dirty = false;
                        this.$.saveButton.setSrc('static/assets/save-gray-small.png');
                    }
                }
                return true;
            }
        },

        /**
         * After a successful delete operation, clear the controls and reset variables.
         * @param inRequest
         * @param inResponse
         */
        deleteResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            var index = this.get('currentIndex');

            if (this.get('.notesIndex') == this.get('.currentIndex')) {
                this.$.notesGroupbox.hide();
                this.set('.notesIndex', -1);
            }

            if (this.changed_row_indices.indexOf(index) > -1) {
                this.changed_row_indices.splice(this.changed_row_indices.indexOf(index), 1);
            }

            if (this.changed_row_indices.length == 0) {
                this.stopJob('SaveNotesInput');
                this.notesDirty = false;
                this.dirty = false;
                this.$.saveButton.setSrc('static/assets/save-gray-small.png');
            }

            this.set('.currentIndex', -1); // clear the current index into the repeater.

            var deletedModel = this.collection.at(index);
            this.collection.remove(deletedModel);
            this.$.repeater.setCount(this.collection.length);
        },

        dirtyChanged: function (inOldVal) {
            this.doDirtyStateChanged({'dirty': this.get('.dirty')});
        }

    })

}) (enyo, this);
