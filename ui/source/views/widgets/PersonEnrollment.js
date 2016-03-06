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
        name: 'oarn.PersonEnrollment',

        person_options_list: [],

        published: {

            api: null,

            token: null,

            selectedOrganization: null,

            currentOrgReadOnly: false,

            currentOrgReadWrite: false,

            currentOrgAdmin: false,

            selectedFamilyID: -1,

            selectedFamilyEnrollmentID: -1
        },

        components: [
            {name: 'mainDisplay', kind: 'onyx.Groupbox', style: 'max-width:600px;', showing: false,
                components: [
                {kind: 'onyx.GroupboxHeader', components: [
                    {content: 'Individual Program Enrollment', classes: 'oarn-header',	tag:'span'},
                    {kind: 'onyx.TooltipDecorator', style: 'display: inline; float:right', components: [
                        {name: 'newButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
                            src: 'static/assets/blue-add.png', ontap: 'goNewProgram'},
                        {kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
                            content: 'Enroll a family member in this program.'}
                    ]},
                ]},
                {name: 'noResultsRow', content: 'No Individual Enrollment Records Found',
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
                                        {tag: 'td', classes: 'oarn-groupbox-td-header',
                                            content: 'Family Member'},
                                        {tag: 'td', content: 'Open Date', classes: 'oarn-groupbox-td-header'},
                                        {tag: 'td', content: 'Close Date', classes: 'oarn-groupbox-td-header'}
                                    ]},
                                {tag: 'tr', components: [
                                    {tag: 'td', components: [
                                        {name: 'selectFamilyMember', kind: 'oarn.DataSelect', style: 'max-width: 225px',
                                            classes: 'oarn-control oarn-groupbox-control'},
                                        {name: 'lblFamilyMember', kind: 'enyo.Input', style: 'width: 225px',
                                            classes: 'oarn-control oarn-groupbox-control',
                                            disabled: true, showing: false}
                                    ]},
                                    {tag: 'td', components: [
                                        {name: 'txtOpenDate', kind: 'oarn.DatePicker', width: '95%',
                                            classes: 'oarn-control', onSelect: 'goInput', emptyIsValid: false},
                                        {name: 'lblOpenDate', kind: 'enyo.Input', attributes: [{'readonly': true}],
                                            style: 'width: 95%', showing: false},
                                    ]},
                                    {tag: 'td', components: [
                                        {name: 'txtCloseDate', kind: 'oarn.DatePicker', width: '95%',
                                            classes: 'oarn-control', onSelect: 'goInput', emptyIsValid: true},
                                        {name: 'lblCloseDate', kind: 'enyo.Input', attributes: [{'readonly': true}],
                                            style: 'width: 95%', showing: false},
                                    ]},
                                    {tag: 'td', components: [
                                        {name: 'deleteButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
                                            src: 'static/assets/blue-delete.png', ontap: 'goDelete'}
                                    ]},
                                    {tag: 'td', components: [
                                        {name: 'saveButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
                                            src: 'static/assets/save-small.png', ontap: 'goSave'}
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
                        {kind: 'onyx.GroupboxHeader', content: 'New Individual Enrollment Record'},
                        {tag: 'table', components: [
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
                                    {tag: 'label', content: 'Open Date:',
                                        classes: 'oarn-control oarn-groupbox-control',
                                        attributes: [{'for': 'new_txtOpenDate'}]}
                                ]},
                                {tag: 'td', components: [
                                    {name: 'new_txtOpenDate', kind: 'oarn.DatePicker', width: '95%',
                                        classes: 'oarn-control', onSelect: 'goInput', emptyIsValid: false}
                                ]},
                            ]},
                            {tag: 'tr', components: [
                                {tag: 'td', components: [
                                    {tag: 'label', content: 'Close Date:',
                                        classes: 'oarn-control oarn-groupbox-control',
                                        attributes: [{'for': 'new_txtCloseDate'}]}
                                ]},
                                {tag: 'td', components: [
                                    {name: 'new_txtCloseDate', kind: 'oarn.DatePicker', width: '95%',
                                        classes: 'oarn-control', onSelect: 'goInput', emptyIsValid: true
                                    }
                                ]},
                            ]}
                        ]},
                        {name: 'buttonsRow', style: 'text-align: center; padding-top:5px',
                            components: [
                                {name: 'btnClose', kind: 'onyx.Button', content: 'Close',
                                    style: 'margin: 5px 5px 5px 5px',	ontap: 'closeNewRecord'},
                                {name: 'btnCreate', kind: 'onyx.Button', content: 'Create Record',
                                    ontap: 'createNewRecord', style: 'margin: 5px 5px 5px 5px',
                                    classes: 'onyx-affirmative'}
                            ]}
                    ]}
            ]},

            {name: 'popupFactory', kind: 'oarn.PopupFactory'}
        ],

        events: {
            onAjaxError: '',

            onAjaxStarted: '',

            onAjaxFinished: '',

            onPersonOptionsReturned: '' // handled locally
        },

        handlers: {
            onPersonOptionsReturned: 'personOptionsReturnedHandler',

            onPopupClosed: 'popupClosedHandler'

        },

        create: function () {
            this.inherited(arguments);
            this.api = new oarn.API();
        },

        rendered: function () {
            this.inherited(arguments);

            if (this.get('.currentOrgReadOnly')) {
                this.$.newButton.hide();
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

        selectedFamilyIDChanged: function (inOldVal) {
            this.loadSelectData();
        },

        selectedFamilyEnrollmentIDChanged: function (inOldVal) {
            if (this.get('.selectedFamilyEnrollmentID') !== -1) {
                this.$.mainDisplay.show();
                this.refreshData();
            } else {
                this.$.mainDisplay.hide();
            }
        },

        personOptionsReturnedHandler: function (inSender, inEvent) {
            this.$.new_selectFamilyMember.options_list.empty();
            this.$.new_selectFamilyMember.options_list.add(this.person_options_list);
        },

        loadSelectData: function () {
            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'GET');
            var endpoint = 'api/v1/family/adult-search/?family_id=' + this.get('.selectedFamilyID');
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processSelectResponse'));
            ajax.error(enyo.bindSafely(this, 'processError')); // we can share error handling

            this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
        },

        processSelectResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

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
            this.person_options_list = details;
            this.doPersonOptionsReturned();
        },

        refreshData: function () {
            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'GET');
            var endpoint = 'api/v1/program/person-enrollment/?family_enrollment_id='+
                this.get('.selectedFamilyEnrollmentID');
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
                    "person_enrollment_id": inResponse['results'][i]['person_enrollment_id'],
                    "family_enrollment": inResponse['results'][i]['family_enrollment'],
                    "person": inResponse['results'][i]['person'],
                    "open_date": inResponse['results'][i]['open_date'],
                    "close_date": inResponse['results'][i]['close_date'],
                    "read_only": inResponse['results'][i]['read_only']
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

        goNewProgram: function (inSender, inEvent) {
            this.$.newRecordPopup.show();
        },

        closeNewRecord: function () {
            this.$.newRecordPopup.hide();
        },

        createNewRecord: function () {
            var testDate = null;
            var openDate = null;
            if (!Number.isNaN(Date.parse(this.$.new_txtOpenDate.getValue()))) {
                testDate = new Date(this.$.new_txtOpenDate.getValue()).toISOString();
                openDate = moment(testDate).format('YYYY-MM-DD');
            }

            if (openDate == null) {
                this.$.popupFactory.showInfo('Invalid Data', 'An open date is required.');
                return;
            }

            var closeDate = null;
            if (!Number.isNaN(Date.parse(this.$.new_txtCloseDate.getValue()))) {
                testDate = new Date(this.$.new_txtCloseDate.getValue()).toISOString();
                closeDate = moment(testDate).format('YYYY-MM-DD');
            }

            var postBody = {
                "family_enrollment": this.get('.selectedFamilyEnrollmentID'),
                "person": this.$.new_selectFamilyMember.getValue(),
                "open_date": openDate,
                "close_date": closeDate
            }

            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'POST');
            var endpoint = 'api/v1/program/person-enrollment/';
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.postBody = postBody;

            this.doAjaxStarted();
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'postResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));
        },

        postResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            this.$.popupFactory.showSimple('New family member enrollment record created');

            this.$.new_selectFamilyMember.setSelected(0);
            this.$.new_txtOpenDate.setValue(null);
            this.$.new_txtCloseDate.setValue(null);

            this.refreshData();
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
            var family_member_value = this.collection.at(inEvent.index).get('person');
            for (var i = 0; i < this.person_options_list.length; i++){
                if (this.person_options_list[i]['value'] == family_member_value) {
                    family_member_index = i;
                }
            }

            var openDate = null;
            var closeDate = null;
            if (this.collection.at(inEvent.index).get('open_date') != null) {
                openDate = moment(this.collection.at(inEvent.index).get('open_date'),'YYYY-MM-DD').format('MM/DD/YYYY');
            }
            if (this.collection.at(inEvent.index).get('close_date') != null) {
                closeDate = moment(this.collection.at(inEvent.index).get('close_date'),
                    'YYYY-MM-DD').format('MM/DD/YYYY');
            }

            if (this.collection.at(inEvent.index).get('read_only')) {
                item.$.selectFamilyMember.hide();
                item.$.txtOpenDate.hide();
                item.$.txtCloseDate.hide();

                item.$.lblFamilyMember.show();
                item.$.lblOpenDate.show();
                item.$.lblCloseDate.show();

                item.$.saveButton.hide();
                item.$.deleteButton.hide();

                item.$.lblFamilyMember.setValue(this.person_options_list[family_member_index].display_text);
                item.$.lblOpenDate.setValue(openDate);
                item.$.lblCloseDate.setValue(closeDate);
            }
            else {
                item.$.selectFamilyMember.show();
                item.$.txtOpenDate.show();
                item.$.txtCloseDate.show();

                item.$.lblFamilyMember.hide();
                item.$.lblOpenDate.hide();
                item.$.lblCloseDate.hide();

                item.$.saveButton.show();
                item.$.deleteButton.show();

                item.$.selectFamilyMember.selectedIndex = family_member_index;
                item.$.selectFamilyMember.options_list.empty();
                item.$.selectFamilyMember.options_list.add(this.person_options_list);

                item.$.txtOpenDate.setValue(openDate);
                item.$.txtCloseDate.setValue(closeDate);
            }
        },

        goSave: function (inSender, inEvent) {
            var item = this.$.repeater.itemAtIndex(inEvent.index);

            var testDate = null;
            var openDate = null;
            if (!Number.isNaN(Date.parse(item.$.txtOpenDate.getValue()))) {
                testDate = new Date(item.$.txtOpenDate.getValue()).toISOString();
                openDate = moment(testDate).format('YYYY-MM-DD');
            }

            if (openDate == null) {
                this.$.popupFactory.showInfo('Invalid Data', 'An open date is required.');
                return;
            }

            var closeDate = null;
            if (!Number.isNaN(Date.parse(item.$.txtCloseDate.getValue()))) {
                testDate = new Date(item.$.txtCloseDate.getValue()).toISOString();
                closeDate = moment(testDate).format('YYYY-MM-DD');
            }

            var postBody = {
                "family_enrollment": this.get('.selectedFamilyEnrollmentID'),
                "person": item.$.selectFamilyMember.getValue(),
                "open_date": openDate,
                "close_date": closeDate
            }

            var pk = this.collection.at(inEvent.index).get('person_enrollment_id');

            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'PATCH');
            var endpoint = 'api/v1/program/person-enrollment/' + pk + '/';
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.postBody = postBody;

            this.doAjaxStarted();
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'patchResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));
        },

        patchResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.
            this.$.popupFactory.showSimple('Changes Saved');
        },

        goDelete: function (inSender, inEvent) {
            var msg = 'Clicking \'Yes\' will permanently delete this family member enrollment record and ' +
                'cannot be undone. Continue?';

            this.set('.currentIndex', inEvent.index);
            this.$.popupFactory.showConfirm('Confirm Delete', msg);
        },

        /**
         * We need to wait for a confirmation popup to close before proceeding with
         * a delete operation. To do this the popup emits an event on closing that is
         * then handled here. We check that it was a delete confirmation by verifying
         * that 'confirmed' is defined in inEvent.
         *
         * @private
         * @param inSender
         * @param inEvent
         */
        popupClosedHandler: function (inSender, inEvent) {

            if ((inEvent.confirmed === undefined) || (inEvent.confirmed === false)) {
                return; // we only want to take action if a delete confirmation has occurred
            }
            else if ((inEvent.confirmed) && (this.get('.currentIndex') > -1)) {

                var pk = this.collection.at(this.get('.currentIndex')).get('person_enrollment_id')

                this.set('.api.token', this.get('.token'));
                this.set('.api.method', 'DELETE');
                var endpoint = 'api/v1/program/person-enrollment/' + pk + '/';
                var ajax = this.api.getAjaxObject(endpoint);

                this.doAjaxStarted();
                ajax.go();
                ajax.response(enyo.bindSafely(this, 'deleteResponse'));
                ajax.error(enyo.bindSafely(this, 'processError'));
            }

            return true;
        },


        /**
         * After a successful delete operation, clear the controls and reset variables.
         * @param inRequest
         * @param inResponse
         */
        deleteResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.
            this.set('.currentIndex', -1); // clear the current index into the repeater.
            this.refreshData();
        }
    })

})(enyo, this);