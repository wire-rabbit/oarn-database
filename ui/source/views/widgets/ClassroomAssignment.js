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
        name: 'oarn.ClassroomAssignment',

        selectLoaded: false, // a flag to determine whether or not we have already retrieved select data

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
            organizationAccessList: null,

            selectedOrganization: null,
            currentOrgReadOnly: false,
            currentOrgReadWrite: false,
            currentOrgAdmin: false,

            selectedPersonID: -1,
            selectedPersonItem: null //model: person_id, first_name, last_name, gender, birth_date, is_child
        },

        components: [
            {name: 'scheduleRepeaterDisplay', kind: 'oarn.RepeaterDisplay'},

            {kind: 'onyx.Groupbox', style: 'padding-top: 5px;', components: [
                {kind: 'onyx.GroupboxHeader', style: 'wdith: 500px;', content: 'Assign to Class'},
                {tag: 'table', components: [
                    {tag: 'tr', components: [
                        {tag: 'td', components: [
                            {tag: 'label', classes: 'oarn-control oarn-groupbox-control', content: 'Classroom:'}
                        ]},
                        {tag: 'td', components: [
                            {name: 'selectClassroom', kind: 'oarn.DataSelect', onchange: 'classroomChanged'},
                        ]},
                        {tag: 'td', components: [
                            {tag: 'label', classes: 'oarn-control oarn-groupbox-control', content: 'Class Schedule:'}
                        ]},
                        {tag: 'td', components: [
                            {name: 'selectSchedule', kind: 'oarn.DataSelect'},
                        ]}
                    ]},
                    {tag: 'tr', components:[
                        {tag: 'td', components: [
                            {tag: 'label', classes: 'oarn-control oarn-groupbox-control', content: 'Begin Date:'}
                        ]},
                        {tag: 'td', attributes:[{'colspan':'3'}], components: [
                            {name: 'beginDate', kind: 'oarn.DatePicker', emptyIsValid: false}
                        ]}
                    ]},
                    {tag: 'tr', components:[
                        {tag: 'td', attributes:[{'colspan':'4'}], components: [
                            {kind: 'onyx.Button', content: 'Schedule Class', ontap: 'goSchedule'}
                        ]}
                    ]}
                ]}
            ]},
            {name: 'selectHelper', kind: 'oarn.SelectHelper'},
            {name: 'popupFactory', kind: 'oarn.PopupFactory'}
        ],

        events: {
            onAjaxError: '',
            onAjaxStarted: '',
            onAjaxFinished: ''
        },

        handlers: {
            onSelectListsAcquired: 'selectListsAcquiredHandler'
        },

        create: function () {
            this.inherited(arguments);
            this.initSelectHelper();
        },

        selectedPersonIDChanged: function (oldVal) {
            if (this.get('.selectedPersonID') > 0) {
                this.defineScheduleRepeaterDisplay();
            }
        },

        defineScheduleRepeaterDisplay: function () {
            this.$.scheduleRepeaterDisplay.set('.groupboxHeaderText', 'Class Schedule');
            this.$.scheduleRepeaterDisplay.set('.hasSimpleSelectButton', false);
            this.$.scheduleRepeaterDisplay.allowsNewRecords = false;

            this.$.scheduleRepeaterDisplay.selectEndpoints = [
                {
                    endpoint: 'api/v1/attendance/classrooms/',
                    name: 'classrooms',
                    parseWith: this.$.selectHelper.parseClassroom
                },
                {
                    endpoint: 'api/v1/attendance/class-schedules/',
                    name: 'class_schedules',
                    parseWith: this.$.selectHelper.parseClassSchedule
                }
            ];

            this.$.scheduleRepeaterDisplay.staticPostFields = [
                {fieldName: 'person', value: this.get('.selectedPersonID')}
            ];

            this.$.scheduleRepeaterDisplay.fields = [
                {
                    fieldName: 'person_class_schedule_id',
                    postBodyOnly: true,
                    primaryKey: true
                },
                {
                    fieldName: 'classroom',
                    fieldType: 'DataSelect',
                    dataSelectName: 'classrooms',
                    headerText: 'Classroom',
                    readOnly: true,
                    fieldWidth: 100
                },
                {
                    fieldName: 'class_schedule',
                    fieldType: 'DataSelect',
                    dataSelectName: 'class_schedules',
                    headerText: 'Class',
                    readOnly: true,
                    fieldWidth: 100
                },
                {
                    fieldName: 'begin_date',
                    fieldType: 'DatePicker',
                    headerText: 'Begin Date',
                    fieldWidth: 125,
                    emptyIsValid: false
                },
                {
                    fieldName: 'end_date',
                    fieldType: 'DatePicker',
                    headerText: 'End Date',
                    fieldWidth: 125,
                    emptyIsValid: true
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

            this.$.scheduleRepeaterDisplay.endpoint = 'api/v1/attendance/person-class-schedules/?person_id=' +
                this.get('.selectedPersonID');
            this.$.scheduleRepeaterDisplay.patchEndpoint = 'api/v1/attendance/person-class-schedules/';
            this.$.scheduleRepeaterDisplay.deleteEndpoint = 'api/v1/attendance/person-class-schedules/';

            this.$.scheduleRepeaterDisplay.set('maxWidth', 800);

            this.$.scheduleRepeaterDisplay.show();
            this.$.scheduleRepeaterDisplay.createRepeater();

            this.set('.scheduleRepeaterDisplayInitialized', true);
        },

        initSelectHelper: function () {
            if (!this.get('.selectLoaded')) {
                this.$.selectHelper.endpoints = [
                    {
                        endpoint: 'api/v1/attendance/classrooms/',
                        name: 'classrooms',
                        parseWith: this.$.selectHelper.parseClassroom
                    },
                    {
                        endpoint: 'api/v1/attendance/class-schedules/',
                        name: 'class_schedules',
                        parseWith: this.$.selectHelper.parseClassSchedule
                    }
                ];

                if (!this.get('.selectLoaded')) {
                    this.$.selectHelper.loadSelectData();
                }
            }
        },

        selectListsAcquiredHandler: function (inSender, inEvent) {
            this.set('.selectLoaded', true);
            // We retrieved the whole list of class schedules. We need to break them up now into separate
            // arrays for each classroom:

            for (var i=0; i < this.$.selectHelper.optionsLists['class_schedules_options_list'].length; i++) {
                var classroom = this.$.selectHelper.optionsLists['class_schedules_options_list'][i].classroom;
                this['schedule_options_' + classroom] = [];
            }

            for (var i=0; i < this.$.selectHelper.optionsLists['class_schedules_options_list'].length; i++) {
                var classroom = this.$.selectHelper.optionsLists['class_schedules_options_list'][i].classroom;

                // If there isn't an array yet for this schedule, create it:
                if (this.get('schedule_options_' + classroom) == undefined) {
                    this.set('schedule_options_' + classroom, []);
                }

                // Add the current value to the array:
                this['schedule_options_' + classroom].push({
                    value: this.$.selectHelper.optionsLists['class_schedules_options_list'][i].value,
                    display_text: this.$.selectHelper.optionsLists['class_schedules_options_list'][i].display_text,
                    sunday: this.$.selectHelper.optionsLists['class_schedules_options_list'][i].sunday,
                    monday: this.$.selectHelper.optionsLists['class_schedules_options_list'][i].monday,
                    tuesday: this.$.selectHelper.optionsLists['class_schedules_options_list'][i].tuesday,
                    wednesday: this.$.selectHelper.optionsLists['class_schedules_options_list'][i].wednesday,
                    thursday: this.$.selectHelper.optionsLists['class_schedules_options_list'][i].thursday,
                    friday: this.$.selectHelper.optionsLists['class_schedules_options_list'][i].friday,
                    saturday: this.$.selectHelper.optionsLists['class_schedules_options_list'][i].saturday
                });
            }

            this.$.selectClassroom.options_list.empty();
            this.$.selectClassroom.options_list.add(this.$.selectHelper.optionsLists['classrooms_options_list']);

            this.$.selectSchedule.options_list.empty();
            this.$.selectSchedule.options_list.add(
                this.get('schedule_options_' + this.$.selectClassroom.getValue())
            );
        },

        classroomChanged: function (inSender, inEvent) {
            this.$.selectSchedule.options_list.empty();
            this.$.selectSchedule.options_list.add(
                this.get('schedule_options_' + this.$.selectClassroom.getValue())
            );
        },

        goSchedule: function (inSender, inEvent) {
            if (this.$.beginDate.getValue() == null || this.$.beginDate.getValue() == "") {
                this.$.popupFactory.showInfo('Missing Required Data', 'The begin date is required.');
                return;
            }

            var classroom = this.$.selectClassroom.getValue();
            for (var i=0; i < this['schedule_options_' + classroom].length; i++) {
                if (this['schedule_options_' + classroom][i].value == this.$.selectSchedule.getValue()) {
                    var sunday = this['schedule_options_' + classroom][i].sunday;
                    var monday = this['schedule_options_' + classroom][i].monday;
                    var tuesday = this['schedule_options_' + classroom][i].tuesday;
                    var wednesday = this['schedule_options_' + classroom][i].wednesday;
                    var thursday = this['schedule_options_' + classroom][i].thursday;
                    var friday = this['schedule_options_' + classroom][i].friday;
                    var saturday = this['schedule_options_' + classroom][i].saturday;
                }
            }

            var postBody = {};
            postBody['person'] = this.get('.selectedPersonID');
            enyo.log('selectedPersonID:' + this.get('.selectedPersonID'));

            var beginDate = null;
            if (!Number.isNaN(this.$.beginDate.getValue())) {
                var testDate = new Date(
                    this.$.beginDate.getValue()
                ).toISOString();
                beginDate = moment(testDate).format('YYYY-MM-DD');
            }
            else {
                this.$.popupFactory.showInfo('Invalid Date', 'The begin date does not appear to be valid.');
                return;
            }


            postBody['class_schedule'] = this.$.selectSchedule.getValue();
            postBody['begin_date'] = beginDate;
            postBody['sunday'] = sunday;
            postBody['monday'] = monday;
            postBody['tuesday'] = tuesday;
            postBody['wednesday'] = wednesday;
            postBody['thursday'] = thursday;
            postBody['friday'] = friday;
            postBody['saturday'] = saturday;

            this.api = new oarn.API();
            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'POST');
            var endpoint = 'api/v1/attendance/person-class-schedules/';
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.postBody = postBody;

            this.doAjaxStarted();
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'postResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));
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

        postResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.
            this.$.scheduleRepeaterDisplay.refreshData();
        }
    });

})(enyo, this);