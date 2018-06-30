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

		name: 'oarn.ServiceLevelEnrollmentRD',

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

        readyFlag: false, // controls the first load of the select data

        components: [
			{name: 'repeaterDisplay', kind: 'oarn.RepeaterDisplay', style: 'padding: 5px; max-width:500px;',  showing: false},
			{name: 'selectHelper', kind: 'oarn.SelectHelper'},
			{name: 'popupFactory', kind: 'oarn.PopupFactory'}
		],

		observers: [
            {method: 'isReady', path: ['selectedFamilyEnrollmentID', 'selectedProgramID', 'selectedOrganization']}
        ],

        handlers: {
        	onRepeaterRendered: 'repeaterRenderedHandler',
            onRepeaterDebug: 'repeaterDebugHandler'
        },

        create: function() {
        	this.inherited(arguments);
        	this.api = new oarn.API();
        },

        isReady: function (previous, current, property) {
            if (this.get('.selectedFamilyEnrollmentID') !== -1 
            		&& (this.get('selectedOrganization') !== null) 
            		&& (this.get('selectedProgramID') !== -1)
                    && (typeof this.get('selectedProgramID') !== 'undefined' )) {
            		
            	this.$.repeaterDisplay.changed_row_indices = [];

	            // We have the basic data we need about the selected family enrollment record
	            // and the associated program. Now we need to know if it contains service
	            // levels and only display the repeater if the answer is yes. We can do this
	            // by defining the repeater without showing it. Once that completes we can
	            // look into the select helper to see how many results were returned.
                if (!this.get('.readyFlag')) {
                    this.loadSelectData();
                    this.set('.readyFlag', true);
                }
            }
        },

        defineRepeaterDisplay: function () {

	    	this.$.repeaterDisplay.set('.groupboxHeaderText', 'Service Level Enrollment');
	        this.$.repeaterDisplay.set('.newRecordHeaderText', 'New Service Level Enrollment Record');
	        this.$.repeaterDisplay.set('.hasSimpleSelectButton', false);

	        this.$.repeaterDisplay.selectEndpoints = [
                {
                	endpoint: 'api/v1/ref/service-levels/?ref_program=' + this.get('.selectedProgramID'),
                	name: 'service_levels',
                	parseWith: this.$.selectHelper.parseGenericRefTable,
                	nullRow: false
                }
            ];

	        this.$.repeaterDisplay.staticPostFields = [
	            {fieldName: 'family_enrollment', value: this.get('.selectedFamilyEnrollmentID')}
	        ];

	        this.$.repeaterDisplay.fields = [
	        	{
	                fieldName: 'service_level_enrollment_id',
	                postBodyOnly: true,
	                primaryKey: true
	            },
	            {
	            	fieldName: 'ref_service_level',
	            	fieldType: 'DataSelect',
	            	dataSelectName: 'service_levels',
	            	headerText: 'Service Level',
	            	labelText: 'Service Level',
	            	fieldWidth: 200
	            },
	            {
	                fieldName: 'open_date',
	                fieldType: 'DatePicker',
	                headerText: 'Open Date',
	                labelText: 'Open Date',
	                fieldWidth: 125,
	                emptyIsValid: false
	            },
	            {
	                fieldName: 'close_date',
	                fieldType: 'DatePicker',
	                headerText: 'Close Date',
	                labelText: 'Close Date',
	                fieldWidth: 125,
	                emptyIsValid: true
	            }
	        ];

	        this.$.repeaterDisplay.endpoint = 'api/v1/program/service-level-enrollment/?family_enrollment_id=' +
	            this.get('.selectedFamilyEnrollmentID');
	        this.$.repeaterDisplay.patchEndpoint = 'api/v1/program/service-level-enrollment/';
	        this.$.repeaterDisplay.postEndpoint = 'api/v1/program/service-level-enrollment/';
	        this.$.repeaterDisplay.deleteEndpoint = 'api/v1/program/service-level-enrollment/';

	        this.$.repeaterDisplay.allowsNewRecords = !(this.get('.currentOrgReadOnly'));

	        this.$.repeaterDisplay.set('maxWidth', 500);

	        this.$.repeaterDisplay.createRepeater();

	        this.set('.repeaterInitialized', true);
	     },

	     loadSelectData: function () {
            
            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'GET');

            // If we don't receive a valid ref_program_id, we need to hide the control and exit
            var ref_program_id = this.get('.selectedProgramID');
            if (typeof ref_program_id === 'undefined') {
                this.$.repeaterDisplay.setShowing(false);
                return;
            } 

            var endpoint = 'api/v1/ref/service-levels/?ref_program=' + this.get('.selectedProgramID');
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processSelectResponse'));
            ajax.error(enyo.bindSafely(this, 'processError')); // we can share error handling
        },

        processSelectResponse: function (inRequest, inResponse) {
            if (inResponse['results'].length > 0) {
            	this.$.repeaterDisplay.show();
            	this.defineRepeaterDisplay();
            } else {
            	this.$.repeaterDisplay.hide();
            }
        },

        processError: function (inSender, inResponse) {
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

        repeaterDebugHandler: function(inSender, inEvent) {
            return true;
        },

        selectedFamilyEnrollmentIDChanged: function(oldVal, newVal) {
            if (newVal === -1) {
                this.setShowing(false);
            } else {
                this.setShowing(true);
            }
            return true;
        },

        selectedProgramIDChanged: function(oldVal, newVal) {
            if (typeof this.get('.selectedProgramID') !== 'undefined' && this.get('.selectedProgramID') !== -1 ) {
                this.loadSelectData();
            }
        }

	});

})(enyo, this);