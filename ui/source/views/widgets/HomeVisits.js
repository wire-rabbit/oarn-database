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
        name: 'oarn.HomeVisits',

        published: {
            token: '',

            /**
             * When the state has changed but not yet saved, this is set to true.
             * It is used to alert parent controls that we have unsaved changes here.
             *
             * @type {Boolean}
             * @public
             */
            dirty: false,

            username: 'none',

            selectedFamilyID: 0,
            selectedFamilyEnrollmentID: 0,
            selectedProgramID: 0,

            organizationAccessList: null,

            selectedOrganization: null,
            currentOrgReadOnly: false,
            currentOrgReadWrite: false,
            currentOrgAdmin: false
        },

        components: [
            {name: 'repeaterDisplay', kind: 'oarn.RepeaterDisplay', style: 'padding: 5px 5px 5px 5px;'},
            {name: 'selectHelper', kind: 'oarn.SelectHelper'},
            {name: 'popupFactory', kind: 'oarn.PopupFactory'}
        ],

        observers: [
            {method: 'isReady', path: ['selectedFamilyID', 'selectedOrganization']}
        ],

        bindings: [
            {from: '.username', to: '.$.repeaterDisplay.username'}
        ],

        /**
         * Wait for both the family ID and selectedOrganization to be set before building controls.
         *
         * @private
         */
        isReady: function (previous, current, property) {
            if (this.get('selectedFamilyID') && (this.get('selectedOrganization') != null)) {
                this.defineRepeaterDisplay();
            }
        },

        defineRepeaterDisplay: function () {
            this.$.repeaterDisplay.set('.groupboxHeaderText', 'Home Visits');
            this.$.repeaterDisplay.set('.newRecordHeaderText', 'New Home Visit');

            this.$.repeaterDisplay.selectEndpoints = [
                {
                    endpoint: 'api/v1/ref/home-visit-locations/',
                    name: 'locations',
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/program/family/person/?staff_only=true&limit=500&organization_id=' +
                        this.get('.selectedOrganization.organization_id'),
                    name: 'employees',
                    parseWith: this.$.selectHelper.parsePerson
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
                    fieldName: 'home_visit_id',
                    postBodyOnly: true,
                    primaryKey: true
                },
                {
                    fieldName: 'person',
                    fieldType: 'DataSelect',
                    dataSelectName: 'employees',
                    headerText: 'Home Visitor',
                    labelText: 'Home Visitor',
                    fieldWidth: 175
                },
                {
                    fieldName: 'ref_home_visit_location',
                    fieldType: 'DataSelect',
                    dataSelectName: 'locations',
                    headerText: 'Location',
                    labelText: 'Location',
                    fieldWidth: 100
                },
                {
                    fieldName: 'service_minutes',
                    fieldType: 'NumberSelect',
                    headerText: 'Service Minutes',
                    labelText: 'Service Minutes',
                    fieldWidth: 100
                },
                {
                    fieldName: 'visit_date',
                    fieldType: 'DatePicker',
                    headerText: 'Visit Date',
                    labelText: 'Visit Date',
                    fieldWidth: 125,
                    emptyIsValid: false
                },
                {
                    fieldName: 'visit_notes',
                    fieldType: 'SelectNotes',
                    headerText: 'Home Visit Notes'
                }

            ];

            this.$.repeaterDisplay.endpoint = 'api/v1/family/home-visit/?family_id=' + this.get('.selectedFamilyID');
            this.$.repeaterDisplay.patchEndpoint = 'api/v1/family/home-visit/';
            this.$.repeaterDisplay.postEndpoint = 'api/v1/family/home-visit/';
            this.$.repeaterDisplay.deleteEndpoint = 'api/v1/family/home-visit/';

            this.$.repeaterDisplay.allowsNewRecords = !(this.get('.currentOrgReadOnly'));

            this.$.repeaterDisplay.hasNotesSelectButton = true;

            this.$.repeaterDisplay.set('maxWidth', 700);

            this.$.repeaterDisplay.createRepeater();

            this.set('.repeaterInitialized', true);
        },
    });

})(enyo, this);
