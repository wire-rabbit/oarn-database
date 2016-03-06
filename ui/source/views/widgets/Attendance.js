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

    /**
     * Fires when an ajax call results in an error that is not handled locally.
     *
     * @event oarn.Attendance#onAjaxError
     * @type {object}
     * @property {string} name - Name of the {@link oarn.Attendance} control that
     * generated the event.
     * @property {object} xhrResponse - The error details
     * @public
     */

    /**
     * Fires when an ajax call is started, to alert parents to display spinners, ec.
     *
     * @event oarn.Attendance#onAjaxStarted
     * @public
     */

    /**
     * Fires when an ajax call - one not handled locally - has returned, to alert parents to hide spinners, etc.
     *
     * @event oarn.Attendance#onAjaxFinished
     * @public
     */

    /**
     * Fires when the popup is closed, indicating to the parent that it is safe to destroy the control.
     *
     * @event oarn.Attendance#onAttendanceClosed
     * @public
     */

    /**
     * {@link oarn.Attendance} is a popup control that allows the user to take attendance. For a given date,
     * a classroom and class are selected and then a "Refresh Attendance Records" button is clicked. This populates
     * the default attendance records for that date and displays them. Where a given attendance records deviates
     * from what is expected for that day, the user can make that change directly.
     *
     * @class oarn.Attendance
     * @extends enyo.Control
     * @public
     * @ui
     */
    enyo.kind(/** @lends oarn.Attendance.prototype */{

        /**
         * @private
         */
        name: 'oarn.Attendance',

        /**
         * @private
         */
        kind: 'onyx.Popup',

        /**
         * @private
         */
        autoDismiss: false,

        /**
         * @private
         */
        modal: true,

        /**
         * @private
         */
        centered: true,

        /**
         * @private
         */
        scrim: true,

        /**
         * @private
         */
        floating: true,

        /**
         * @private
         */
        style: 'background-color: #EAEAEA; min-width:450px; min-height:300px;',

        /**
         * @private
         */
        selectLoaded: false, // a flag to determine whether or not we have already retrieved select data

        /**
         * @private
         */
        dateLabel: "",

        /**
         * @private
         */
        classScheduleLabel: "",

        /**
         * @private
         */
        classScheduleLabel: "",

        /**
         * @private
         */
        classroomID: -1,

        /**
         * @private
         */
        scheduleID: -1,

        /**
         * @private
         */
        detailsDisplayInitialized: false,

        /**
         * @private
         */
        published:
            /** @lends oarn.Attendance.prototype */{

            /**
             * The API auth token, bound to the widget by a parent control.
             *
             * @type {string}
             * @default null
             * @public
             */
            token: null,

            /**
             * The oarn API object.
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

        /**
         * @private
         */
        components: [

            {kind: 'onyx.Groupbox', components:[
                {kind: 'onyx.GroupboxHeader', content: 'Attendance'},
                {tag: 'table', components: [
                    {tag: 'tr', components: [
                        {tag: 'td', components: [
                            {tag: 'label', classes: 'oarn-control oarn-groupbox-control',
                                content: 'Attendence for Date:'}
                        ]},
                        {tag: 'td', components: [
                            {name: 'attendanceDate', kind: 'oarn.DatePicker', emptyIsValid: false},
                        ]}
                    ]},
                    {tag: 'tr', components: [
                        {tag: 'td', components: [
                            {tag: 'label', classes: 'oarn-control oarn-groupbox-control',
                                content: 'Classroom:'}
                        ]},
                        {tag: 'td', components: [
                            {name: 'selectClassroom', kind: 'oarn.DataSelect', onchange: 'classroomChanged'}
                        ]}
                    ]},
                    {tag: 'tr', components: [
                        {tag: 'td', components: [
                            {tag: 'label', classes: 'oarn-control oarn-groupbox-control',
                                content: 'Class:'}
                        ]},
                        {tag: 'td', components: [
                            {name: 'selectSchedule', kind: 'oarn.DataSelect', onchange: 'scheduleChanged'},
                        ]}
                    ]},
                    {tag: 'tr', components: [
                        {tag: 'td', attributes: [{'colspan': '2'}], components: [
                            {kind: 'onyx.Button', content: 'View Attendance Details', ontap: 'viewDetails'},
                        ]}
                    ]},
                    {tag: 'tr', components: [
                        {tag: 'td', components: [
                            {tag: 'label', name: 'lblSelectedSession', classes: 'oarn-control oarn-groupbox-control',
                                showing: false}
                        ]},
                        {tag: 'td', components: [
                            {name: 'btnRefresh', kind: 'onyx.Button', content: 'Refresh Attendance Records', ontap: 'refreshAttendance',
                                showing: false},
                        ]}
                    ]}
                ]}
            ]},

            {name: 'detailsDisplay', kind: 'oarn.RepeaterDisplay', style: 'padding: 5px 5px 5px 5px;',
                showing: false},

            {name: 'buttonsRow', style: 'text-align: center; padding-top:5px',
                components: [{name: 'btnClose', kind: 'onyx.Button', content: 'Close',
                    style: 'margin: 5px 5px 5px 5px',	ontap: 'goClose'}]},

            {name: 'selectHelper', kind: 'oarn.SelectHelper'},
            {name: 'popupFactory', kind: 'oarn.PopupFactory'}
        ],

        /**
         * @private
         */
        events: {
            onAttendanceClosed: '',
            onAjaxError: '',
            onAjaxStarted: '',
            onAjaxFinished: ''
        },

        /**
         * @private
         */
        handlers: {
            onSelectListsAcquired: 'selectListsAcquiredHandler',
            onPopupClosed: 'popupClosedHandler'
        },

        /**
         * @private
         */
        create: function () {
            this.inherited(arguments);
            this.initSelectHelper();
        },

        /**
         * @private
         */
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

        /**
         * @private
         * @param inSender
         * @param inEvent
         * @returns {boolean}
         */
        selectListsAcquiredHandler: function (inSender, inEvent) {
            if (this.selectLoaded) {
                return true;
            }

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

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        classroomChanged: function (inSender, inEvent) {
            this.$.selectSchedule.options_list.empty();
            this.$.selectSchedule.options_list.add(
                this.get('schedule_options_' + this.$.selectClassroom.getValue())
            );
            this.scheduleChanged();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        scheduleChanged: function (inSender, inEvent) {
            // not used at this point
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        goClose: function (inSender, inEvent) {
            this.hide();
            this.doAttendanceClosed();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        viewDetails: function (inSender, inEvent) {
            if (!this.isValidDate(this.$.attendanceDate.getValue())) {
                this.$.popupFactory.showInfo("Invalid Date", "The attendance date is required and " +
                    "should be in the format: 01/09/2015");
                return;
            }

            this.$.lblSelectedSession.show();
            this.setSelectedSessionLabel();
            if (!this.get('.currentOrgReadOnly')) {
                this.$.btnRefresh.show();
            }
            this.$.detailsDisplay.show();
            this.defineDetailsDisplay();
        },

        /**
         * @private
         */
        setSelectedSessionLabel: function () {
            this.dateLabel = this.$.attendanceDate.getValue();
            this.classroomLabel = "";
            this.classScheduleLabel = "";

            // get classroom:
            this.classroomID = this.$.selectClassroom.getValue();

            for (var i=0; i < this.$.selectHelper.optionsLists['classrooms_options_list'].length; i++) {
                if (this.$.selectHelper.optionsLists['classrooms_options_list'][i].value == this.classroomID) {
                    this.classroomLabel = this.$.selectHelper.optionsLists['classrooms_options_list'][i].display_text;
                    break;
                }
            }

            this.scheduleID = this.$.selectSchedule.getValue();

            for (var i=0; i < this.$.selectHelper.optionsLists['class_schedules_options_list'].length; i++) {
                if (this.$.selectHelper.optionsLists['class_schedules_options_list'][i].value == this.scheduleID) {
                    this.classScheduleLabel = this.$.selectHelper.optionsLists['class_schedules_options_list'][i].display_text;
                    break;
                }
            }

            this.$.lblSelectedSession.setContent(this.classroomLabel + ' - ' + this.classScheduleLabel + ': ' + this.dateLabel);
        },

        /**
         * @private
         */
        defineDetailsDisplay: function () {
            if (!this.detailsDisplayInitialized) {

                var testDate = new Date(this.dateLabel).toISOString();
                var attDate = moment(testDate).format('YYYY-MM-DD');

                this.$.detailsDisplay.set('.groupboxHeaderText', 'Attendance Detail');
                this.$.detailsDisplay.set('.hasSimpleSelectButton', false);
                this.$.detailsDisplay.allowsNewRecords = false;

                this.$.detailsDisplay.selectEndpoints = [
                    {
                        endpoint: 'api/v1/ref/attendance-statuses/',
                        name: 'status',
                        parseWith: this.$.selectHelper.parseGenericRefTable
                    }
                ];

                this.$.detailsDisplay.staticPostFields = [
                    {fieldName: 'class_schedule', value: this.$.selectSchedule.getValue()},
                    {fieldName: 'attendance_date', value: attDate}
                ];

                this.$.detailsDisplay.fields = [
                    {
                        fieldName: 'person_attendance_id',
                        postBodyOnly: true,
                        primaryKey: true
                    },
                    {
                        fieldName: 'person',
                        postBodyOnly: true
                    },
                    {
                        fieldName: 'person_id',
                        fieldType: 'TextBox',
                        headerText: 'Person ID',
                        readOnly: true,
                        fieldWidth: 50
                    },
                    {
                        fieldName: 'last_name',
                        fieldType: 'TextBox',
                        headerText: 'Last Name',
                        readOnly: true,
                        fieldWidth: 125
                    },
                    {
                        fieldName: 'first_name',
                        fieldType: 'TextBox',
                        headerText: 'First Name',
                        readOnly: true,
                        fieldWidth: 125
                    },
                    {
                        fieldName: 'attendance_status',
                        fieldType: 'DataSelect',
                        dataSelectName: 'status',
                        headerText: 'Status',
                        fieldWidth: 125
                    },

                ];

                this.$.detailsDisplay.endpoint = 'api/v1/attendance/person-attendance/?class_schedule_id=' +
                    this.scheduleID + '&attendance_date=' + attDate;
                this.$.detailsDisplay.patchEndpoint = 'api/v1/attendance/person-attendance/';
                this.$.detailsDisplay.deleteEndpoint = 'api/v1/attendance/person-attendance/';

                this.$.detailsDisplay.set('maxWidth', 800);

                this.$.detailsDisplay.show();
                this.$.detailsDisplay.createRepeater();

                this.set('.detailsDisplayInitialized', true);
            }
            else {
                var testDate = new Date(this.dateLabel).toISOString();
                var attDate = moment(testDate).format('YYYY-MM-DD');

                this.$.detailsDisplay.staticPostFields = [
                    {fieldName: 'class_schedule', value: this.$.selectSchedule.getValue()},
                    {fieldName: 'attendance_date', value: attDate}
                ];

                this.$.detailsDisplay.endpoint = 'api/v1/attendance/person-attendance/?class_schedule_id=' +
                    this.scheduleID + '&attendance_date=' + attDate;

                this.$.detailsDisplay.refreshData();
            }

        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        refreshAttendance: function (inSender, inEvent) {
            var msg = "Clicking 'Yes' will delete all the existing attendance records for " +
                "this class on this date and recreate them based on the default values set " +
                "for each student. Any changes you have made will be permanently lost. " +
                "Continue anyway?";

            this.set('confirmPopupMode', 'confirmRefresh');
            this.$.popupFactory.showConfirm('Confirm Attendance Refresh', msg);
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         * @returns {boolean}
         */
        popupClosedHandler: function (inSender, inEvent) {
            if (this.get('.confirmPopupMode') == 'confirmRefresh') {

                var testDate = new Date(this.dateLabel).toISOString();
                var attDate = moment(testDate).format('YYYY-MM-DD');

                var postBody = {
                    'attendance_date': attDate,
                    'class_schedule_id': this.scheduleID
                };

                this.api = new oarn.API();
                this.set('.api.token', this.get('.token'));
                this.set('.api.method', 'POST');
                var endpoint = 'api/v1/attendance/create-attendance-records/';
                var ajax = this.api.getAjaxObject(endpoint);
                ajax.postBody = postBody;

                this.doAjaxStarted();
                ajax.go();
                ajax.response(enyo.bindSafely(this, 'postResponse'));
                ajax.error(enyo.bindSafely(this, 'processError'));

                this.set('.confirmPopupMode', '');
                return true;
            }
        },

        /**
         * @private
         * @param inRequest
         * @param inResponse
         */
        postResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.
            this.$.detailsDisplay.refreshData();
        },

        /**
         * @private
         * @param inSender
         * @param inResponse
         * @returns {boolean}
         */
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

        /**
         * Validates that the input string is a valid date formatted as "mm/dd/yyyy"
         * Thanks to Elian Ebbing:
         * http://stackoverflow.com/questions/6177975/how-to-validate-date-with-format-mm-dd-yyyy-in-javascript
         * @param dateString
         * @returns {boolean}
         */
        isValidDate: function (dateString) {
            // First check for the pattern
            if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
                return false;

            // Parse the date parts to integers
            var parts = dateString.split("/");
            var day = parseInt(parts[1], 10);
            var month = parseInt(parts[0], 10);
            var year = parseInt(parts[2], 10);

            // Check the ranges of month and year
            if(year < 1000 || year > 3000 || month == 0 || month > 12)
                return false;

            var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

            // Adjust for leap years
            if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
                monthLength[1] = 29;

            // Check the range of the day
            return day > 0 && day <= monthLength[month - 1];
        }
    });

})(enyo, this);