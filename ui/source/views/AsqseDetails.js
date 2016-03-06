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

(function (enyo, scope){

    enyo.kind({
        name: 'oarn.ASQSEDetails',

        published: {
            token: '',
            dirty: false,
            selectedFamilyID: -1,
            selectedChildID: -1,
            selectedASQSEID: -1,
            currentOrgReadOnly: false,

            /**
             * The organization of the logged in user, set to an object in the format:
             * {'organization_id': (number), 'name': 'foo', 'short_name': 'bar'}
             * If a user has rights to multiple organizations, they will be asked to select one
             * for the current session at login. This is bound from the parent.
             *
             * @type {Object}
             * @default null
             * @public
             */
            selectedOrganization: null
        },

        components: [
            {name: 'repeaterDisplay', kind: 'oarn.RepeaterDisplay', style: 'padding: 5px 5px 5px 5px;'},
            {name: 'selectHelper', kind: 'oarn.SelectHelper'},
            {name: 'popupFactory', kind: 'oarn.PopupFactory'}
        ],

        bindings: [
            {from: '.username', to: '.$.repeaterDisplay.username'} // set by parent
        ],

        events: {
            onASQSEDirtyStateChanged: ''
        },

        handlers: {
            onDirtyStateChanged: 'dirtyStateChangedHandler'
        },

        observers: [
            {method: 'isReady', path: ['selectedOrganization', 'selectedChildID']}
        ],

        /**
         * Wait for selectedChildID and selectedOrganization to be set before building controls.
         *
         * @private
         */
        isReady: function (previous, current, property) {
            if (this.get('.selectedChildID') != -1 && (this.get('.selectedOrganization') != null)) {
                this.defineRepeaterDisplay();
            }
        },

        defineRepeaterDisplay: function () {
            this.$.repeaterDisplay.set('.groupboxHeaderText', 'ASQ:SE Scores');
            this.$.repeaterDisplay.set('.newRecordHeaderText', 'New ASQ:SE Score');

            this.$.repeaterDisplay.selectEndpoints = [
                {
                    endpoint: 'api/v1/ref/asqse-intervals/',
                    name: 'intervals',
                    parseWith: this.parseInterval
                },
                {
                    endpoint: 'api/v1/program/family/person/?staff_only=true&limit=500&organization_id=' +
                        this.get('.selectedOrganization.organization_id'),
                    name: 'employees',
                    parseWith: this.$.selectHelper.parsePerson
                }
            ];

            this.$.repeaterDisplay.staticPostFields = [
                {fieldName: 'family', value: this.get('.selectedFamilyID')},
                {fieldName: 'child', value: this.get('.selectedChildID')}
            ];

            this.$.repeaterDisplay.fields = [
                {
                    fieldName: 'family',
                    postBodyOnly: true
                },
                {
                    fieldName: 'child',
                    postBodyOnly: true
                },
                {
                    fieldName: 'asqse_id',
                    postBodyOnly: true,
                    primaryKey: true
                },
                {
                    fieldName: 'ref_assessment_interval',
                    fieldType: 'DataSelect',
                    dataSelectName: 'intervals',
                    headerText: 'Assessment Interval',
                    labelText: 'Assessment Interval',
                    fieldWidth: 100,
                    alertOnChange: true
                },
                {
                    fieldName: 'employee',
                    fieldType: 'DataSelect',
                    dataSelectName: 'employees',
                    headerText: 'Interviewer',
                    labelText: 'Interviewer',
                    fieldWidth: 150
                },
                {
                    fieldName: 'assessment_date',
                    fieldType: 'DatePicker',
                    headerText: 'Assessment Date',
                    labelText: 'Assessment Date',
                    fieldWidth: 100,
                    emptyIsValid: false
                },
                {
                    fieldName: 'score',
                    fieldType: 'TextBox',
                    headerText: 'Score',
                    labelText: 'Score',
                    fieldWidth: 70,
                    validator: this.scoreIsValid
                },
                {
                    fieldName: 'notes',
                    fieldType: 'SelectNotes',
                    headerText: 'Notes:'
                }
            ];

            this.$.repeaterDisplay.endpoint = 'api/v1/assessments/asqse/?child_id=' +
                this.get('.selectedChildID');
            this.$.repeaterDisplay.patchEndpoint = 'api/v1/assessments/asqse/';
            this.$.repeaterDisplay.postEndpoint = 'api/v1/assessments/asqse/';
            this.$.repeaterDisplay.deleteEndpoint = 'api/v1/assessments/asqse/';

            this.$.repeaterDisplay.hasNotesSelectButton = true;

            this.$.repeaterDisplay.allowsNewRecords = !(this.get('.currentOrgReadOnly'));

            this.$.repeaterDisplay.set('maxWidth', 600);

            this.$.repeaterDisplay.createRepeater();

            this.set('.repeaterInitialized', true);

        },

        parseInterval: function (row) {
            if (row.hasOwnProperty('ref_asqse_assessment_interval_id')) {
                var item = {
                    value: row['ref_asqse_assessment_interval_id'],
                    display_text: row['assessment_interval']
                }
                return item;
            }
            else {
                return null;
            }
        },

        /**
         * Thank you to Mike Samuel:
         * http://stackoverflow.com/questions/10454518/javascript-how-to-retrieve-the-number-of-decimals-of-a-string-number
         * @param num
         * @returns {number}
         */
        scoreIsValid: function (val) {
            if (!isNaN(parseFloat(val)) && isFinite(val)){
                var match = (''+val).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
                if (!match) {
                    return false;
                }
                var decimal_places = Math.max(
                    0,
                    // Number of digits right of decimal point.
                    (match[1] ? match[1].length : 0)
                        // Adjust for scientific notation.
                    - (match[2] ? +match[2] : 0)
                );

                if (parseFloat(val) < 500 && decimal_places == 0) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        },

        dirtyStateChangedHandler: function (inSender, inEvent) {
            this.set('.dirty', inEvent.dirty);
            return true;
        },

        dirtyChanged: function (inOld) {
            this.doASQSEDirtyStateChanged({'dirty': this.get('.dirty')});
        },

    });

})(enyo, this);
