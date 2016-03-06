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
        name: 'oarn.ContactLog',

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

        observers: [
            {method: 'isReady', path: ['selectedFamilyID', 'selectedOrganization']}
        ],

        components: [
            {name: 'repeaterDisplay', kind: 'oarn.RepeaterDisplay', style: 'padding: 5px 5px 5px 5px;'},
            {name: 'selectHelper', kind: 'oarn.SelectHelper'},
            {name: 'popupFactory', kind: 'oarn.PopupFactory'}
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
            this.$.repeaterDisplay.set('.groupboxHeaderText', 'Contact Log');
            this.$.repeaterDisplay.set('.newRecordHeaderText', 'New Contact Log Record');

            this.$.repeaterDisplay.selectEndpoints = [
                {
                    endpoint: 'api/v1/ref/contact-types/',
                    name: 'contact_types',
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/family/adult-search/?family_id=' + this.get('.selectedFamilyID'),
                    name: 'family_members',
                    parseWith: this.$.selectHelper.parsePerson
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
                    fieldName: 'contact_log_id',
                    postBodyOnly: true,
                    primaryKey: true
                },
                {
                    fieldName: 'employee',
                    fieldType: 'DataSelect',
                    dataSelectName: 'employees',
                    headerText: 'Employee',
                    labelText: 'Employee',
                    fieldWidth: 155
                },
                {
                    fieldName: 'family_member',
                    fieldType: 'DataSelect',
                    dataSelectName: 'family_members',
                    headerText: 'Family Member',
                    labelText: 'Family Member',
                    fieldWidth: 155
                },
                {
                    fieldName: 'ref_contact_type',
                    fieldType: 'DataSelect',
                    dataSelectName: 'contact_types',
                    headerText: 'Contact Type',
                    labelText: 'Contact Type',
                    fieldWidth: 100
                },
                {
                    fieldName: 'service_minutes',
                    fieldType: 'NumberSelect',
                    headerText: 'Service Minutes',
                    labelText: 'Service Minutes',
                    fieldWidth: 60
                },
                {
                    fieldName: 'contact_date',
                    fieldType: 'DatePicker',
                    headerText: 'Contact Date',
                    labelText: 'Contact Date',
                    fieldWidth: 100,
                    emptyIsValid: false
                },
                {
                    fieldName: 'contact_log_notes',
                    fieldType: 'SelectNotes',
                    headerText: 'Contact Notes'
                }

            ];

            this.$.repeaterDisplay.endpoint = 'api/v1/family/contact-log/?family_id=' + this.get('.selectedFamilyID');
            this.$.repeaterDisplay.patchEndpoint = 'api/v1/family/contact-log/';
            this.$.repeaterDisplay.postEndpoint = 'api/v1/family/contact-log/';
            this.$.repeaterDisplay.deleteEndpoint = 'api/v1/family/contact-log/';

            this.$.repeaterDisplay.allowsNewRecords = !(this.get('.currentOrgReadOnly'));

            this.$.repeaterDisplay.hasNotesSelectButton = true;

            this.$.repeaterDisplay.set('maxWidth', 700);

            this.$.repeaterDisplay.createRepeater();

            this.set('.repeaterInitialized', true);

        },
    });

})(enyo, this);
