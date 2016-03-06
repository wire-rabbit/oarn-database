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

        name: 'oarn.SelectHelper',

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
             * This will be an array of objects in the form:
             * {endpoint: 'api/v1/ref/genders/', name: 'gender', parseWith: someFunc, nullRow: true}
             * As each returns from the server, a 'returned' property is added to the object, set to True.
             */
            endpoints: [],

            /**
             * This will be an object containing several arrays, one for each endpoint array item.
             * If the name value of the endpoint object was 'gender', the optionsList array would be
             * called 'gender_options_list'
             */
            optionsLists: {}
        },

        components: [
            {name: 'popupFactory', kind: 'oarn.PopupFactory'}
        ],

        events: {
            // fires when all the endpoints have returned.
            onSelectListsAcquired: '',

            onAjaxError: '',

            onAjaxStarted: '',

            onAjaxFinished: ''
        },

        bindings: [
            {from: '.token', to: '.api.token'}
        ],

        create: function () {
            this.inherited(arguments);

            this.api = new oarn.API();
        },

        loadSelectData: function () {
            for (var i = 0; i < this.endpoints.length; i++) {
                this.set('.api.method', 'GET');
                var ajax = this.api.getAjaxObject(this.endpoints[i].endpoint);
                ajax.go();
                ajax.response(enyo.bindSafely(this, 'processResponse'));
                ajax.error(enyo.bindSafely(this, 'processError'));
            }

            this.doAjaxStarted();
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

        processResponse: function (inRequest, inResponse) {
            for (var i = 0; i < this.endpoints.length; i++) {
                if (inRequest.url.indexOf(this.endpoints[i].endpoint) > -1) {
                    this.endpoints[i].returned = true;

                    var newList = this.endpoints[i].name + '_options_list'
                    this.optionsLists[newList] = [];

                    for (var j = 0; j < inResponse['results'].length; j++) {
                        if (j == 0 && this.endpoints[i].nullRow) {
                            this.optionsLists[newList].push({value: null, display_text: ''});
                        }
                        this.optionsLists[newList].push(this.endpoints[i].parseWith(inResponse['results'][j]));
                    }
                }
            }

            var allReturned = true;
            for (var i = 0; i < this.endpoints.length; i++) {
                if (!this.endpoints[i].returned) {
                    allReturned = false;
                }
            }

            if (allReturned) {
                this.doAjaxFinished();
                this.doSelectListsAcquired();
            }
        },

        parseGenericRefTable: function (row) {
            var pk = '';
            var test = '';
            for (var prop in row) {
                if (row.hasOwnProperty(prop)) {
                    test = test + prop;
                    if (test.indexOf('ref_') == 0) {
                        pk = test;
                        break;
                    }
                    test = '';
                }
            }
            if (pk.length > 0) {
                var item = {
                    value: row[pk],
                    display_text: row['description']
                };
                return item;
            }
            else {
                return null;
            }
        },

        parsePerson: function (row) {
            return {
                value: row['person_id'],
                display_text: row['last_name'] + ', ' + row['first_name']
            };
        },

        parseOrgLocation: function (row) {
            return {
                value: row['organization_location_id'],
                display_text: row['short_name']
            }
        },

        parseClassroom: function (row) {
            return {
                value: row['classroom_id'],
                display_text: row['name']
            }
        },

        parseClassSchedule: function (row) {
            return {
                value: row['class_schedule_id'],
                display_text: row['name'],
                // The class schedule drop downs need a lot of extra detail to process requests - detail that
                // is not included in the drop down itself:
                classroom: row['classroom'],
                sunday: row['sunday'],
                monday: row['monday'],
                tuesday: row['tuesday'],
                wednesday: row['wednesday'],
                thursday: row['thursday'],
                friday: row['friday'],
                saturday: row['saturday']
            }
        }
    });

})(enyo, this);