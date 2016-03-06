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
     * @event oarn.ChildFamilyRelationships#onAjaxError
     * @type {object}
     * @property {string} name - Name of the {@link oarn.ChildFamilyRelationships} control that
     * generated the event.
     * @property {object} xhrResponse - The error details
     * @public
     */

    /**
     * Fires when an ajax call is started, to alert parents to display spinners, ec.
     *
     * @event oarn.ChildFamilyRelationships#onAjaxStarted
     * @public
     */

    /**
     * Fires when an ajax call - one not handled locally - has returned, to alert parents to hide spinners, etc.
     *
     * @event oarn.ChildFamilyRelationships#onAjaxFinished
     * @public
     */


    /**
     * {@link oarn.ChildFamilyRelationships} is a control that allows a user to describe the history of
     * the relationship between a child and a family.
     *
     * @class oarn.ChildFamilyRelationships
     * @extends enyo.Control
     * @public
     * @ui
     */
	enyo.kind(/** @lends oarn.ChildFamilyRelationships.prototype */{

        /**
         * @private
         */
		name: 'oarn.ChildFamilyRelationships',

        /**
         * @private
         */
		kind: 'enyo.Control',

        /**
         * @private
         */
		relationship_type_options_list: [],

		/**
		 * @lends oarn.ChildFamilyRelationships.prototype
		 * @public
		 */
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
			 * The person_id of the person whose details are displayed.
			 *
			 * @type {number}
			 * @public
			 */
			selectedPersonID: 0,

			/**
			 * The family_id of the displayed relationship details.
			 *
			 * @type {number}
			 * @public
			 */
			selectedFamilyID: 0
		},

        /**
         * @private
         */
		components: [
			{kind: 'onyx.Groupbox', style: 'max-width: 450px', components: [
				{kind: 'onyx.GroupboxHeader', components: [
					{content: 'Family Relationship Details', tag: 'span', classes: 'oarn-header'},
					{kind: 'onyx.TooltipDecorator', style: 'display: inline; float:right;', components: [
						{name: 'editButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
							src: 'static/assets/edit-small.png', ontap: 'viewDetails'},
						{kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
							content: 'View or edit this child\'s family relationship history.'}
					]}
				]},
				{tag: 'table', components: [
					{tag: 'tr', components: [
						{tag: 'td', components: [
							{tag: 'label', content: 'Relationship Type:',
								classes: 'oarn-control oarn-groupbox-control',
								attributes: [{'for': 'lblRelationshipType'}]}
						]},
						{tag: 'td', components: [
							{name: 'lblRelationshipType', kind: 'enyo.Input', style: 'width: 95%',
								classes: 'oarn-control', disabled: true, attributes: [{'maxlength': 100}]}
						]}
					]},
					{tag: 'tr', components: [
						{tag: 'td', components: [
							{tag: 'label', content: 'Relationship Begin Date:',
								classes: 'oarn-control oarn-groupbox-control',
								attributes: [{'for': 'lblBeginDate'}]}
						]},
						{tag: 'td', components: [
							{name: 'lblBeginDate', kind: 'enyo.Input', style: 'width: 95%',
								classes: 'oarn-control', disabled: true, attributes: [{'maxlength': 100}]}
						]}
					]},
					{tag: 'tr', components: [
						{tag: 'td', components: [
							{tag: 'label', content: 'Relationship End Date:',
								classes: 'oarn-control oarn-groupbox-control',
								attributes: [{'for': 'lblBeginDate'}]}
						]},
						{tag: 'td', components: [
							{name: 'lblEndDate', kind: 'enyo.Input', style: 'width: 95%',
								classes: 'oarn-control', disabled: true, attributes: [{'maxlength': 100}]}
						]}
					]}
				]}
			]},

			{name: 'detailsPopup', kind: 'onyx.Popup', autoDismiss: false, modal: true,
				centered: true, scrim: true, floating: true, style: 'background-color: #EAEAEA',
				components: [
					{kind: 'onyx.Groupbox', style: 'background-color: #EAEAEA', components: [
						{name: 'mainHeader', kind: 'onyx.GroupboxHeader',
							content: 'Child-Family Relationship History'},

						{kind: 'Scroller', style: 'height:125px;', components: [
							{tag: 'table', style: 'width:100%', components: [
								{tag: 'tr', components: [
									{tag: 'td', style: 'text-align: right', components: [
										{tag: 'span', content: 'Begin Date',
											classes: 'oarn-groupbox-column-header'}
									]},
									{tag: 'td', style: 'text-align: right', components: [
										{tag: 'span', content: 'End Date',
											classes: 'oarn-groupbox-column-header'}
									]},
									{tag: 'td', style: 'text-align: right; padding-left:10px', components: [
										{tag: 'span', content: 'Relationship Type',
											classes: 'oarn-groupbox-column-header'}
									]},
									{tag: 'td', components: [
										{tag: 'span', allowHtml:true, content: '&nbsp;'}
									]}
								]}
							]},
							{name: 'repeater', kind: 'enyo.Repeater', multiSelect: false, onSetupItem: 'setupItem',
								components: [
									{name: 'itemWrapper', tag: 'table',
										style: 'width: 100%; border: 1px solid darkgray; border-collapse: collapse;',
										classes: 'oarn-control', components: [
										{tag: 'tr', components: [
											{tag: 'td', components: [
												{name: 'begin_date', kind: 'oarn.DatePicker',
													style: 'display: inline', classes: 'oarn-control',
													backgroundColor: '#EAEAEA', emptyIsValid: true},
												{name: 'readonly_begin_date', kind: 'enyo.Input', showing: false,
													classes: 'oarn-control', disabled: true}
											]},
											{tag: 'td', components: [
												{name: 'end_date', kind: 'oarn.DatePicker',
													style: 'display: inline', classes: 'oarn-control',
													backgroundColor: '#EAEAEA', emptyIsValid: true},
												{name: 'readonly_end_date', kind: 'enyo.Input', showing: false,
													classes: 'oarn-control', disabled: true}
											]},
											{tag: 'td', components: [
												{name: 'relationship_type', kind: 'oarn.DataSelect',
													style: 'display: inline', classes: 'oarn-control'
												},
												{name: 'readonly_relationship_type', kind: 'enyo.Input',
													classes: 'oarn-control',
													style: 'display: inline; background-color: #EAEAEA',
													showing: false, disabled: true},
											]},
											{tag: 'td', style: 'text-align: center; padding-left:15px', components: [
												{kind: 'enyo.Control', style: 'display: inline', components: [
													{name: 'deleteButton', kind: 'onyx.IconButton',
														classes: 'oarn-icon-button',
														src: 'static/assets/blue-delete.png', ontap: 'goDelete'}
												]},
												{kind: 'enyo.Control', style: 'display: inline', components: [
													{name: 'saveButton', kind: 'onyx.IconButton',
														classes: 'oarn-icon-button',
														src: 'static/assets/save-small.png', ontap: 'goSave'}
												]}
											]}

										]}
									]}
								]}
						]},

						{name: 'newRecord', components: [
							{kind: 'onyx.GroupboxHeader', classes: 'oarn-new-row-header', components: [
								{content: 'New Child-Family Relationship Record:', classes: 'oarn-header', tag:'span'},
								{kind: 'onyx.TooltipDecorator', style: 'display: inline; float:right', components: [
									{name: 'newButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
										src: 'static/assets/blue-add.png', ontap: 'goNew'},
									{kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
										content: 'Create a new record.'}
								]}
							]},
							{tag: 'table', components:[
								{tag: 'tr', components: [
									{tag: 'td', components: [
										{name: 'new_begin_date', kind: 'oarn.DatePicker',
											style: 'display: inline', classes: 'oarn-control',
											backgroundColor: '#EAEAEA', emptyIsValid: true}
									]},
									{tag: 'td', components: [
										{name: 'new_end_date', kind: 'oarn.DatePicker',
											style: 'display: inline', classes: 'oarn-control',
											backgroundColor: '#EAEAEA', emptyIsValid: true}
									]},
									{tag: 'td', components: [
										{name: 'new_relationship_type', kind: 'oarn.DataSelect',
											style: 'display: inline', classes: 'oarn-control'
										}
									]}
								]}
							]}
						]},

						{name: 'buttonsRow', style: 'text-align: center; padding-top:5px',
							components: [
								{name: 'btnCancel', kind: 'onyx.Button', content: 'Close',
									style: 'margin: 5px 5px 5px 5px',	ontap: 'closeDetails'}
							]}

					]}
				]},
			{name: 'popupFactory', kind: 'oarn.PopupFactory'}
		],

		/**
		 * @private
		 */
		events: {
			onAjaxError: '',

			onAjaxStarted: '',

			onAjaxFinished: '',

			onRelationshipTypeOptionsReturned: '' // handled locally

		},

		handlers: {
			onRelationshipTypeOptionsReturned: 'relationshipTypeOptionsReturnedHandler',

			onPopupClosed: 'popupClosedHandler'
		},

		create: function () {
			this.inherited(arguments);

			this.api = new oarn.API();
		},


		selectedPersonIDChanged: function (inOldVal) {
			if (this.relationship_type_options_list.length == 0) {
				this.loadSelectData();
			}
		},

		loadSelectData: function () {
			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'GET');
			var endpoint = 'api/v1/ref/child-family-relationship-types/';
			var ajax = this.api.getAjaxObject(endpoint);
			ajax.go();
			ajax.response(enyo.bindSafely(this, 'processRelationshipTypesResponse'));
			ajax.error(enyo.bindSafely(this, 'processError')); // we can share error handling

			this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
		},


		/**
		 * Handles ajax errors with a popup alert.
		 *
		 * @param inSender
		 * @param inResponse
		 * @private
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
				' retrieve data from the server. ' +
				'Please provide the following information to your database administrator: ' +
				'<br><br>' + 'status: ' + status + '<br>' + detail_msg);

			this.set('.xhrResponse', inSender.xhrResponse);
			return true;
		},

		/**
		 * Handles the incoming data for the relationship types select box.
		 *
		 * @private
		 * @param inRequest
		 * @param inResponse
		 */
		processRelationshipTypesResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			var details = [];
			details.push({value: null, display_text: ''}); // let the user select a null row.

			for (var i = 0; i < inResponse['results'].length; i++) {
				if (inResponse['results'][i] !== undefined) {
					var detail = {
						value: inResponse['results'][i]['ref_child_family_relationship_type_id'],
						display_text: inResponse['results'][i]['description']
					};
					details.push(detail);
				}

			}
			this.relationship_type_options_list = details;
			this.doRelationshipTypeOptionsReturned();
		},

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
		relationshipTypeOptionsReturnedHandler: function (inSender, inEvent) {
			this.$.new_relationship_type.options_list.add(this.relationship_type_options_list);
			this.refreshData(); // load a fresh batch of languages for this person record.
		},

        /**
         * @private
         */
		refreshData: function () {
			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'GET');
			var endpoint = 'api/v1/family/child-family-relationship/?person_id=' +
				this.get('.selectedPersonID') + '&family_id=' + this.get('.selectedFamilyID');
			var ajax = this.api.getAjaxObject(endpoint);
			ajax.go();
			ajax.response(enyo.bindSafely(this, 'processResponse'));
			ajax.error(enyo.bindSafely(this, 'processError'));

			this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
		},

        /**
         * @private
         */
		processResponse: function (inRequest, inResponse) {
			this.doAjaxFinished();
			var details = [];
			var latestDateIndex = -1;
			var latestDate = null;

			for (var i = 0; i < inResponse['results'].length; i++) {


				var detail = {
					"child_family_relationship_id": inResponse['results'][i]['child_family_relationship_id'],
					"child": inResponse['results'][i]['child'],
					"ref_child_family_relationship_type": inResponse['results'][i]['ref_child_family_relationship_type'],
					"relationship_begin_date": inResponse['results'][i]['relationship_begin_date'],
					"relationship_end_date": inResponse['results'][i]['relationship_end_date'],
					"read_only": inResponse['results'][i]['read_only']
				};

				if (detail['relationship_begin_date'] != null) {
					detail['relationship_begin_date'] = moment(detail['relationship_begin_date'],
						'YYYY-MM-DD').format('MM/DD/YYYY');
				}
				if (detail['relationship_end_date'] != null) {
					detail['relationship_end_date'] = moment(detail['relationship_end_date'],
						'YYYY-MM-DD').format('MM/DD/YYYY');
				}

				details.push(detail);

				if (!detail['relationship_end_date']) {
					latestDateIndex = i;
				}
				else {
					if (moment(detail['relationship_end_date']) > latestDate) {
						latestDate = moment(detail['relationship_end_date']);
						latestDateIndex = i;
					}
				}
			}

			if (details.length > 0) {
				var index = -1;

				if (latestDate != null) {
					index = latestDateIndex;
				}
				else {
					index = 0;
				}

				var option_index = -1;
				for (var i = 0; i < this.relationship_type_options_list.length; i++ ) {
					if (this.relationship_type_options_list[i].value ==
						details[index]['ref_child_family_relationship_type']) {
						option_index=i;
						break;
					}
				}

				this.$.lblRelationshipType.setValue(this.relationship_type_options_list[option_index].display_text);
				this.$.lblBeginDate.setValue(details[index]['relationship_begin_date']);
				this.$.lblEndDate.setValue(details[index]['relationship_end_date']);
			}

			this.collection = new enyo.Collection();
			this.collection.add(details);

			if (this.$.detailsPopup.showing) {
				this.$.repeater.setCount(this.collection.length);
			}
		},

        /**
         * @private
         */
		viewDetails: function (inSender, inEvent) {
			this.$.repeater.setCount(this.collection.length);
			this.$.detailsPopup.show();
		},

        /**
         * @private
         */
		closeDetails: function (inSender, inEvent) {
			this.$.detailsPopup.hide();
		},

        /**
         * @private
         */
		setupItem: function (inSender, inEvent) {
			var item = inEvent.item;

			var readonly = this.collection.at(inEvent.index).get('read_only');

			var bdate = this.collection.at(inEvent.index).get('relationship_begin_date');
			var edate = this.collection.at(inEvent.index).get('relationship_end_date');
			enyo.log('edate: ' + edate);

			if (!readonly) {
				item.$.begin_date.setValue(bdate);
				item.$.readonly_begin_date.hide();

				item.$.end_date.setValue(edate);
				item.$.readonly_end_date.hide();

				var relationshipTypeIndex = 0;
				var testID = this.collection.at(inEvent.index).get('ref_child_family_relationship_type');

				for (var i = 0; i < this.relationship_type_options_list.length; i++) {
					if (this.relationship_type_options_list[i]['value'] == testID) {
						relationshipTypeIndex = i;
					}
				}

				item.$.relationship_type.selectedIndex = relationshipTypeIndex;
				item.$.relationship_type.options_list.add(this.relationship_type_options_list);

				item.$.readonly_relationship_type.hide();
			}
			else {
				item.$.begin_date.hide();
				item.$.readonly_begin_date.show();
				item.$.readonly_begin_date.setValue(bdate);

				item.$.end_date.hide();
				item.$.readonly_end_date.show();
				item.$.readonly_end_date.setValue(edate);

				var relationshipTypeIndex = 0;
				var testID = this.collection.at(inEvent.index).get('ref_child_family_relationship_type');

				for (var i = 0; i < this.relationship_type_options_list.length; i++) {
					if (this.relationship_type_options_list[i]['value'] == testID) {
						relationshipTypeIndex = i;
					}
				}

				item.$.relationship_type.hide();
				item.$.readonly_relationship_type.show();
				item.$.readonly_relationship_type.setValue(
					this.relationship_type_options_list[relationshipTypeIndex].display_text);

				item.$.saveButton.hide();
				item.$.deleteButton.hide();
			}
		},

		/**
		 * Handles PATCH operations.
		 *
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		goSave: function (inSender, inEvent) {

			var pk = this.collection.at(inEvent.index).get('child_family_relationship_id');

			var item = this.$.repeater.itemAtIndex(inEvent.index);

			var bdate = null;
			var edate = null;
			if (!Number.isNaN(Date.parse(item.$.begin_date.getValue()))) {
				bdate = moment(
					item.$.begin_date.getValue(), 'MM/DD/YYYY'
				).format('YYYY-MM-DD');
			}

			if (!Number.isNaN(Date.parse(item.$.end_date.getValue()))) {
				var edate = moment(
					item.$.end_date.getValue(), 'MM/DD/YYYY'
				).format('YYYY-MM-DD');
			}

			var postBody = {
				"child": this.get('.selectedPersonID'),
				"family": this.get('.selectedFamilyID'),
				"ref_child_family_relationship_type": item.$.relationship_type.getValue(),
				"relationship_begin_date": bdate,
				"relationship_end_date": edate
			}

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'PATCH');
			var endpoint = 'api/v1/family/child-family-relationship/' + pk + '/';
			var ajax = this.api.getAjaxObject(endpoint);
			ajax.postBody = postBody;

			this.doAjaxStarted();
			ajax.go();
			ajax.response(enyo.bindSafely(this, 'patchResponse'));
			ajax.error(enyo.bindSafely(this, 'patchError'));

		},

		/**
		 * @private
		 * @param inRequest
		 * @param inResponse
		 */
		patchResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.
			this.$.popupFactory.showSimple('Changes Saved');

			this.refreshData();
		},

		/**
		 * @private
		 * @param inSender
		 * @param inResponse
		 * @returns {boolean}
		 */
		patchError: function (inSender, inResponse) {
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
				' save this record. Please provide the following information to your database administrator: ' +
				'<br><br>' + 'status: ' + status + ' - ' + detail);

			this.set('.xhrResponse', inSender.xhrResponse);
		},

		/**
		 * Handles DELETE requests.
		 *
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		goDelete: function (inSender, inEvent) {
			var msg = 'Clicking \'Yes\' will permanently delete this child-relationship record and ' +
				'cannot be undone. If you delete the last record linking this child to this family, ' +
				'they may disappear from the search results. In that case, if the child is not linked ' +
				'to some other family, it may be necessary to contact support to locate them again. Continue?';

			this.set('.currentIndex', inEvent.index);
			this.$.popupFactory.showConfirm('Confirm Delete', msg);
		},

		/**
		 * We need to wait for a confirmation popup to close before proceeding with
		 * a delete operation. To do this the popup emits an event on closing that is
		 * then handled here. We check that it was a delete confirmation by verifying
		 * that 'confirmed' is defined in inEvent.
		 *
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		popupClosedHandler: function (inSender, inEvent) {

			if ((inEvent.confirmed === undefined) || (inEvent.confirmed === false)) {
				return; // we only want to take action if a delete confirmation has occurred
			}
			else if ((inEvent.confirmed) && (this.get('.currentIndex') > -1)) {

				var pk = this.collection.at(this.get('.currentIndex')).get('child_family_relationship_id')

				this.set('.api.token', this.get('.token'));
				this.set('.api.method', 'DELETE');
				var endpoint = 'api/v1/family/child-family-relationship/' + pk + '/';
				var ajax = this.api.getAjaxObject(endpoint);

				this.doAjaxStarted();
				ajax.go();
				ajax.response(enyo.bindSafely(this, 'deleteResponse'));
				ajax.error(enyo.bindSafely(this, 'deleteError'));
			}

			return true;
		},


		/**
		 * After a successful delete operation, clear the controls and reset variables.
		 * @param inRequest
		 * @param inResponse
		 */
		deleteResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.
			this.set('.currentIndex', -1); // clear the current index into the repeater.
			this.refreshData();
		},

		/**
		 * Handles server errors on delete requests.
		 *
		 * @private
		 * @param inSender
		 * @param inResponse
		 * @returns {boolean}
		 */
		deleteError: function (inSender, inResponse) {
			enyo.log('in delete error');
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
				' delete this record. Please provide the following information to your database administrator: ' +
				'<br><br>' + 'status: ' + status + ' - ' + detail_msg);

			this.set('.xhrResponse', inSender.xhrResponse);
			return true
		},

		/**
		 * Hanldes POST requests.
		 *
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		goNew: function (inSender, inEvent) {

			var bdate = null;
			var edate = null;
			if (!Number.isNaN(Date.parse(this.$.new_begin_date.getValue()))) {
				bdate = moment(
					this.$.new_begin_date.getValue(), 'MM/DD/YYYY'
				).format('YYYY-MM-DD');
			}

			if (!Number.isNaN(Date.parse(this.$.new_end_date.getValue()))) {
				var edate = moment(
					this.$.new_end_date.getValue(), 'MM/DD/YYYY'
				).format('YYYY-MM-DD');
			}

			var postBody = {
				"child": this.get('.selectedPersonID'),
				"family": this.get('.selectedFamilyID'),
				"ref_child_family_relationship_type": this.$.new_relationship_type.getValue(),
				"relationship_begin_date": bdate,
				"relationship_end_date": edate
			}

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'POST');
			var endpoint = 'api/v1/family/child-family-relationship/';
			var ajax = this.api.getAjaxObject(endpoint);
			ajax.postBody = postBody;

			this.doAjaxStarted();
			ajax.go();
			ajax.response(enyo.bindSafely(this, 'postResponse'));
			ajax.error(enyo.bindSafely(this, 'postError'));
		},

		/**
		 * @private
		 * @param inRequest
		 * @param inResponse
		 */
		postResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			this.$.popupFactory.showSimple('New relationship record created');

			this.$.new_begin_date.setValue(null);
			this.$.new_end_date.setValue(null);
			this.$.new_relationship_type.setValue(null);

			this.refreshData();

		},

		/**
		 * @private
		 * @param inSender
		 * @param inResponse
		 * @returns {boolean}
		 */
		postError: function (inSender, inResponse) {
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
				' create this record. Please provide the following information to your database administrator: ' +
				'<br><br>' + 'status: ' + status + '<br>' + detail_msg);

			this.set('.xhrResponse', inSender.xhrResponse);
			return true
		}

	});

})(enyo, this);