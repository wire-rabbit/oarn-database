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
        name: 'oarn.ClassroomManager',

        kind: 'onyx.Popup',

        autoDismiss: false,

        modal: true,

        centered: true,

        scrim: true,

        floating: true,

        style: 'background-color: #EAEAEA; min-width:450px; min-height:300px;',

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
             * An object bound from the parent with properties: organization_id, name, and short_name
             */
            selectedOrganization: null

        },

        components: [
            {style: 'min-height: 250px;', components: [
                {name: 'classroomRepeaterDisplay', kind: 'oarn.RepeaterDisplay', style: 'padding: 5px 5px 5px 5px;'},

                {name: 'classRepeaterDisplay', kind: 'oarn.RepeaterDisplay', style: 'padding: 5px 5px 5px 5px',
                    showing: false},
            ]},

            {name: 'buttonsRow', style: 'text-align: center; padding-top:5px',
                components: [{name: 'btnClose', kind: 'onyx.Button', content: 'Close',
                        style: 'margin: 5px 5px 5px 5px',	ontap: 'goClose'}]},

            {name: 'selectHelper', kind: 'oarn.SelectHelper'},
            {name: 'popupFactory', kind: 'oarn.PopupFactory'}
        ],

        events: {
            onClassroomManagerClosed: ''
        },

        handlers: {
            onRowSelected: 'rowSelectedHandler',
            onRowDeleted: 'rowDeletedHandler',
            onRepeaterRendered: 'repeaterRenderedHandler'
        },

        create: function () {
            this.inherited(arguments);
            this.defineClassroomRepeaterDisplay();
        },

        defineClassroomRepeaterDisplay: function () {
            this.$.classroomRepeaterDisplay.set('.groupboxHeaderText', 'Physical Classrooms');
            this.$.classroomRepeaterDisplay.set('.newRecordHeaderText', 'New Physical Classroom');
            this.$.classroomRepeaterDisplay.set('.hasSimpleSelectButton', true);

            this.$.classroomRepeaterDisplay.selectEndpoints = [
                {
                    endpoint: 'api/v1/organization/locations/',
                    name: 'locations',
                    parseWith: this.$.selectHelper.parseOrgLocation
                }
            ];

            this.$.classroomRepeaterDisplay.staticPostFields = [
                {fieldName: 'organization', value: this.get('.selectedOrganization.organization_id')}
            ];

            this.$.classroomRepeaterDisplay.fields = [
                {
                    fieldName: 'organization',
                    postBodyOnly: true
                },
                {
                    fieldName: 'classroom_id',
                    postBodyOnly: true,
                    primaryKey: true
                },
                {
                    fieldName: 'name',
                    fieldType: 'TextBox',
                    fieldWidth: 175,
                    headerText: 'Classroom Name',
                    labelText: 'Classroom Name',
                    validator: this.classroomNameIsValid
                },
                {
                    fieldName: 'location',
                    fieldType: 'DataSelect',
                    dataSelectName: 'locations',
                    headerText: 'Location',
                    labelText: 'Location',
                    fieldWidth: 100
                }

            ];

            this.$.classroomRepeaterDisplay.endpoint = 'api/v1/attendance/classrooms/';
            this.$.classroomRepeaterDisplay.patchEndpoint = 'api/v1/attendance/classrooms/';
            this.$.classroomRepeaterDisplay.postEndpoint = 'api/v1/attendance/classrooms/';
            this.$.classroomRepeaterDisplay.deleteEndpoint = 'api/v1/attendance/classrooms/';

            this.$.classroomRepeaterDisplay.allowsNewRecords = true; // this page is accessible only to admins

            this.$.classroomRepeaterDisplay.set('maxWidth', 500);

            this.$.classroomRepeaterDisplay.createRepeater();

            this.set('.classroomRepeaterInitialized', true);
            this.hide();
            this.show();
        },

        goClose: function (inSender, inEvent) {
            this.hide();
            this.doClassroomManagerClosed();
        },

        classroomNameIsValid: function (val) {
            if (val.length > 0) {
                return true;
            }
            else {
                return false;
            }
        },

        defineClassRepeaterDisplay: function (classroomID) {
            this.$.classRepeaterDisplay.set('.groupboxHeaderText', 'Classes in Selected Classroom');
            this.$.classRepeaterDisplay.set('.newRecordHeaderText', 'New Class');
            this.$.classRepeaterDisplay.set('.hasSimpleSelectButton', false);

            this.$.classRepeaterDisplay.selectEndpoints = [];

            this.$.classRepeaterDisplay.staticPostFields = [
                {fieldName: 'classroom', value: classroomID}
            ];

            this.$.classRepeaterDisplay.fields = [
                {
                    fieldName: 'organization',
                    postBodyOnly: true
                },
                {
                    fieldName: 'class_schedule_id',
                    postBodyOnly: true,
                    primaryKey: true
                },
                {
                    fieldName: 'name',
                    fieldType: 'TextBox',
                    fieldWidth: 175,
                    headerText: 'Class Name',
                    labelText: 'Class Name',
                    validator: this.classroomNameIsValid
                },
                {
                    fieldName: 'sunday',
                    fieldType: 'Checkbox',
                    headerText: 'Sun',
                    labelText: 'Sunday',
                    fieldWidth: 30,
                },
                {
                    fieldName: 'monday',
                    fieldType: 'Checkbox',
                    headerText: 'Mon',
                    labelText: 'Monday',
                    fieldWidth: 30,
                },
                {
                    fieldName: 'tuesday',
                    fieldType: 'Checkbox',
                    headerText: 'Tues',
                    labelText: 'Tuesday',
                    fieldWidth: 30,
                },
                {
                    fieldName: 'wednesday',
                    fieldType: 'Checkbox',
                    headerText: 'Wed',
                    labelText: 'Wednesday',
                    fieldWidth: 30,
                },
                {
                    fieldName: 'thursday',
                    fieldType: 'Checkbox',
                    headerText: 'Thur',
                    labelText: 'Thursday',
                    fieldWidth: 30,
                },
                {
                    fieldName: 'friday',
                    fieldType: 'Checkbox',
                    headerText: 'Fri',
                    labelText: 'Friday',
                    fieldWidth: 30,
                },
                {
                    fieldName: 'saturday',
                    fieldType: 'Checkbox',
                    headerText: 'Sat',
                    labelText: 'Saturday',
                    fieldWidth: 30
                }


            ];

            this.$.classRepeaterDisplay.endpoint = 'api/v1/attendance/class-schedules/?classroom_id=' +
                classroomID;
            this.$.classRepeaterDisplay.patchEndpoint = 'api/v1/attendance/class-schedules/';
            this.$.classRepeaterDisplay.postEndpoint = 'api/v1/attendance/class-schedules/';
            this.$.classRepeaterDisplay.deleteEndpoint = 'api/v1/attendance/class-schedules/';

            this.$.classRepeaterDisplay.allowsNewRecords = true; // this page is accessible only to admins

            this.$.classRepeaterDisplay.set('maxWidth', 500);

            this.$.classRepeaterDisplay.show();
            this.$.classRepeaterDisplay.createRepeater();

            this.set('.classRepeaterInitialized', true);
            this.hide();
            this.show();
        },

        rowSelectedHandler: function (inSender, inEvent) {
            if (inEvent.originator.name == 'classroomRepeaterDisplay') {
                this.defineClassRepeaterDisplay(inEvent.primaryKey);
            }
        },

        rowDeletedHandler: function (inSender, inEvent) {
            if (inEvent.originator.name == 'classroomRepeaterDisplay') {
                if (inEvent.primaryKey == this.$.classRepeaterDisplay.staticPostFields[0].value) {
                    this.$.classRepeaterDisplay.hide();
                }
            }
        },

        repeaterRenderedHandler: function (inSender, inEvent) {
            this.hide();
            this.show();
        }
    });

}) (enyo, this);