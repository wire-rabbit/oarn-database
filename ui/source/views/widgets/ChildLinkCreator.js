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
     * @event oarn.ChildLinkCreator#onAjaxError
     * @type {object}
     * @property {string} name - Name of the {@link oarn.ChildLinkCreator} control that
     * generated the event.
     * @property {object} xhrResponse - The error details
     * @public
     */

    /**
     * Fires when an ajax call is started, to alert parents to display spinners, ec.
     *
     * @event oarn.ChildLinkCreator#onAjaxStarted
     * @public
     */

    /**
     * Fires when an ajax call - one not handled locally - has returned, to alert parents to hide spinners, etc.
     *
     * @event oarn.ChildLinkCreator#onAjaxFinished
     * @public
     */

    /**
     * Fires when the popup closes to alert the parent that the control may be safely destroyed.
     *
     * @event oarn.ChildLinkCreator#onFamilyOptionPopupClosed
     * @public
     */

    /**
     * Fires when the ID supplied by the user returns an existing child record.
     *
     * @event oarn.ChildLinkCreator#onChildFound
     * @public
     */

    /**
     * {@link oarn.ChildLinkCreator} is a popup control that allows a user to link an existing child
     * to a given family.
     *
     * @class oarn.ChildLinkCreator
     * @extends onyx.Popup
     * @public
     * @ui
     */
    enyo.kind(/** @lends oarn.ChildLinkCreator.prototype */{

        /**
         * @private
         */
        name: 'oarn.ChildLinkCreator',

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
         * @private
         */
        published:
        /** @lends oarn.ChildLinkCreator.prototype */ {

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
                {kind: 'onyx.GroupboxHeader', content: 'Link Existing Child Record to this Family',
                    class: 'oarn-groupbox-control'},

                {tag: 'table', components: [
                    {tag: 'tr', name: 'instructionsRow', components: [
                        {tag: 'td', name: 'instructionsCell', attributes: [{'colspan':'2'}],
                            classes: 'oarn-control oarn-groupbox-control'}
                    ]},

                    {tag: 'tr', components: [
                        {tag: 'td', components: [{tag: 'label', content: 'Child ID:',
                            attributes:[{'for':'txtChildID'}], classes: 'oarn-control oarn-groupbox-control'}]},
                        {tag: 'td', components: [{name: 'txtChildID', kind: 'enyo.Input', style: 'width:95%;',
                            attributes:[{'maxlength':'20'}, {'type':'number'}],
                            classes: 'oarn-control oarn-groupbox-control'}]}
                    ]},
                    {tag: 'tr', components: [
                        {tag: 'td', components: [{tag: 'label', content: 'Relationship:',
                            attributes:[{'for':'selectChildLinkRelationship'}], classes: 'oarn-control oarn-groupbox-control'}]},
                        {tag: 'td', components: [{name: 'selectChildLinkRelationship', kind: 'oarn.DataSelect',
                            style: 'width:95%;',
                            classes: 'oarn-control oarn-groupbox-control'}]}
                    ]},
                    {tag: 'tr', components: [
                        {tag: 'td', attributes:[{'colspan':'2'}], components: [
                            {kind: 'onyx.Button', content: 'Verify Child Record', classes: 'onyx-dark',
                                ontap: 'verifyExistingChild'}
                        ]}
                    ]},
                    {name: 'rowChildSummary', tag: 'tr', showing: false, components: [
                        {tag: 'td', attributes:[{'colspan':'2'}], components: [
                            {name: 'lblChildSummary', classes: 'oarn-control oarn-groupbox-control',
                                allowHtml: true}
                        ]}
                    ]},
                    {tag: 'tr', showing: false, name: 'rowChildSummaryInstructions', components: [
                        {tag: 'td', attributes:[{'colspan':'2'}], components: [
                            {classes: 'oarn-control oarn-groupbox-control',
                                content: 'If this is the child record you wish to link to this family, press confirm.'}
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

            onChildFound: ''
        },

        /**
         * @private
         */
        handlers: {
            onSelectListsAcquired: 'selectListsAcquiredHandler',

            onChildFound: 'childFoundHandler',

            onPopupClosed: 'popupClosedHandler'
        },

        /**
         * @private
         */
        create: function () {
            this.inherited(arguments);

            this.$.instructionsCell.setContent('This will link an existing child record to this family.');

            this.api = new oarn.API();

            this.$.selectHelper.endpoints.push({endpoint: 'api/v1/ref/child-family-relationship-types/',
                name: 'child_link_relationships',parseWith: this.$.selectHelper.parseGenericRefTable});

            this.$.selectHelper.loadSelectData();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        goCancel: function (inSender, inEvent) {
            this.hide();
            this.doFamilyOptionPopupClosed({'sender':'ChildLinkCreator'});
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

            if (status == 404 && inSender.url.indexOf('family/child/') > 0) {
                this.doChildFound({status:'not found'});
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
            this.$.selectChildLinkRelationship.options_list.empty();
            this.$.selectChildLinkRelationship.options_list.add(this.$.selectHelper.optionsLists['child_link_relationships_options_list']);
        },


        /**
         * Requests verification from the server that a Child ID exists.
         *
         * @private
         * @param inSender
         * @param inEvent
         */
        verifyExistingChild: function (inSender, inEvent) {
            var pk = -1;

            var testPk = this.$.txtChildID.getValue();
            if (Number.isNaN(parseInt(testPk))) {
                this.$.popupFactory.showInfo('Invalid Data', 'The Child ID must be a whole number.');
                return;
            }
            else {
                pk = testPk;
            }

            this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'GET');
            var org_id = this.get('.selectedOrganization.organization_id');
            var endpoint = 'api/v1/family/child-search/?person_id=' + pk + '&organization_id=' + org_id;
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processVerifyResponse'));
            ajax.error(enyo.bindSafely(this, 'processError'));
        },

        /**
         * If a child record has been found corresponding to the supplied ID, a status of 'found' is
         * sent to onChildFound, otherwise 'not found' is sent.
         *
         * @private
         * @param inRequest
         * @param inResponse
         */
        processVerifyResponse: function (inRequest, inResponse) {
            this.doAjaxFinished();
            if (inResponse['results'].length == 0) {
                this.doChildFound({status:'not found'});
            }
            else {
                this.doChildFound({status: 'found'});
            }
        },

        /**
         * If inEvent.status is 'found', the child's details (name, DOB) are retrieved from the server.
         * Otherwise a popup is displayed, indicated that no record was found.
         *
         * @private
         * @param inSender
         * @param inEvent
         * @returns {boolean}
         */
        childFoundHandler: function (inSender, inEvent) {
            if (inEvent.status == 'found') {
                this.existing_child_id = this.$.txtChildID.getValue();
                this.$.txtChildID.setDisabled(true)

                this.set('.api.token', this.get('.token'));
                this.set('.api.method', 'GET');
                var endpoint = 'api/v1/family/person/'+ this.$.txtChildID.getValue() + '/';
                var ajax = this.api.getAjaxObject(endpoint);
                ajax.go();
                ajax.response(enyo.bindSafely(this, 'processChildFoundResponse'));
                ajax.error(enyo.bindSafely(this, 'processError'));
            }
            else {
                this.$.popupFactory.showInfo('Child Not Found', 'No child record with this ID was found.');
            }
            return true;
        },

        /**
         * @private
         * @param inRequest
         * @param inResponse
         */
        processChildFoundResponse: function (inRequest, inResponse) {
            this.$.rowChildSummary.show();
            this.$.rowChildSummaryInstructions.show();
            this.$.confirmCreate.show();

            this.existing_child_id = inResponse['person_id'];

            var testDate = null;
            if (inResponse['birth_date'] != null) {
                testDate = moment(inResponse['birth_date'],'YYYY-MM-DD').format('MM/DD/YYYY');
            }

            if (testDate != null) {
                this.$.lblChildSummary.setContent('Child Detail: <em>' + inResponse['first_name'] + ' ' +
                    inResponse['last_name'] + ', ' + testDate + '</em><br /><br />');
            }
            else {
                this.$.lblChildSummary.setContent('Child Detail: <em>' + inResponse['first_name'] + ' ' +
                    inResponse['last_name'] + '</em><br /><br />');
            }

            this.item = new enyo.Model({
                "person_id": this.existing_child_id,
                "first_name": inResponse['first_name'],
                "last_name": inResponse['last_name'],
                "is_child": true
            });
        },

        /**
         * If confirmed, this method does the actual linking between the child record and the family record.
         *
         * @private
         * @param inSender
         * @param inEvent
         */
        goConfirm: function (inSender, inEvent) {
            var postBody = {
                "child": this.existing_child_id,
                "family": this.get('.selectedFamilyID'),
                "ref_child_family_relationship_type": this.$.selectChildLinkRelationship.getValue(),
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
            this.$.popupFactory.showInfo("Child Linked to Family",
                "The child record with ID: " + this.existing_child_id + " has been linked to this family.");
        },

        /**
         * @private
         */
        clearResults: function () {
            this.$.txtChildID.setValue('');
            this.$.confirmCreate.hide();
            this.$.rowChildSummary.hide();
            this.$.rowChildSummaryInstructions.hide();

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
                this.doFamilyOptionPopupClosed({'sender':'ChildLinkCreator',
                    id:this.existing_child_id, item:this.item});
            }
        }
    });

})(enyo, this);