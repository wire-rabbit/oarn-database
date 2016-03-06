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
        name: 'oarn.FamilyHomeVisits',

        visitor_options_list: [],
        locations_options_list: [],

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
            {kind: 'onyx.Groupbox', style: 'max-width:600px;', components: [
                {kind: 'onyx.GroupboxHeader', components: [
                    {content: 'Home Visits', classes: 'oarn-header', tag:'span'},
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
                            src: 'static/assets/blue-add.png', ontap: 'goNewVisit'},
                        {kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
                            content: 'Create a new home visit record for this family.'}
                    ]}
                ]},
                {name: 'noResultsRow', content: 'No Family Enrollment Records Found',
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
                                            content: 'Home Visit ID',
                                            classes: 'oarn-groupbox-td-header'},
                                        {tag: 'td', style: 'width: 170px; display: inline-block',
                                            content: 'Home Visitor',
                                            classes: 'oarn-groupbox-td-header'},
                                        {tag: 'td', style: 'width: 100px; display: inline-block',
                                            content: 'Location',
                                            classes: 'oarn-groupbox-td-header'},
                                        {tag: 'td', style: 'width: 95px; display: inline-block',
                                            content: 'Visit Date',
                                            classes: 'oarn-groupbox-td-header'},
                                        {tag: 'td', style: 'width: 65px; display: inline-block',
                                            content: 'Service Minutes',
                                            classes: 'oarn-groupbox-td-header'},
                                        {tag: 'td', style: 'width: 30px; display: inline-block',
                                            allowHtml:true, content: '&nbsp;'},
                                ]},
                                {tag: 'tr', components: [
                                    {tag: 'td', style: 'width: 75px; display: inline-block', components: [
                                        {kind: 'onyx.Button', content: 'Select',
                                            classes: 'onyx-dark', ontap: 'visitSelected'}
                                    ]},
                                    {tag: 'td', style: 'width: 60px; display: inline-block', components: [
                                        {name: 'lblHomeVisitID', kind: 'enyo.Input',
                                            classes: 'oarn-control oarn-groupbox-control',
                                            style: 'width: 95%; font-size: smaller',
                                        disabled: true}
                                    ]},
                                    {tag: 'td', style: 'width: 170px; display: inline-block', components: [
                                        {name: 'selectVisitor', kind: 'oarn.DataSelect', style: 'width: 95%',
                                            classes: 'oarn-control oarn-groupbox-control',
                                            onchange: 'goInput'},
                                        {name: 'lblVisitor', kind: 'enyo.Input', style: 'width: 95%',
                                            classes: 'oarn-control oarn-groupbox-control',
                                            disabled: true, showing: false}
                                    ]},
                                    {tag: 'td', style: 'width: 100px; display: inline-block', components: [
                                        {name: 'selectLocation', kind: 'oarn.DataSelect',
                                            classes: 'oarn-control oarn-groupbox-control',
                                            onchange: 'goInput', style: 'width: 95%'},
                                        {name: 'lblLocation', kind: 'enyo.Input',
                                            classes: 'oarn-control oarn-groupbox-control', style: 'width: 95%',
                                            disabled: true, showing: false}
                                    ]},
                                    {tag: 'td', style: 'width: 95px; display: inline-block', components: [
                                        {name: 'txtVisitDate', kind: 'oarn.DatePicker', width: '95%',
                                            classes: 'oarn-control', oninput: 'goInput', onInput: 'goInput',
                                            emptyIsValid: false},
                                        {name: 'lblVisitDate', kind: 'enyo.Input', attributes: [{'readonly': true}],
                                            style: 'width: 95%', showing: false},
                                    ]},
                                    {tag: 'td', style: 'width: 65px; display: inline-block', components: [
                                        {name: 'txtServiceMinutes', kind: 'enyo.Input',
                                            style: 'width: 95%',
                                            classes: 'oarn-control', oninput: 'goInput',
                                            attributes: [{'type': 'number'},
                                                {'min': 0}, {'max': 1440}]},
                                        {name: 'lblServiceMinutes', kind: 'enyo.Input',
                                            style: 'width: 95%',
                                            attributes: [{'readonly': true}], showing: false},
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
                        {kind: 'onyx.GroupboxHeader', content: 'New Home Visit Record'},
                        {tag: 'table', components: [
                            {tag: 'tr', components: [
                                {tag: 'td', components: [
                                    {tag: 'label', content: 'Home Visitor:',
                                        classes: 'oarn-control oarn-groupbox-control',
                                        attributes: [{'for': 'new_selectVisitor'}]}
                                ]},
                                {tag: 'td', components: [
                                    {name: 'new_selectVisitor', kind: 'oarn.DataSelect',
                                        classes: 'oarn-control oarn-groupbox-control', style: 'width: 95%'}
                                ]},
                            ]},
                            {tag: 'tr', components: [
                                {tag: 'td', components: [
                                    {tag: 'label', content: 'Location:',
                                        classes: 'oarn-control oarn-groupbox-control',
                                        attributes: [{'for': 'new_selectLocation'}]}
                                ]},
                                {tag: 'td', components: [
                                    {name: 'new_selectLocation', kind: 'oarn.DataSelect',
                                        classes: 'oarn-control oarn-groupbox-control', style: 'width: 95%'}
                                ]},
                            ]},
                            {tag: 'tr', components: [
                                {tag: 'td', components: [
                                    {tag: 'label', content: 'Visit Date:',
                                        classes: 'oarn-control oarn-groupbox-control',
                                        attributes: [{'for': 'new_txtVisitDate'}]}
                                ]},
                                {tag: 'td', components: [
                                    {name: 'new_txtVisitDate', kind: 'oarn.DatePicker', width: '95%',
                                        classes: 'oarn-control', onSelect: 'goInput', emptyIsValid: false}
                                ]},
                            ]},
                            {tag: 'tr', components: [
                                {tag: 'td', components: [
                                    {tag: 'label', content: 'Service Minutes:',
                                        classes: 'oarn-control oarn-groupbox-control',
                                        attributes: [{'for': 'new_txtServiceMinutes'}]}
                                ]},
                                {tag: 'td', components: [
                                    {name: 'new_txtServiceMinutes', kind: 'enyo.Input', style: 'width: 95%',
                                        classes: 'oarn-control',
                                        attributes: [{'maxlength': 4}, {'type': 'number'},
                                            {'min': 0}, {'max': 1440}]}
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
            watchSelectReturned: ['visitorsReturned', 'locationsReturned']
        },

        /**
         * @private
         */
        events: {
            onAjaxError: '',

            onAjaxStarted: '',

            onAjaxFinished: '',

            onLocationOptionsReturned: '', // handled locally

            onVisitorOptionsReturned: '', // handled locally

            onDirtyStateChanged: ''
        },

        /**
         * @private
         */
        handlers: {
            onLocationOptionsReturned: 'locationOptionsReturnedHandler',

            onVisitorOptionsReturned: 'visitorOptionsReturnedHandler',

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
            var endpoint = 'api/v1/family/home-visit/?family_id='+ this.get('.selectedFamilyID');
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
                    'home_visit_id': inResponse['results'][i]['home_visit_id'],
                    'person': inResponse['results'][i]['person'],
                    'ref_home_visit_location': inResponse['results'][i]['ref_home_visit_location'],
                    'visit_date': inResponse['results'][i]['visit_date'],
                    'service_minutes': inResponse['results'][i]['service_minutes'],
                    'visit_notes': inResponse['results'][i]['visit_notes'],
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

        goNewVisit: function (inSender, inEvent) {
            this.$.newRecordPopup.show();
        },

        closeNewRecord: function (inSender, inEvent) {
            this.$.newRecordPopup.hide();
        },

        saveNewRecord: function (inSender, inEvent) {
            var testDate = null;
            var visitDate = null;
            if (!Number.isNaN(Date.parse(this.$.new_txtVisitDate.getValue()))) {
                testDate = new Date(this.$.new_txtVisitDate.getValue()).toISOString();
                visitDate = moment(testDate).format('YYYY-MM-DD');
            }

            if (visitDate == null) {
                this.$.popupFactory.showInfo('Invalid Data', 'A visit date is required.');
                return;
            }

            var testMinutes = this.$.new_txtServiceMinutes.getValue();
            if (Number.isNaN(parseInt(testMinutes))) {
                this.$.popupFactory.showInfo('Invalid Data', 'The service minutes must be a number greater than 0');
                return;
            }

            if (testMinutes > 1440 || testMinutes < 0) {
                this.$.popupFactory.showInfo('Invalid Data', 'The service minutes must be between 0 and 1440');
                return;
            }

            var postBody = {
                "family": this.get('.selectedFamilyID'),
                "person": this.$.new_selectVisitor.getValue(),
                "ref_home_visit_location": this.$.new_selectLocation.getValue(),
                "visit_date": visitDate,
                "service_minutes": testMinutes
            }

            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'POST');
            var endpoint = 'api/v1/family/home-visit/';
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.postBody = postBody;

            this.doAjaxStarted();
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'postResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));
        },

        postResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            this.$.popupFactory.showSimple('New home visit record created');

            this.$.new_selectVisitor.setSelected(0);
            this.$.new_selectLocation.setSelected(0);
            this.$.new_txtVisitDate.setValue(null);
            this.$.new_txtServiceMinutes.setValue(null);

            this.refreshData();
        },

        selectedFamilyIDChanged: function (oldVal) {
            if (this.visitor_options_list.length == 0 || this.locations_options_list.length == 0) {
                // if no data for the dropdowns, start those fetch requests and let them
                // call the main refresh routine when complete.
                if (this.get('.selectedFamilyID') > 0) {
                    this.set('.visitorsReturned', false);
                    this.set('.locationsReturned', false);
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
            if (this.get('.locationsReturned') && this.get('.visitorsReturned')) {
                this.$.new_selectVisitor.options_list.empty();
                this.$.new_selectVisitor.options_list.add(this.visitor_options_list);

                this.$.new_selectLocation.options_list.empty();
                this.$.new_selectLocation.options_list.add(this.locations_options_list);

                this.refreshData(); // load a fresh batch of languages for this person record.
            }
        },

        loadSelectData: function () {
            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'GET');
            var endpoint = 'api/v1/ref/home-visit-locations/';
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processLocationsResponse'));
            ajax.error(enyo.bindSafely(this, 'processError')); // we can share error handling

            this.doAjaxStarted(); // let a parent control turn on a spinner, etc.

            var endpoint = 'api/v1/program/family/person/?staff_only=true&limit=500';
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processVisitorsResponse'));
            ajax.error(enyo.bindSafely(this, 'processError')); // we can share error handling

            this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
        },

        processLocationsResponse: function (inRequest, inResponse) {
            var details = [];
            details.push({value: null, display_text: ''}); // let the user select a null row.

            for (var i = 0; i < inResponse['results'].length; i++) {
                if (inResponse['results'][i] !== undefined) {
                    var detail = {
                        value: inResponse['results'][i]['ref_home_visit_location_id'],
                        display_text: inResponse['results'][i]['description']
                    };
                    details.push(detail);
                }

            }
            this.locations_options_list = details;
            this.doLocationOptionsReturned();
        },

        processVisitorsResponse: function (inRequest, inResponse) {
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
            this.visitor_options_list = details;
            this.doVisitorOptionsReturned();
        },

        locationOptionsReturnedHandler: function (inSender, inEvent) {
            this.set('.locationsReturned', true);
            return true;
        },

        visitorOptionsReturnedHandler: function (inSender, inEvent) {
            this.set('.visitorsReturned', true);
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

            var visitor_index = 0;
            var visitor_value = this.collection.at(inEvent.index).get('person');
            for (var i = 0; i < this.visitor_options_list.length; i++){
                if (this.visitor_options_list[i]['value'] == visitor_value) {
                    visitor_index = i;
                }
            }

            var location_index = 0;
            var location_value = this.collection.at(inEvent.index).get('ref_home_visit_location');
            for (var i = 0; i < this.locations_options_list.length; i++){
                if (this.locations_options_list[i]['value'] == location_value) {
                    location_index = i;
                }
            }

            var visitDate = null;
            if (this.collection.at(inEvent.index).get('visit_date') != null) {
                visitDate = moment(this.collection.at(inEvent.index).get(
                    'visit_date'),'YYYY-MM-DD').format('MM/DD/YYYY');
            }

            item.$.lblHomeVisitID.setValue(this.collection.at(inEvent.index).get('home_visit_id'));

            if (this.collection.at(inEvent.index).get('read_only')) {
                item.$.selectVisitor.hide();
                item.$.selectLocation.hide();
                item.$.txtVisitDate.hide();
                item.$.txtServiceMinutes.hide();

                item.$.lblVisitor.show();
                item.$.lblLocation.show();
                item.$.lblVisitDate.show();
                item.$.lblServiceMinutes.show();

                item.$.deleteButton.hide();

                item.$.lblVisitor.setValue(this.visitor_options_list[visitor_index].display_text);
                item.$.lblLocation.setValue(this.locations_options_list[location_index].display_text);
                item.$.lblVisitDate.setValue(visitDate);
                item.$.lblServiceMinutes.setValue(this.collection.at(inEvent.index).get('service_minutes'));
            }
            else {
                item.$.selectVisitor.show();
                item.$.selectLocation.show();
                item.$.txtVisitDate.show();
                item.$.txtServiceMinutes.show();

                item.$.lblVisitor.hide();
                item.$.lblLocation.hide();
                item.$.lblVisitDate.hide();
                item.$.lblServiceMinutes.hide();

                item.$.deleteButton.show();

                item.$.selectVisitor.selectedIndex = visitor_index;
                item.$.selectVisitor.options_list.empty();
                item.$.selectVisitor.options_list.add(this.visitor_options_list);

                item.$.selectLocation.selectedIndex = location_index;
                item.$.selectLocation.options_list.empty();
                item.$.selectLocation.options_list.add(this.locations_options_list);

                item.$.txtVisitDate.setValue(visitDate);
                item.$.txtServiceMinutes.setValue(this.collection.at(inEvent.index).get('service_minutes'));
            }

            return true;
        },

        goInput: function (inSender, inEvent) {
            if (inEvent.index != undefined) {
                var item = this.$.repeater.itemAtIndex(inEvent.index);

                if (inEvent.originator.name == 'selectVisitor') {
                    this.collection.at(inEvent.index).set('person', item.$.selectVisitor.getValue());
                }
                else if (inEvent.originator.name == 'selectLocation') {
                    this.collection.at(inEvent.index).set('ref_home_visit_location', item.$.selectLocation.getValue());
                }
                else if (inEvent.originator.name == 'txtVisitDate') {
                    var visitDate = null;
                    if (this.collection.at(inEvent.index).get('visit_date') != null) {
                        visitDate = moment(item.$.txtVisitDate.getValue(),'MM/DD/YYYY').format('YYYY-MM-DD');
                    }
                    this.collection.at(inEvent.index).set('visit_date', visitDate);
                }
                else if (inEvent.originator.name == 'txtServiceMinutes') {
                    this.collection.at(inEvent.index).set('service_minutes', item.$.txtServiceMinutes.getValue());
                }

                if (this.changed_row_indices.indexOf(inEvent.index) == -1) {
                    this.changed_row_indices.push(inEvent.index);
                }
            }
            else if (inEvent.originator.name == 'notes') {
                this.set('.notesDirty', true);
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

                        var visitDate = null;
                        if (!Number.isNaN(Date.parse(item.$.txtVisitDate.getValue()))) {
                            var testDate = new Date(item.$.txtVisitDate.getValue()).toISOString();
                            visitDate = moment(testDate).format('YYYY-MM-DD');
                        }

                        if (visitDate == null) {
                            return; // we can't save, but this is timed so no popup
                        }

                        var testMinutes = item.$.txtServiceMinutes.getValue();
                        if (Number.isNaN(parseInt(testMinutes))) {
                            return; // can't save...
                        }

                        if (testMinutes > 1440 || testMinutes < 0) {
                            return; // can't save
                        }

                        var postBody = null;
                        if (i == this.get('.notesIndex')) {
                            postBody = {
                                'family': this.get('.selectedFamilyID'),
                                'person': item.$.selectVisitor.getValue(),
                                'ref_home_visit_location': item.$.selectLocation.getValue(),
                                'visit_date': visitDate,
                                'service_minutes': testMinutes,
                                'visit_notes': this.$.notes.getValue()
                            };

                            this.collection.at(this.changed_row_indices[i]).set('visit_notes', this.$.notes.getValue());
                        }
                        else {
                            postBody = {
                                'family': this.get('.selectedFamilyID'),
                                'person': item.$.selectVisitor.getValue(),
                                'ref_home_visit_location': item.$.selectLocation.getValue(),
                                'visit_date': visitDate,
                                'service_minutes': testMinutes
                            };
                        }

                        var pk = this.collection.at(this.changed_row_indices[i]).get('home_visit_id');

                        this.set('.api.token', this.get('.token'));
                        this.set('.api.method', 'PATCH');
                        var endpoint = 'api/v1/family/home-visit/' + pk + '/';
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

        visitSelected: function (inSender, inEvent) {
            if (!this.notesDirty && this.notesIndex != inEvent.index) {
                this.notesIndex = inEvent.index;

                this.$.notesGroupbox.show();
                this.$.headerNotes.setContent('Home visit notes for visit ID: ' +
                    this.collection.at(inEvent.index).get('home_visit_id'));

                if (this.collection.at(inEvent.index).get('visit_notes') != null) {
                    this.$.notes.setValue(this.collection.at(inEvent.index).get('visit_notes'));
                }
                else {
                    this.$.notes.setValue('');
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

        goDelete: function (inSender, inEvent) {
            var msg = 'Clicking \'Yes\' will permanently delete this home visit record and ' +
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

                    var pk = this.collection.at(this.get('.currentIndex')).get('home_visit_id');

                    this.set('.api.token', this.get('.token'));
                    this.set('.api.method', 'DELETE');
                    var endpoint = 'api/v1/family/home-visit/' + pk + '/';
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
                    this.$.headerNotes.setContent('Home visit notes for visit: ' +
                        this.collection.at(this.notesIndex).get('home_visit_id'));

                    this.$.notes.setValue(this.collection.at(this.notesIndex).get('visit_notes'));
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
            enyo.log('deleteResponse: currentIndex = ' + index);
            enyo.log('deleteResponse: notesIndex = ' + this.get('.notesIndex'));

            if (this.get('.notesIndex') == this.get('.currentIndex')) {
                this.$.notesGroupbox.hide();
                this.set('.notesIndex', -1);
            }

            enyo.log('changed_row_indices:' + this.changed_row_indices);
            if (this.changed_row_indices.indexOf(index) > -1) {
                this.changed_row_indices.splice(this.changed_row_indices.indexOf(index), 1);
            }

            enyo.log('changed_row_indices:' + this.changed_row_indices);
            if (this.changed_row_indices.length == 0) {
                enyo.log('stopping save...')
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
