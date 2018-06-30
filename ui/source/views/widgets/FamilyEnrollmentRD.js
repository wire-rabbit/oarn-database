//  The OARN Relief Nursery Database
//  Copyright (C) 2015-2017 Oregon Association of Relief Nurseries
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

		name: 'oarn.FamilyEnrollmentRD',

		published: {

			api: null,

			token: null,

			selectedOrganization: null,

			currentOrgReadOnly: false,

			currentOrgReadWrite: false,

			currentOrgAdmin: false,

			selectedFamilyID: -1,

			selectedFamilyEnrollmentID: -1,

			selectedProgramID: -1
		},

		components: [
			{name: 'repeaterDisplay', kind: 'oarn.RepeaterDisplay', style: 'padding: 5px 5px 5px 5px;'},
			{name: 'selectHelper', kind: 'oarn.SelectHelper'},
			{name: 'popupFactory', kind: 'oarn.PopupFactory'},
            {name: 'closeFamilyPopup', kind: 'onyx.Popup', centered: true, modal: true, floating: true, autoDismiss: false,
                scrim: true, style: 'background-color: #EAEAEA',
                components: [
                    {kind: 'onyx.Groupbox', style: 'width: 400px;', components: [
                        {kind: 'onyx.GroupboxHeader', content: 'Close Family Enrollment', class: 'oarn-groupbox-control'},
                        {tag: 'table', classes: 'oarn-control oarn-groupbox-control', components: [
                            {tag: 'tr', components: [
                                {tag: 'td', attributes: [{'colspan':'2'}], components: [
                                    {tag: 'p', style: 'padding: 0 15px; margin: 5px 0;', 
                                     content: "Use this tool to close all open family, individual, and service-level enrollments " + 
                                              "as well as classroom assignments as of a single date."}
                                ]}
                            ]},
                            {tag: 'tr', components: [
                                {tag: 'td', components: [{tag: 'label', content: 'Close Date:',
                                        attributes:[{'for':'txtCloseDate'}], classes: 'oarn-control oarn-groupbox-control'}]},
                                {tag: 'td', components: [{name: 'txtCloseDate', kind: 'oarn.DatePicker',
                                        emptyIsValid: false, width: '95%', classes: 'oarn-control oarn-groupbox-control'}]}
                            ]},
                            
                            {tag: 'tr', components: [
                                {tag: 'td', style: 'min-width: 200px;', components: [
                                    {tag: 'label', style: 'width: 125px;', content: 'Close Family Enrollment:'}
                                ]},
                                {tag: 'td', components: [
                                    {name: 'chkCloseFamilyEnrollment', kind: 'enyo.Checkbox', checked: true}
                                ]}
                            ]},
                            {tag: 'tr', components: [
                                {tag: 'td', style: 'min-width: 200px;', components: [
                                    {tag: 'label', style: 'width 125px;', content: 'Family Enrollment Close Reason:'}
                                ]},
                                {tag: 'td', components: [
                                    {name: 'closeReason', kind: 'oarn.DataSelect'}
                                ]}
                            ]},
                            {tag: 'tr', components: [
                                {tag: 'td', style: 'min-width: 200px;', components: [
                                    {tag: 'label', style: 'width: 125px;', content: 'Close Service Level Enrollment:'}
                                ]},
                                {tag: 'td', components: [
                                    {name: 'chkCloseServiceLevelEnrollment', kind: 'enyo.Checkbox', checked: true}
                                ]}
                            ]},
                            {tag: 'tr', components: [
                                {tag: 'td', style: 'min-width: 200px;', components: [
                                    {tag: 'label', style: 'width: 125px;', content: 'Close Person Enrollment:'}
                                ]},
                                {tag: 'td', components: [
                                    {name: 'chkClosePersonEnrollment', kind: 'enyo.Checkbox', checked: true}
                                ]}
                            ]},
                            {tag: 'tr', components: [
                                {tag: 'td', style: 'min-width: 200px;', components: [
                                    {tag: 'label', style: 'width: 125px;', content: 'Close Classroom Assignments:'}
                                ]},
                                {tag: 'td', components: [
                                    {name: 'chkCloseClassroomAssignments', kind: 'enyo.Checkbox', checked: true}
                                ]}
                            ]},

                            {tag: 'tr', components: [
                                {tag: 'td', attributes: [{'colspan':'2'}], components: [
                                    {kind: 'onyx.Button', classes: 'onyx-affirmative', content: 'Close Family Enrollment',
                                     ontap: 'goCloseAllEnrollment', style: 'display: block; margin: 10px auto;'}
                                ]}
                            ]}
                        ]},
                        {name: 'infoButtonsRow', style: 'text-align: center; padding-top:5px',
                            components: [
                                {name: 'buttonsRow', 
                                components: [
                                    {name: 'btnClose', kind: 'onyx.Button', content: 'Cancel', style: 'margin: 5px 5px 5px 5px', 
                                     ontap: 'goClosePopup'}]
                                 },
                            ]},
                    ]}
                ]
            }
		],

        /**
         * @private
         */
        events: {
            onAjaxError: '',

            onAjaxStarted: '',

            onAjaxFinished: '',

            onRefreshFamilyDetails: '',
        },

		handlers: {
            onRowSelected: 'rowSelectedHandler',
			onRowDeleted: 'rowDeletedHandler',
            onChangeAlert: 'changeAlertHandler',
            onPopupClosed: 'popupClosedHandler',
            onRepeaterRendered: 'repeaterRenderedHandler',
            onRepeaterDebug: 'repeaterDebugHandler',
            onNewRecordCreated: 'newRecordCreatedHandler'
        },

		observers: [
            {method: 'isReady', path: ['selectedFamilyID', 'selectedOrganization']}
        ],

        create: function() {
            this.inherited(arguments);
            this.api = new oarn.API();
        },

        /**
         * Wait for selectedFamilyID and selectedOrganization to be set before building controls.
         *
         * @private
         */
        isReady: function (previous, current, property) {
            if (this.get('.selectedFamilyID') != -1 && (this.get('selectedOrganization') != null)) {
                this.defineRepeaterDisplay();
            }
            return true;
        },

        defineRepeaterDisplay: function () {
            this.$.repeaterDisplay.set('.groupboxHeaderText', 'Family Enrollment');
            this.$.repeaterDisplay.set('.newRecordHeaderText', 'New Family Enrollment Record');
            this.$.repeaterDisplay.set('.hasSimpleSelectButton', true);
            this.$.repeaterDisplay.set('.altSelectSave', true);

            // Set up 'close family' link button and inject it into the repeater's header: 
            this.$.repeaterDisplay.$.header.createComponent(
                {tag: 'a', 
                    attributes: [{"href":"#"}], content: "Close Family", 
                    ontap: 'goCloseFamily',
                    style: "display: inline; float: right; color: white; margin: 0.5em 2em; font-size: smaller;",
                },
                {owner: this}
            );
            this.$.repeaterDisplay.$.header.render();

            this.$.repeaterDisplay.selectEndpoints = [
                {
                    endpoint: 'api/v1/ref/programs/',
                    name: 'programs',
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/close-reasons/',
                    name: 'closeReasons',
                    parseWith: this.$.selectHelper.parseGenericRefTable,
                    nullRow: true
                },
                {
                    endpoint: 'api/v1/organization/locations/?organization_id=' +
                        this.get('.selectedOrganization.organization_id'),
                    name: 'locations',
                    parseWith: this.$.selectHelper.parseOrgLocation,
                    nullRow: true
                }
            ];

            this.$.repeaterDisplay.staticPostFields = [
                {fieldName: 'family', value: this.get('.selectedFamilyID')}
            ];

            this.$.repeaterDisplay.fields = [
            	{
                    fieldName: 'family',
                    postBodyOnly: true
                },
                {
                    fieldName: 'family_enrollment_id',
                    postBodyOnly: true,
                    primaryKey: true
                },
                {
                    fieldName: 'ref_program',
                    nested_id_name: 'ref_program_id',
                    fieldType: 'DataSelect',
                    dataSelectName: 'programs',
                    headerText: 'Program',
                    labelText: 'Program',
                    fieldWidth: 150,
                    alertOnChange: true
                },
                {
                	fieldName: 'location',
                	fieldType: 'DataSelect',
                	dataSelectName: 'locations',
                	headerText: 'Location',
                	labelText: 'Location',
                	fieldWidth: 90
                },
                {
                    fieldName: 'open_date',
                    fieldType: 'DatePicker',
                    headerText: 'Open Date',
                    labelText: 'Open Date',
                    fieldWidth: 110,
                    emptyIsValid: false
                },
                {
                    fieldName: 'close_date',
                    fieldType: 'DatePicker',
                    headerText: 'Close Date',
                    labelText: 'Close Date',
                    fieldWidth: 110,
                    emptyIsValid: true
                },
                {
                    fieldName: 'close_reason',
                    fieldType: 'DataSelect',
                    dataSelectName: 'closeReasons',
                    headerText: 'Close Reason',
                    labelText: 'Close Reason',
                    fieldWidth: 120
                }
            ];

            this.$.repeaterDisplay.deleteMessage = 'Deleting the family enrollment record will also delete any ' +
                'linked person enrollment or service level enrollment records linked to it. Continue anyway?';

            this.$.repeaterDisplay.endpoint = 'api/v1/program/family-enrollment-full/?family_id=' +
                this.get('.selectedFamilyID');
            this.$.repeaterDisplay.patchEndpoint = 'api/v1/program/family-enrollment/';
            this.$.repeaterDisplay.postEndpoint = 'api/v1/program/family-enrollment/';
            this.$.repeaterDisplay.deleteEndpoint = 'api/v1/program/family-enrollment/';

            this.$.repeaterDisplay.allowsNewRecords = !(this.get('.currentOrgReadOnly'));

            this.$.repeaterDisplay.set('maxWidth', 720);

            this.$.repeaterDisplay.createRepeater();

            this.set('.repeaterInitialized', true);

        },


        rowSelectedHandler: function (inSender, inEvent) {
        	this.set('.selectedFamilyEnrollmentID',
				this.$.repeaterDisplay.collection.at(inEvent.index).get('family_enrollment_id')
			);

            this.set('.selectedRowIndex', inEvent.index);


            var new_program_id = this.$.repeaterDisplay.collection.at(inEvent.index).get('ref_program');
            if (typeof new_program_id === 'object') {
                this.set('.selectedProgramID', new_program_id.ref_program_id);
            } else {
                this.set('.selectedProgramID', new_program_id);
            }
            
            //enyo.log('FamilyEnrollmentRD - rowSelectedHandler. Sets selectedFamilyEnrollmentID = ' + this.get('.selectedFamilyEnrollmentID') + 
            //    ' - selectedProgramID = ' + this.get('.selectedProgramID'));

            return true;
        },

        // Adding a new record removes the active selection but does not hide the service level and
        // individual enrollment, so this re-selects the last row that was selected.
        refreshRowSelection: function () {
            // Get the previously selected row by ID:
            var i = 0;
            var enrollmentID = -1;
            while (this.$.repeaterDisplay.$.repeater.itemAtIndex(i) != undefined) {
                enrollmentID = this.$.repeaterDisplay.collection.at(i).get('family_enrollment_id');
                if (enrollmentID == this.get('.selectedFamilyEnrollmentID')) {
                    this.$.repeaterDisplay.$.repeater.itemAtIndex(i).$.itemRow.addClass('oarn-selected-row');
                } else {
                    this.$.repeaterDisplay.$.repeater.itemAtIndex(i).$.itemRow.removeClass('oarn-selected-row');
                }
                i++;
            }
        },

        newRecordCreatedHandler: function (inSender, inEvent) {
            this.refreshRowSelection();
            return true;
        },

        unselectRow: function () {
            this.$.repeaterDisplay.set('.selectedRowIndex', -1);
            this.set('.selectedFamilyEnrollmentID', -1);
            this.refreshRowSelection();
        },

        rowDeletedHandler: function (inSender, inEvent) {
            this.unselectRow();
            return true;
        },

        changeAlertHandler: function (inSender, inEvent) {
            // The program dropdown has changed:
            if (inEvent.fieldName === 'ref_program') {
                var ref_program_id = -1;
                var detail = inEvent.model.get('ref_program');
                if (typeof detail === 'object') {
                    ref_program_id = +detail.ref_program_id;
                } else {
                    ref_program_id = +detail;
                } 

                this.$.repeaterDisplay.pauseSaveTimer();
                var msg = 'Changing the program will delete any service level records' +
                    ' linked to this family enrollment record. Continue anyway?';
                this.confirmPopupMode = 'programChange';
                this.changedSelectField = inEvent.control;
                this.changedRowIndex = inEvent.index;
                this.$.popupFactory.showConfirm('Confirm Program Change', msg);       
            }

            return true;
        },

        popupClosedHandler: function (inSender, inEvent) {
            if (this.confirmPopupMode === 'programChange') {
                // Restart auto-save timer 
                this.$.repeaterDisplay.startSaveTimer();
                if ((inEvent.confirmed === undefined) || (inEvent.confirmed === false)) {
                    // Declined: We need to roll back the selected program to the previous value.
                    this.changedSelectField.setSelectedItem(this.program_list[this.changedRowIndex]);
                    this.set('.confirmPopupMode', '');
                    return true; // we only want to take action if a change confirmation has occurred
                } else {
                    // Set the program_list array to the new value, so future rollbacks work
                    this.setProgramList();
                    var new_program_id = this.$.repeaterDisplay.collection.at(this.changedRowIndex).get('ref_program');
                    if (typeof new_program_id === 'object') {
                        this.set('.selectedProgramID', new_program_id.ref_program_id);
                    } else {
                        this.set('.selectedProgramID', new_program_id);
                    }
                    this.unselectRow();
                    this.set('.confirmPopupMode', '');
                    this.$.repeaterDisplay.goSaveChanges();
                    return true;
                }
            } else if (this.confirmPopupMode === 'closedFamily') {
                this.set('.confirmPopupMode', '');
                this.doRefreshFamilyDetails();
            }

            return true;
        },

        repeaterRenderedHandler: function (inSender, inEvent) {
            // Because changing programs has side effects, we need to be able to roll back changes if the
            // user declines. To facilitate this, when the repeater first renders, we grab a list of the 
            // current values.
            
            // Set up the dropdown for family close reason in the popup:
            this.$.closeReason.options_list.empty();
            this.$.closeReason.options_list.add(this.$.repeaterDisplay.$.selectHelper.optionsLists['closeReasons_options_list']);

            this.setProgramList(); 
            return true;
        },

        /**
         * Sets the program_list array to the current set of displayed selected programs.
         * 
         * @private
         */
        setProgramList: function() {
            this.program_list = [];
            for (var i = 0; i < this.$.repeaterDisplay.collection.length; i++) {
                var rp = this.$.repeaterDisplay.collection.at(i).get('ref_program');
                if (typeof rp === 'object') {
                    this.program_list.push(rp.ref_program_id);
                } else if (typeof rp === 'string') {
                    this.program_list.push(+rp);
                }
            }
        },

        goCloseFamily: function() {
            this.$.closeFamilyPopup.show();
        },

        goClosePopup: function() {
            this.$.closeFamilyPopup.hide();
        },

        goCloseAllEnrollment: function() {

            var close_date = this.$.txtCloseDate.getValue();
            var post_close_date = null;
            if (!Number.isNaN(Date.parse(close_date))) {
                var testDate = new Date(close_date).toISOString();
                post_close_date = moment(testDate).format('YYYY-MM-DD');
            }

            var close_family_enrollment = this.$.chkCloseFamilyEnrollment.getValue();
            
            var family_close_reason = this.$.closeReason.getValue();
            if (family_close_reason === '') {
                family_close_reason = null;
            }

            var close_service_level_enrollment = this.$.chkCloseServiceLevelEnrollment.getValue();
            var close_person_enrollment = this.$.chkClosePersonEnrollment.getValue();
            var close_classroom_assignment = this.$.chkCloseClassroomAssignments.getValue();

            var postBody = {
                "family_id": this.get('.selectedFamilyID'),
                "close_date": post_close_date,
                "close_family_enrollment": close_family_enrollment,
                "family_close_reason": family_close_reason,
                "close_service_level_enrollment": close_service_level_enrollment,
                "close_person_enrollment": close_person_enrollment,
                "close_classroom_assignment": close_classroom_assignment
            };

            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'PATCH');
            var endpoint = 'api/v1/program/close-enrollment/';
            var ajax = this.api.getAjaxObject(endpoint);
            
            ajax.postBody = postBody;

            this.doAjaxStarted();
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'postResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));
        },

        postResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.
            this.$.popupFactory.showSimple('Enrollment Records Closed');
            this.$.closeFamilyPopup.hide();
            this.set('.confirmPopupMode', 'closedFamily')
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

        repeaterDebugHandler: function(inSender, inEvent) {
            return true;
        }
	});

})(enyo, this);