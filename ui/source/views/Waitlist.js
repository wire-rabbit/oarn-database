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
        name: 'oarn.Waitlist',

        published: {
            token: '',
            dirty: false,
            selectedFamilyID: -1,
            selectedWaitlistID: -1,
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
            {name: 'repeaterDisplay', kind: 'oarn.RepeaterDisplay', style: 'padding: 5px 5px 5px 5px;',
                groupboxHeaderText: 'Selected Waitlist Details'},
            {name: 'waitlistQuestions',
                kind: 'oarn.AssessmentGenerator',
                maxWidth: '600px',
                showing: false,
                style: 'padding: 5px 5px 5px 5px;'
            },
            {name: 'selectHelper', kind: 'oarn.SelectHelper'},
            {name: 'popupFactory', kind: 'oarn.PopupFactory'}
        ],

        events: {
            onWaitlistDirtyStateChanged: ''
        },

        handlers: {
            onRowSelected: 'rowSelectedHandler',
            onPopupClosed: 'popupClosedHandler',
            onRowDeleted: 'rowDeletedHandler',
            onDirtyStateChanged: 'dirtyStateChangedHandler'
        },

        bindings: [
            {from: '.token', to: '.$.repeaterDisplay.token'},
            {from: '.token', to: '.$.waitlistQuestions.token'},
            {from: '.selectedWaitlistID', to: '.$.waitlistQuestions.assessmentID'},
            {from: '.currentOrgReadOnly', to: '.$.waitlistQuestions.currentOrgReadOnly'}
        ],

        create: function () {
            this.inherited(arguments);
            this.defineRepeaterDisplay();
        },

        defineRepeaterDisplay: function () {
            this.$.repeaterDisplay.set('.groupboxHeaderText', 'Waitlist History');
            this.$.repeaterDisplay.set('.newRecordHeaderText', 'New Waitlist Record');
            this.$.repeaterDisplay.set('.hasSimpleSelectButton', true);

            this.$.repeaterDisplay.selectEndpoints = [
                {
                    endpoint: 'api/v1/program/family/person/?staff_only=true&limit=500&organization_id=' +
                        this.get('.selectedOrganization.organization_id'),
                    name: 'employees',
                    nullRow: true,
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
                    fieldName: 'waitlist_id',
                    postBodyOnly: true,
                    primaryKey: true
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
                },
                {
                    fieldName: 'assigned_to_employee',
                    fieldType: 'DataSelect',
                    dataSelectName: 'employees',
                    headerText: 'Assigned to Employee',
                    labelText: 'Assigned to Employee',
                    fieldWidth: 175
                },
                {
                    fieldName: 'assigned_date',
                    fieldType: 'DatePicker',
                    headerText: 'Date Assigned',
                    labelText: 'Date Assigned',
                    fieldWidth: 125,
                    emptyIsValid: true
                }
            ];

            this.$.repeaterDisplay.endpoint = 'api/v1/program/waitlist/?family_id=' +
                this.get('.selectedFamilyID');
            this.$.repeaterDisplay.patchEndpoint = 'api/v1/program/waitlist/';
            this.$.repeaterDisplay.postEndpoint = 'api/v1/program/waitlist/';
            this.$.repeaterDisplay.deleteEndpoint = 'api/v1/program/waitlist/';

            this.$.repeaterDisplay.allowsNewRecords = !(this.get('.currentOrgReadOnly'));

            this.$.repeaterDisplay.set('maxWidth', 750);

            this.$.repeaterDisplay.createRepeater();

            this.set('.repeaterInitialized', true);
        },

        rowSelectedHandler: function (inSender, inEvent) {
            var collection = this.$.repeaterDisplay.getCollection();

            if (collection.at(inEvent.index).get('waitlist_id') != this.get('.selectedWaitlistID') &&
                this.$.waitlistQuestions.dirty) {

                var msg = 'You appear to have unsaved changes to the selected waitlist record. ' +
                    'Clicking \'Yes\' will change the selected record and your unsaved changes will be' +
                    ' lost. Continue anyway?';

                this.set('.targetID', collection.at(inEvent.index).get('waitlist_id'));
                this.set('.targetIndex', inEvent.index);
                this.set('confirmPopupMode', 'confirmMove');
                this.$.popupFactory.showConfirm('Unsaved Changes', msg);
            }
            else if (collection.at(inEvent.index).get('waitlist_id') != this.get('.selectedWaitlistID') &&
                !this.$.waitlistQuestions.dirty) {

                this.set('.selectedWaitlistID',
                    this.$.repeaterDisplay.collection.at(inEvent.index).get('waitlist_id')
                );

                this.set('.currentIndex', inEvent.index);
            }
        },

        rowDeletedHandler: function (inSender, inEvent) {
            if (this.get('.currentIndex') == inEvent.index) {
                this.$.waitlistQuestions.hide();
            }
            return true;
        },

        popupClosedHandler: function (inSender, inEvent) {
            if (this.get('.confirmPopupMode') == 'confirmMove') {
                if ((inEvent.confirmed === undefined) || (inEvent.confirmed === false)) {
                    return true; // we only want to take action if a confirmation has occurred
                }
                else if (inEvent.confirmed) {
                    this.$.waitlistQuestions.setDirty(false);
                    var collection = this.$.repeaterDisplay.getCollection();

                    this.set('.selectedFamilyAssessmentID', this.get('.targetID'));
                }
                this.set('.confirmPopupMode', '');
                return true;
            }
        },

        selectedFamilyIDChanged: function (inOld) {
            if (this.get('.repeaterInitialized')) {

                this.$.repeaterDisplay.staticPostFields = [
                    {fieldName: 'family_id', value: this.get('.selectedFamilyID')}
                ];

                this.$.repeaterDisplay.endpoint = 'api/v1/program/waitlist/?family=' +
                    this.get('.selectedFamilyID');
            }
        },

        dirtyStateChangedHandler: function (inSender, inEvent) {
            this.set('.dirty', inEvent.dirty);
            return true;
        },

        dirtyChanged: function (inOld) {
            this.doWaitlistDirtyStateChanged({'dirty': this.get('.dirty')});
        },

        selectedWaitlistIDChanged: function (inOld) {
            this.$.waitlistQuestions.show();

            this.$.waitlistQuestions.staticPostFields.push({
                'fieldName': 'family',
                'value': this.get('.selectedFamilyID')
            });
            this.$.waitlistQuestions.endpointBase = 'api/v1/program/waitlist/';
            this.$.waitlistQuestions.pkFieldName = 'waitlist_id';

            this.set('.$.waitlistQuestions.groupboxHeaderText', 'Waitlist Record Details');

            this.$.waitlistQuestions.questions = [
                {
                    fieldName: 'status',
                    rowNumber: 10,
                    fieldType: 'none',
                    questionText: 'Waitlist Status',
                    questionPosition: 'questionOnly',
                    questionClasses: 'oarn-assessment-section-header'
                },
                {
                    fieldName: 'ref_waitlist_status',
                    rowNumber: 20,
                    fieldType: 'select',
                    dataSelectName: 'waitlist_status',
                    questionText: 'Status',
                    questionPosition: 'inline',
                    required: false
                },
                {
                    fieldName: 'ref_referred_from',
                    rowNumber: 30,
                    fieldType: 'select',
                    dataSelectName: 'referred_from',
                    questionText: 'Referred From',
                    questionPosition: 'inline',
                    required: false
                },
                {
                    fieldName: 'basic_facts',
                    rowNumber: 100,
                    fieldType: 'none',
                    questionText: 'Basic Details',
                    questionPosition: 'questionOnly',
                    questionClasses: 'oarn-assessment-section-header'
                },
                {
                    rowNumber: 105,
                    fieldName: 'child_under_three',
                    questionText: 'Family has a child under three',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 110,
                    fieldName: 'child_under_five',
                    questionText: 'Family has a child between the ages of three and five',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 120,
                    fieldName: 'open_child_welfare_case',
                    questionText: 'Family currently has an open child welfare case',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 130,
                    fieldName: 'mother_is_pregnant',
                    questionText: 'Mother is currently pregnant',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },

                {
                    rowNumber: 210,
                    fieldName: 'service_need_1',
                    required: false,
                    questionText: 'Service Need 1',
                    questionPosition: 'inline',
                    fieldType: 'select',
                    dataSelectName: 'needs'
                },
                {
                    rowNumber: 220,
                    fieldName: 'service_need_2',
                    required: false,
                    questionText: 'Service Need 2',
                    questionPosition: 'inline',
                    fieldType: 'select',
                    dataSelectName: 'needs'
                },
                {
                    rowNumber: 230,
                    fieldName: 'service_need_3',
                    required: false,
                    questionText: 'Service Need 3',
                    questionPosition: 'inline',
                    fieldType: 'select',
                    dataSelectName: 'needs'
                },
                {
                    rowNumber: 240,
                    fieldName: 'service_need_4',
                    required: false,
                    questionText: 'Service Need 4',
                    questionPosition: 'inline',
                    fieldType: 'select',
                    dataSelectName: 'needs'
                },
                {
                    rowNumber: 260,
                    fieldName: 'service_need_5',
                    required: false,
                    questionText: 'Service Need 5',
                    questionPosition: 'inline',
                    fieldType: 'select',
                    dataSelectName: 'needs'
                },
                {
                    rowNumber: 270,
                    fieldName: 'service_need_6',
                    required: false,
                    questionText: 'Service Need 6',
                    questionPosition: 'inline',
                    fieldType: 'select',
                    dataSelectName: 'needs'
                },
                {
                    rowNumber: 310,
                    required: false,
                    fieldName: 'notes',
                    questionText: 'Notes:',
                    fieldType: 'textarea'
                }
            ];

            this.$.waitlistQuestions.selectEndpoints = [
                {
                    endpoint: 'api/v1/ref/service-needs/',
                    name: 'needs',
                    nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/referred-from/',
                    name: 'referred_from',
                    nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/waitlist-status/',
                    name: 'waitlist_status',
                    nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
            ];

            this.$.waitlistQuestions.createAssessment();

        }
    });

})(enyo, this);