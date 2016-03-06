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
     * @event oarn.ChildRecordCreator#onAjaxError
     * @type {object}
     * @property {string} name - Name of the {@link oarn.ChildRecordCreator} control that
     * generated the event.
     * @property {object} xhrResponse - The error details
     * @public
     */

    /**
     * Fires when an ajax call is started, to alert parents to display spinners, ec.
     *
     * @event oarn.ChildRecordCreator#onAjaxStarted
     * @public
     */

    /**
     * Fires when an ajax call - one not handled locally - has returned, to alert parents to hide spinners, etc.
     *
     * @event oarn.ChildRecordCreator#onAjaxFinished
     * @public
     */

    /**
     * Fires when the popup closes to alert the parent that the control may be destroyed.
     *
     * @event oarn.ChildrecordCreator#onFamilyOptionPopupClosed
     * @public
     */


    /**
     *
     * @event oarn.ChildrecordCreator#onPersonCreated
     * @public
     */

    /**
     *
     * @event oarn.ChildrecordCreator#onSelectedPersonChanged
     * @public
     */

    /**
     * {@link oarn.ChildRecordCreator} is a popup that allows a user to create a new child record, linked to
     * the currently selected family.
     *
     * @class oarn.ChildRecordCreator
     * @extends onyx.Popup
     * @public
     * @ui
     */
    enyo.kind(/** @lends oarn.ChildRecordCreator.prototype */{

        /**
         * @private
         */
        name: 'oarn.ChildRecordCreator',

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
        style: 'background-color: #EAEAEA',

        /**
         * @public
         */
        published:
        /** @lends oarn.ChildRecordCreator.prototype */{

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

        /**
         * @private
         */
        components: [
            {kind: 'onyx.Groupbox', style: 'width: 500px;', components: [
                {kind: 'onyx.GroupboxHeader', content: 'Create New Child Record', class: 'oarn-groupbox-control'},
                {tag: 'table', components: [
                    {tag: 'tr', name: 'instructionsRow', components: [
                        {tag: 'td', name: 'instructionsCell', attributes: [{'colspan':'2'}],
                            classes: 'oarn-control oarn-groupbox-control'}
                    ]},
                    {tag: 'tr', components: [
                        {tag: 'td', attributes:[{'colspan':'2'}], components: [
                            {tag: 'table', components: [
                                {tag: 'tr', components: [
                                    {tag: 'td', components: [{tag: 'label', content: 'First Name:',
                                        attributes:[{'for':'txtFirstName'}], classes: 'oarn-control oarn-groupbox-control'}]},
                                    {tag: 'td', components: [{name: 'txtFirstName', kind: 'enyo.Input', style: 'width:95%;',
                                        attributes:[{'maxlength':'35'}], classes: 'oarn-control oarn-groupbox-control'}]}
                                ]},
                                {tag: 'tr', components: [
                                    {tag: 'td', components: [{tag: 'label', content: 'Last Name:',
                                        attributes:[{'for':'txtLastName'}], classes: 'oarn-control oarn-groupbox-control'}]},
                                    {tag: 'td', components: [{name: 'txtLastName', kind: 'enyo.Input', style: 'width:95%;',
                                        attributes:[{'maxlength':'35'}], classes: 'oarn-control oarn-groupbox-control'}]}
                                ]},
                                {tag: 'tr', components: [
                                    {tag: 'td', components: [{tag: 'label', content: 'Gender:',
                                        attributes:[{'for':'selectGender'}], classes: 'oarn-control oarn-groupbox-control'}]},
                                    {tag: 'td', components: [{name: 'selectGender', kind: 'oarn.DataSelect', style: 'width:95%;',
                                        classes: 'oarn-control oarn-groupbox-control'}]}
                                ]},
                                {tag: 'tr', components: [
                                    {tag: 'td', components: [{tag: 'label', content: 'Birth Date:',
                                        attributes:[{'for':'txtBirthDate'}], classes: 'oarn-control oarn-groupbox-control'}]},
                                    {tag: 'td', components: [{name: 'txtBirthDate', kind: 'oarn.DatePicker',
                                        emptyIsValid: true, width: '95%', classes: 'oarn-control oarn-groupbox-control'}]}
                                ]},
                                {tag: 'tr', components: [
                                    {tag: 'td', components: [{tag: 'label', content: 'Relationship:',
                                        attributes:[{'for':'selectChildRelationship'}], classes: 'oarn-control oarn-groupbox-control'}]},
                                    {tag: 'td', components: [{name: 'selectChildRelationship', kind: 'oarn.DataSelect', style: 'width:95%;',
                                        classes: 'oarn-control oarn-groupbox-control'}]}
                                ]}
                            ]}
                        ]}
                    ]},
                    {tag: 'tr', components: [
                        {tag: 'td', components: [
                            {kind: 'onyx.Button', content: 'Duplicates Check', classes: 'onyx-dark',
                                ontap: 'checkDuplicates'}
                        ]}
                    ]}
                ]},
                {name: 'dupesScroller', showing: false, kind: 'enyo.Scroller',
                    maxHeight: '150px', components: [
                    {name: 'dupesWarning', classes: 'oarn-control oarn-groupbox-control',
                        style: 'max-width:500px'}, // text set in create
                    {name: 'repeater', kind: 'enyo.Repeater', multiSelect: false, onSetupItem: 'setupItem',
                        components: [
                            {name: 'itemWrapper', components: [
                                {tag: 'table', components: [
                                    {tag: 'tr', components: [
                                        {tag: 'td', components: [
                                            {kind: 'onyx.Button', content: 'View', ontap:'goView'}
                                        ]},
                                        {tag: 'td', components: [
                                            {name: 'dupeID', kind: 'enyo.Input', style: 'width: 60px',
                                                classes: 'oarn-control oarn-groupbox-control', disabled: true}
                                        ]},
                                        {tag: 'td', components: [
                                            {name: 'dupeFirstName', kind: 'enyo.Input', style: 'width: 125px',
                                                classes: 'oarn-control oarn-groupbox-control', disabled: true}
                                        ]},
                                        {tag: 'td', components: [
                                            {name: 'dupeLastName', kind: 'enyo.Input', style: 'width: 125px',
                                                classes: 'oarn-control oarn-groupbox-control', disabled: true}
                                        ]},
                                        {tag: 'td', components: [
                                            {name: 'dupeDOB', kind: 'enyo.Input', style: 'width: 95px',
                                                classes: 'oarn-control oarn-groupbox-control', disabled: true}
                                        ]}
                                    ]}
                                ]}
                            ]}
                        ]
                    }
                ]},

                {name: 'confirmCreate', tag: 'table', showing: false, components: [
                    {tag: 'tr', components: [
                        {tag: 'td', components: [
                            {kind: 'onyx.Button', content: 'Confirm Child Record Creation', classes: 'onyx-affirmative',
                                ontap: 'goConfirm'}
                        ]}
                    ]}
                ]},

                {name: 'buttonsRow', style: 'text-align: center; padding-top:5px',
                    components: [
                        {name: 'btnCancel', kind: 'onyx.Button', content: 'Close',
                            style: 'margin: 5px 5px 5px 5px',	ontap: 'goCancel'}
                ]},
            ]},

            {name: 'selectHelper', kind: 'oarn.SelectHelper'},

            {name: 'popupFactory', kind: 'oarn.PopupFactory'}
        ],

        /**
         * @private
         */
        events: {
            onAjaxError: '',

            onAjaxStarted: '',

            onAjaxFinished: '',

            onFamilyOptionPopupClosed: '',

            onDuplicateSelected: '',

            onPersonCreated: '',

            onSelectedPersonChanged: ''
        },

        /**
         * @private
         */
        handlers: {
            onSelectListsAcquired: 'selectListsAcquiredHandler',

            onPersonCreated: 'personCreatedHandler',

            onPopupClosed: 'popupClosedHandler'
        },

        /**
         * @private
         */
        create: function () {
            this.inherited(arguments);

            this.$.instructionsCell.setContent('This will create a new child record and link it to this family. ' +
                'Although basic duplicates checking is performed, it is assumed that you have already verified ' +
                'that the child is not in the system.');

            this.api = new oarn.API();

            this.$.selectHelper.endpoints.push({endpoint: 'api/v1/ref/genders/', name: 'genders',
                parseWith: this.$.selectHelper.parseGenericRefTable});

            this.$.selectHelper.endpoints.push({endpoint: 'api/v1/ref/child-family-relationship-types/',
                name: 'child_record_relationships',parseWith: this.$.selectHelper.parseGenericRefTable});

            this.getClientRole(); // start looking for the 'Client' role's ref_role_id number.
            this.$.selectHelper.loadSelectData();
        },

        /**
         * @private
         */
        goCancel: function (inSender, inEvent) {
            this.hide();
            this.doFamilyOptionPopupClosed({'sender':'ChildRecordCreator'});
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
         * When creating a new client record, the 'Client' role ID must be retrieved first.
         *
         * @private
         */
        getClientRole: function () {
            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'GET');
            var endpoint = 'api/v1/ref/roles/';
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processClientResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));

            this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
        },

        /**
         * @private
         * @param inRequest
         * @param inResponse
         */
        processClientResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            this.client_role_id = -1;
            for (var i = 0; i < inResponse['results'].length; i++) {
                if (inResponse['results'][i]['description'] == 'Client') {
                    this.client_role_id = inResponse['results'][i]['ref_role_id'];
                    break;
                }
            }
        },

        /**
         * Handles the processing of select list data when it is retrieved from the server.
         *
         * @private
         * @param inSender
         * @param inEvent
         */
        selectListsAcquiredHandler: function (inSender, inEvent) {
            this.$.selectGender.options_list.empty();
            this.$.selectGender.options_list.add(this.$.selectHelper.optionsLists['genders_options_list']);

            this.$.selectChildRelationship.options_list.empty();
            this.$.selectChildRelationship.options_list.add(this.$.selectHelper.optionsLists['child_record_relationships_options_list']);
        },

        /**
         * Performs a fuzzy match of the person details entered as a check against possible duplicates.
         *
         * @private
         * @param inSender
         * @param inEvent
         */
        checkDuplicates: function (inSender, inEvent) {
            if (this.$.txtFirstName.getValue().length == 0) {
                this.$.popupFactory.showInfo('Invalid Data', 'A first name is required.');
                return;
            }

            if (this.$.txtLastName.getValue().length == 0) {
                this.$.popupFactory.showInfo('Invalid Data', 'A last name is required.');
                return;
            }

            if (this.$.txtBirthDate.getValue().length > 0 &&
                Number.isNaN(Date.parse(this.$.txtBirthDate.getValue()))) {
                this.$.popupFactory.showInfo('Invalid Data', 'The birth date does not appear to be a valid date.');
                return;
            }

            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'GET');
            var org_id = this.get('.selectedOrganization.organization_id');
            var endpoint = 'api/v1/family/child-search/?organization_id=' + org_id +
                '&fuzzy_match='+ this.$.txtFirstName.getValue() + ' ' + this.$.txtLastName.getValue();
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));

            this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
        },

        /**
         * @private
         * @param inRequest
         * @param inResponse
         */
        processResponse: function (inRequest, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            var details = [];
            for (var i = 0; i < inResponse['results'].length; i++) {
                var detail = {
                    'person_id': inResponse['results'][i]['person_id'],
                    'first_name': inResponse['results'][i]['first_name'],
                    'last_name': inResponse['results'][i]['last_name'],
                    'birth_date': inResponse['results'][i]['birth_date'],
                    'gender': inResponse['results'][i]['gender'],
                    'is_child': inResponse['results'][i]['is_child']
                };
                details.push(detail);
            }

            this.collection = new enyo.Collection();
            this.collection.add(details);

            this.$.confirmCreate.show();

            if (this.collection.length  > 0) {
                this.$.dupesScroller.show();
                this.$.repeater.setCount(this.collection.length);
                this.redraw();
            }
            else {
                this.$.repeater.setCount(0);
                this.$.dupesScroller.hide();
                this.redraw();
            }
        },

        /**
         * If duplicates have been found, this method populates the repeater with their data.
         *
         * @private
         * @param inSender
         * @param inEvent
         */
        setupItem: function (inSender, inEvent) {
            var item = inEvent.item;

            item.$.dupeID.setValue(this.collection.at(inEvent.index).get('person_id'));
            item.$.dupeFirstName.setValue(this.collection.at(inEvent.index).get('first_name'));
            item.$.dupeLastName.setValue(this.collection.at(inEvent.index).get('last_name'));

            var testDate = null;
            if (this.collection.at(inEvent.index).get('birth_date') != null) {
                testDate = moment(this.collection.at(inEvent.index).get(
                    'birth_date'),'YYYY-MM-DD').format('MM/DD/YYYY');
            }
            item.$.dupeDOB.setValue(testDate);

        },

        /**
         * If a potential duplicate record is discovered and the user chooses to view that record rather than
         * continuing with the creation of a new one, this closes the popup and signals the parent to jump
         * to the potential duplicate child's record.
         *
         * @private
         * @param inSender
         * @param inEvent
         */
        goView: function (inSender, inEvent) {
            var newItem = new enyo.Model({'is_child':true});
            this.hide();
            this.doFamilyOptionPopupClosed({'sender':'ChildRecordCreator',
                id:this.collection.at(inEvent.index).get('person_id'), item:newItem});
        },

        /**
         * @private
         */
        redraw: function () {
            this.hide();
            this.show();
        },

        /**
         * @private
         */
        goConfirm: function (inSender, inEvent) {
            if (this.client_role_id == undefined ||
                this.client_role_id == -1) {
                this.$.popupFactory.showInfo('Error', 'No client role was found. ' +
                    'Please contact your database administrator.');
                return;
            }
            else {
                var testDate = null;
                if (!Number.isNaN(Date.parse(this.$.txtBirthDate.getValue()))) {
                    testDate = new Date(this.$.txtBirthDate.getValue()).toISOString();
                    testDate = moment(testDate).format('YYYY-MM-DD');
                }

                var postBody = {
                    "first_name": this.$.txtFirstName.getValue(),
                    "last_name": this.$.txtLastName.getValue(),
                    "birth_date": testDate,
                    "ref_gender": this.$.selectGender.getValue(),
                    "organization_id": this.selectedOrganization.organization_id,
                    "ref_role_id": this.client_role_id
                };

                this.set('.api.token', this.get('.token'));
                this.set('.api.method', 'POST');
                var endpoint = 'api/v1/family/person/create/';
                var ajax = this.api.getAjaxObject(endpoint);
                ajax.postBody = postBody;
                ajax.go();
                ajax.response(enyo.bindSafely(this, 'processPersonResponse'));
                ajax.error(enyo.bindSafely(this, 'processError'));
            }
        },

        /**
         * @private
         * @param inRequest
         * @param inResponse
         */
        processPersonResponse: function (inRequest, inResponse) {
            //this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            this.new_person_id = -1;
            if (inResponse['person_id'] !== null) {
                this.new_person_id = inResponse['person_id'];
            }

            this.doPersonCreated();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         * @returns {boolean}
         */
        personCreatedHandler: function (inSender, inEvent) {
            // now create a child record:
            var postBody = {
                "person": this.new_person_id
            };

            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'POST');
            var endpoint = 'api/v1/family/child/';
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.postBody = postBody;
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processChildResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));

            return true;
        },

        processChildResponse: function () {
            // We already know the child primary key is the same as the person_id created earlier.
            // We can now create the link to the family.
            var postBody = {
                "child": this.new_person_id,
                "family": this.get('.selectedFamilyID'),
                "ref_child_family_relationship_type": this.$.selectChildRelationship.getValue(),
                "relationship_begin_date": null,
                "relationship_end_date": null
            }

            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'POST');
            var endpoint = 'api/v1/family/child-family-relationship/';
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.postBody = postBody;
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processFamilyResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));
        },

        /**
         * @private
         * @param inRequest
         * @param inResponse
         */
        processFamilyResponse: function (inRequest, inResponse) {
            this.doAjaxFinished();
            this.set('.family_link_created_flag', true);
            this.$.popupFactory.showInfo("Child Record Created", "New Child ID: " + this.new_person_id);
        },

        /**
         * @private
         */
        clearResults: function () {
            this.$.repeater.setCount(0);
            this.collection = new enyo.Collection();
            this.$.txtFirstName.setValue('');
            this.$.txtLastName.setValue('');
            this.$.txtBirthDate.setValue('');
            this.$.dupesScroller.hide();
            this.$.confirmCreate.hide();

            this.hide();
            this.show();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        popupClosedHandler: function (inSender, inEvent) {
            if (this.get('.family_link_created_flag')) {
                var newItem = new enyo.Model({
                    "person_id": this.new_person_id,
                    "first_name": this.$.txtFirstName.getValue(),
                    "last_name": this.$.txtLastName.getValue(),
                    "gender": this.$.selectGender.options_list.at(this.$.selectGender.selected).get('display_text'),
                    "is_child": true
                });

                this.hide();
                this.doFamilyOptionPopupClosed({'sender':'ChildRecordCreator',
                    id:this.new_person_id, item:newItem});
            }
        }
    });

})(enyo, this);