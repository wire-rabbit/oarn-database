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
     * @event oarn.AdultLinkCreator#onAjaxError
     * @type {Object}
     * @property {String} name - Name of the {@link oarn.AdultLinkCreator} control that
     * generated the event.
     * @property {Object} xhrResponse - The error details
     * @public
     */

    /**
     * Fires when an ajax call is started, to alert parents to display spinners, ec.
     *
     * @event oarn.AdultLinkCreator#onAjaxStarted
     * @public
     */

    /**
     * Fires when an ajax call - one not handled locally - has returned, to alert parents to hide spinners, etc.
     *
     * @event oarn.AdultLinkCreator#onAjaxFinished
     * @public
     */

    /**
     * Fires when the control is closed, signalling the parent that it is safe to destroy the control.
     *
     * @event oarn.onFamilyOptionPopupClosed
     * @public
     */

    /**
     * Fires when the adult search returns from the server.
     *
     * @event oarn.onAdultFound
     * @type {Object}
     * @property {String} status - will be 'found' or 'not found' depending on whether or not any records are returned
     * @public
     */

    /**
     * {@link oarn.AdultLinkCreator} creates a link between an adult already in the system and a given family.
     *
     * @class oarn.AdultLinkCreator
     * @extends onyx.Popup
     * @public
     * @ui
     */
    enyo.kind(/** @lends oarn.AdultLinkCreator.prototype */{

        /**
         * @private
         */
        name: 'oarn.AdultLinkCreator',

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
        published: /** @lends oarn.AdultLinkCreator.prototype */ {
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
                {kind: 'onyx.GroupboxHeader', content: 'Link Existing Adult Record to this Family',
                    class: 'oarn-groupbox-control'},

                {tag: 'table', components: [
                    {tag: 'tr', name: 'instructionsRow', components: [
                        {tag: 'td', name: 'instructionsCell', attributes: [{'colspan':'2'}],
                            classes: 'oarn-control oarn-groupbox-control'}
                    ]},

                    {tag: 'tr', components: [
                        {tag: 'td', components: [{tag: 'label', content: 'Adult ID:',
                            attributes:[{'for':'txtAdultID'}], classes: 'oarn-control oarn-groupbox-control'}]},
                        {tag: 'td', components: [{name: 'txtAdultID', kind: 'enyo.Input', style: 'width:95%;',
                            attributes:[{'maxlength':'20'}, {'type':'number'}],
                            classes: 'oarn-control oarn-groupbox-control'}]}
                    ]},
                    {tag: 'tr', components: [
                        {tag: 'td', components: [{tag: 'label', content: 'Relationship:',
                            attributes:[{'for':'selectAdultLinkRelationship'}], classes: 'oarn-control oarn-groupbox-control'}]},
                        {tag: 'td', components: [{name: 'selectAdultLinkRelationship', kind: 'oarn.DataSelect',
                            style: 'width:95%;',
                            classes: 'oarn-control oarn-groupbox-control'}]}
                    ]},
                    {tag: 'tr', components: [
                        {tag: 'td', attributes:[{'colspan':'2'}], components: [
                            {kind: 'onyx.Button', content: 'Verify Adult Record', classes: 'onyx-dark',
                                ontap: 'verifyExistingAdult'}
                        ]}
                    ]},
                    {name: 'rowAdultSummary', tag: 'tr', showing: false, components: [
                        {tag: 'td', attributes:[{'colspan':'2'}], components: [
                            {name: 'lblAdultSummary', classes: 'oarn-control oarn-groupbox-control',
                                allowHtml: true}
                        ]}
                    ]},
                    {tag: 'tr', showing: false, name: 'rowAdultSummaryInstructions', components: [
                        {tag: 'td', attributes:[{'colspan':'2'}], components: [
                            {classes: 'oarn-control oarn-groupbox-control',
                                content: 'If this is the adult record you wish to link to this family, press confirm.'}
                        ]}
                    ]}
                ]},

                {name: 'confirmCreate', tag: 'table', showing: false, components: [
                    {tag: 'tr', components: [
                        {tag: 'td', components: [
                            {kind: 'onyx.Button', content: 'Confirm Link to Family', classes: 'onyx-affirmative',
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

            onAdultFound: ''
        },

        /**
         * @private
         */
        handlers: {
            onSelectListsAcquired: 'selectListsAcquiredHandler',

            onAdultFound: 'adultFoundHandler',

            onPopupClosed: 'popupClosedHandler'
        },

        /**
         * @method
         * @private
         */
        create: function () {
            this.inherited(arguments);

            this.$.instructionsCell.setContent('This will link an existing adult record to this family.');

            this.api = new oarn.API();

            this.$.selectHelper.endpoints.push({endpoint: 'api/v1/ref/adult-family-relationship-types/',
                name: 'adult_link_relationships',parseWith: this.$.selectHelper.parseGenericRefTable});

            this.$.selectHelper.loadSelectData();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        goCancel: function (inSender, inEvent) {
            this.hide();
            this.doFamilyOptionPopupClosed({'sender':'AdultLinkCreator'});
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

            if (status == 404 && inSender.url.indexOf('family/adult/') > 0) {
                this.doAdultFound({status:'not found'});
                return;
            }
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
         * @private
         * @param inSender
         * @param inEvent
         */
        selectListsAcquiredHandler: function (inSender, inEvent) {
            this.$.selectAdultLinkRelationship.options_list.empty();
            this.$.selectAdultLinkRelationship.options_list.add(this.$.selectHelper.optionsLists['adult_link_relationships_options_list']);
        },

        /**
         * Does the adult ID supplied match an existing adult record?
         *
         * @private
         * @param inSender
         * @param inEvent
         */
        verifyExistingAdult: function (inSender, inEvent) {
            var pk = -1;

            var testPk = this.$.txtAdultID.getValue();
            if (Number.isNaN(parseInt(testPk))) {
                this.$.popupFactory.showInfo('Invalid Data', 'The Adult ID must be a whole number.');
                return;
            }
            else {
                pk = testPk;
            }

            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'GET');

            var org_id = this.get('.selectedOrganization.organization_id');
            var endpoint = 'api/v1/family/adult-search/?person_id='+ pk + '&organization_id=' + org_id;
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processVerifyResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));
        },

        /**
         * @private
         * @param inRequest
         * @param inResponse
         */
        processVerifyResponse: function (inRequest, inResponse) {
            this.doAjaxFinished();
            if (inResponse['results'].length == 0) {
                this.doAdultFound({status:'not found'});
            }
            else {
                this.doAdultFound({status: 'found'});
            }
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         * @returns {boolean}
         */
        adultFoundHandler: function (inSender, inEvent) {
            if (inEvent.status == 'found') {
                this.existing_adult_id = this.$.txtAdultID.getValue();
                this.$.txtAdultID.setDisabled(true);

                this.set('.api.token', this.get('.token'));
                this.set('.api.method', 'GET');
                var endpoint = 'api/v1/family/person/'+ this.$.txtAdultID.getValue() + '/';
                var ajax = this.api.getAjaxObject(endpoint);
                ajax.go();
                ajax.response(enyo.bindSafely(this, 'processAdultFoundResponse'));
                ajax.error(enyo.bindSafely(this, 'processError'));
            }
            else {
                this.$.popupFactory.showInfo('Adult Not Found', 'No adult record with this ID was found.');
            }

            return true;
        },

        /**
         * @private
         * @param inRequest
         * @param inResponse
         */
        processAdultFoundResponse: function (inRequest, inResponse) {
            this.$.rowAdultSummary.show();
            this.$.rowAdultSummaryInstructions.show();
            this.$.confirmCreate.show();

            this.existing_adult_id = inResponse['person_id'];

            var testDate = null;
            if (inResponse['birth_date'] != null) {
                testDate = moment(inResponse['birth_date'],'YYYY-MM-DD').format('MM/DD/YYYY');
            }

            if (testDate != null) {
                this.$.lblAdultSummary.setContent('Adult Detail: <em>' + inResponse['first_name'] + ' ' +
                    inResponse['last_name'] + ', ' + testDate + '</em><br /><br />');
            }
            else {
                this.$.lblAdultSummary.setContent('Adult Detail: <em>' + inResponse['first_name'] + ' ' +
                    inResponse['last_name'] + '</em><br /><br />');
            }

            this.item = new enyo.Model({
                "person_id": this.existing_adult_id,
                "first_name": inResponse['first_name'],
                "last_name": inResponse['last_name'],
                "is_child": false
            });
        },

        /**
         * Creates the link between an adult and a family
         *
         * @private
         * @param inSender
         * @param inEvent
         */
        goConfirm: function (inSender, inEvent) {
            var postBody = {
                "adult": this.existing_adult_id,
                "family": this.get('.selectedFamilyID'),
                "ref_adult_family_relationship_type": this.$.selectAdultLinkRelationship.getValue(),
                "relationship_begin_date": null,
                "relationship_end_date": null
            }

            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'POST');
            var endpoint = 'api/v1/family/adult-family-relationship/';
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
            this.$.popupFactory.showInfo("Adult Linked to Family",
                "The adult record with ID: " + this.existing_adult_id + " has been linked to this family.");
        },

        /**
         * @private
         */
        clearResults: function () {
            this.$.txtAdultID.setValue('');
            this.$.confirmCreate.hide();
            this.$.rowAdultSummary.hide();
            this.$.rowAdultSummaryInstructions.hide();

            this.hide();
            this.show();
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
         * @param inSender
         * @param inEvent
         */
        popupClosedHandler: function (inSender, inEvent) {
            if (this.get('.family_link_created_flag')) {
                this.hide();
                this.doFamilyOptionPopupClosed({'sender':'AdultLinkCreator',
                    id:this.existing_adult_id, item:this.item});
            }
        }
    });

})(enyo, this);