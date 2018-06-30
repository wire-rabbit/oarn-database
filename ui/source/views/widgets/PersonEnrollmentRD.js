//  The OARN Relief Nursery Database
//  Copyright (C) 2015-2017  Oregon Association of Relief Nurseries
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

		name: 'oarn.PersonEnrollmentRD',

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
			{name: 'repeaterDisplay', kind: 'oarn.RepeaterDisplay', style: 'padding: 5px; max-width:500px;',  showing: false},
			{name: 'selectHelper', kind: 'oarn.SelectHelper'},
			{name: 'popupFactory', kind: 'oarn.PopupFactory'}
		],

    handlers: {
       onRepeaterDebug: 'repeaterDebugHandler'
    },

		observers: [
            {method: 'isReady', path: ['selectedFamilyEnrollmentID', 'selectedOrganization']}
        ],


      isReady: function (previous, current, property) {
          if (this.get('.selectedFamilyEnrollmentID') != -1 && (this.get('selectedOrganization') != null)) {
          	 this.$.repeaterDisplay.setShowing(true);
             this.$.repeaterDisplay.changed_row_indices = [];
             this.defineRepeaterDisplay();
          }
      },

	    defineRepeaterDisplay: function () {
	    	  this.$.repeaterDisplay.set('.groupboxHeaderText', 'Person Enrollment');
	        this.$.repeaterDisplay.set('.newRecordHeaderText', 'New Person Enrollment Record');
	        this.$.repeaterDisplay.set('.hasSimpleSelectButton', false);

	        this.$.repeaterDisplay.selectEndpoints = [
                {
                    endpoint: 'api/v1/family/adult-search/?family_id=' + this.get('.selectedFamilyID'),
                    name: 'family_members',
                    parseWith: this.$.selectHelper.parseFamilyMembers,
                    nullRow: false
                }
            ];

	        this.$.repeaterDisplay.staticPostFields = [
	            {fieldName: 'family_enrollment', value: this.get('.selectedFamilyEnrollmentID')}
	        ];

	        this.$.repeaterDisplay.fields = [
	        	  {
	                fieldName: 'person_enrollment_id',
	                postBodyOnly: true,
	                primaryKey: true
	            },
	            {
                  fieldName: 'person',
                  fieldType: 'DataSelect',
                  dataSelectName: 'family_members',
                  headerText: 'Person',
                  labelText: 'Person',
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

	        this.$.repeaterDisplay.endpoint = 'api/v1/program/person-enrollment/?family_enrollment_id=' +
	            this.get('.selectedFamilyEnrollmentID');
	        this.$.repeaterDisplay.patchEndpoint = 'api/v1/program/person-enrollment/';
	        this.$.repeaterDisplay.postEndpoint = 'api/v1/program/person-enrollment/';
	        this.$.repeaterDisplay.deleteEndpoint = 'api/v1/program/person-enrollment/';

	        this.$.repeaterDisplay.allowsNewRecords = !(this.get('.currentOrgReadOnly'));

	        this.$.repeaterDisplay.set('maxWidth', 500);

	        this.$.repeaterDisplay.createRepeater();

	        this.set('.repeaterInitialized', true);
	     },

      repeaterDebugHandler: function(inSender, inEvent) {
            enyo.log('PersonEnrollmentRD: ' + inEvent.changed_row_index);
            return true;
      },

      selectedFamilyEnrollmentIDChanged: function(oldVal, newVal) {
            if (newVal === -1) {
                this.setShowing(false);
            } else {
                this.setShowing(true);
            }
            return true;
      }

	});

})(enyo, this);