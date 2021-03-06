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

(function (enyo,scope){
	/**
	 * {@link oarn.PersonEmail offers a modifiable list of email addresses and types for a given Person.
	 *
	 * @class oarn.PersonEmail
	 * @extends enyo.Control
	 * @ui
	 * @public
	 */

	enyo.kind(
		/** @lends oarn.PersonEmail.prototype */{

			/**
			 * @private
			 */
			name: 'oarn.PersonEmail',

			/**
			 * @private
			 */
			kind: 'Control',


			email_type_options_list: [],

			/**
			 * @public
			 * @lends oarn.PersonTelephone.prototype
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
				selectedPersonID: 0

			},

			components: [

				{kind: 'onyx.Groupbox', style: 'max-width:450px;', components: [
					{kind: 'onyx.GroupboxHeader', components: [
						{content: 'Email Addresses', classes: 'oarn-header', tag:'span'}
					]},
					{name: 'noResultsRow', content: 'No Email Addresses Found',
						classes: 'oarn-no-results-text'},

					{name: 'repeaterScroller', kind: 'Scroller', horizontal: 'hidden',
						maxHeight:'150px', components:[
						{name: 'repeater', kind: 'enyo.Repeater', multiSelect: false, onSetupItem: 'setupItem',
							components: [
								{name: 'itemWrapper', tag: 'table',
									style: 'width: 100%; border: 1px solid darkgray; border-collapse: collapse;',
									classes: 'oarn-control', components: [
									{tag: 'tr', components: [
										{tag: 'td', components: [
											{tag: 'label', kind: 'enyo.Control', content: 'Email:',
												style: 'display: inline;',
												attributes: [{'for': 'txtAddress'}]},
										]},
										{tag: 'td', components: [
											{name: 'txtAddress', kind: 'enyo.Input', attributes: [{'maxlength': 75}],
												classes: 'oarn-control', oninput: 'goInput'}
										]},
										{tag: 'td', components: [
											{name: 'selectEmailType', kind: 'oarn.DataSelect',
												classes: 'oarn-control oarn-groupbox-control'},
											{name: 'lblEmailType', kind: 'enyo.Input',
												classes: 'oarn-control oarn-groupbox-control',
												disabled: true, showing: false}
										]},
										{tag: 'td', components: [
											{name: 'deleteButton', kind: 'onyx.IconButton',
												classes: 'oarn-icon-button',
												src: 'static/assets/blue-delete.png', ontap: 'goDelete'}
										]},
										{tag: 'td', components: [
											{kind: 'onyx.TooltipDecorator', style: 'display: inline', components: [
												{name: 'saveButton', kind: 'onyx.IconButton',
													classes: 'oarn-icon-button',
													src: 'static/assets/save-small.png', ontap: 'goSave'},
												{kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
													content: 'Save changes to this record.'}
											]},
										]}
									]}
								]}
							]
						}
					]},

					{name: 'newAddress', components: [
						{kind: 'onyx.GroupboxHeader', classes: 'oarn-new-row-header', components: [
							{content: 'New Email Address:', classes: 'oarn-header', tag:'span'},
							{kind: 'onyx.TooltipDecorator', style: 'display: inline; float:right', components: [
								{name: 'newButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
									src: 'static/assets/blue-add.png', ontap: 'goNewAddress'},
								{kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
									content: 'Create an email address record.'}
							]}
						]},
						{name: 'new_itemWrapper', tag: 'table',
							style: 'width: 100%; border: 1px solid darkgray; border-collapse: collapse;',
							classes: 'oarn-control', components: [
							{tag: 'table', style: 'width: 100%; border: 1px solid darkgray; border-collapse: collapse;',
								classes: 'oarn-control', components:[
								{tag: 'tr', components: [
									{tag: 'td', components: [
										{tag: 'label', kind: 'enyo.Control', content: 'Address:',
											style: 'display: inline;',
											attributes: [{'for': 'new_txtAddress'}]},
									]},
									{tag: 'td', components: [
										{name: 'new_txtAddress', kind: 'enyo.Input', attributes: [{'maxlength': 75}],
											classes: 'oarn-control', oninput: 'goInput'}
									]},
									{tag: 'td', components: [
										{name: 'new_selectEmailType', kind: 'oarn.DataSelect', style: 'width:100%;',
											classes: 'oarn-control oarn-groupbox-control'}
									]}
								]}

							]}
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

				onEmailTypeOptionsReturned: '' // handled locally

			},

			/**
			 * @private
			 */
			handlers: {
				onEmailTypeOptionsReturned: 'emailTypeOptionsReturnedHandler',

				onPopupClosed: 'popupClosedHandler'
			},

			/**
			 * @private
			 */
			create: function () {
				this.inherited(arguments);

				this.api = new oarn.API();
			},

			selectedPersonIDChanged: function (oldVal) {
				if (this.email_type_options_list.length == 0 ||
					this.email_type_options_list.length == 0) {
					// if no data for the dropdown, start that fetch request and let it
					// call the main refresh routine when complete.
					this.loadSelectData();
				}
				else {
					// We already have the dropdown data, so go straight to main refresh:
					this.refreshData();
				}
			},

			/**
			 * @private
			 */
			loadSelectData: function () {
				this.set('.api.token', this.get('.token'));
				this.set('.api.method', 'GET');
				var endpoint = 'api/v1/ref/email-types/';
				var ajax = this.api.getAjaxObject(endpoint);
				ajax.go();
				ajax.response(enyo.bindSafely(this, 'processEmailTypesResponse'));
				ajax.error(enyo.bindSafely(this, 'processError')); // we can share error handling

				this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
			},

			processEmailTypesResponse: function (inRequest, inResponse) {
				this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

				var details = [];
				details.push({value: null, display_text: ''}); // let the user select a null row.

				for (var i = 0; i < inResponse['results'].length; i++) {
					if (inResponse['results'][i] !== undefined) {
						var detail = {
							value: inResponse['results'][i]['ref_email_type_id'],
							display_text: inResponse['results'][i]['description']
						};
						details.push(detail);
					}

				}
				this.email_type_options_list = details;
				this.doEmailTypeOptionsReturned();
			},

			/**
			 * Handles the Ajax response on success.
			 *
			 * @param inRequest
			 * @param inResponse
			 * @private
			 */
			processResponse: function (inRequest, inResponse) {
				this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

				var details = [];
				for (var i = 0; i < inResponse['results'].length; i++) {
					var detail = {
						"person_email_address_id": inResponse['results'][i]['person_email_address_id'],
						"person": inResponse['results'][i]['person'],
						"email_address": inResponse['results'][i]['email_address'],
						"ref_email_type": inResponse['results'][i]['ref_email_type'],
						"read_only": inResponse['results'][i]['read_only']
					};
					details.push(detail);
				}

				this.collection = new enyo.Collection();
				this.collection.add(details);

				if (this.collection.length  > 0) {
					this.$.noResultsRow.hide();
				}
				else {
					this.$.noResultsRow.show();
				}

				this.$.repeater.setCount(this.collection.length);
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

			emailTypeOptionsReturnedHandler: function (inSender, inEvent) {
				this.$.new_selectEmailType.options_list.empty();
				this.$.new_selectEmailType.options_list.add(this.email_type_options_list);

				this.refreshData(); // load a fresh batch of languages for this person record.
			},

			/**
			 * Retrieves a fresh set of details data from the server.
			 *
			 * @private
			 */
			refreshData: function () {
				this.set('.api.token', this.get('.token'));
				this.set('.api.method', 'GET');
				var endpoint = 'api/v1/family/person/email/?person_id='+ this.get('.selectedPersonID');
				var ajax = this.api.getAjaxObject(endpoint);
				ajax.go();
				ajax.response(enyo.bindSafely(this, 'processResponse'));
				ajax.error(enyo.bindSafely(this, 'processError'));

				this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
			},

			/**
			 * Handles the instantiation of a given Repeater row.
			 *
			 * @private
			 * @param inSender
			 * @param inEvent
			 */
			setupItem: function (inSender, inEvent) {
				var item = inEvent.item;

				var type_index = 0;
				var type_value = this.collection.at(inEvent.index).get('ref_email_type');
				for (var i = 0; i < this.email_type_options_list.length; i++){
					if (this.email_type_options_list[i]['value'] == type_value) {
						type_index = i;
					}
				}
				item.$.selectEmailType.selectedIndex = type_index;
				item.$.selectEmailType.options_list.empty();
				item.$.selectEmailType.options_list.add(this.email_type_options_list);

				item.$.txtAddress.setValue(this.collection.at(inEvent.index).get('email_address'));

				if (this.collection.at(inEvent.index).get('read_only')) {
					item.$.saveButton.hide();
					item.$.deleteButton.hide();
					item.$.txtAddress.setDisabled(true);
					item.$.selectEmailType.hide();
					item.$.lblEmailType.show();
					item.$.lblEmailType.setValue(
						this.email_type_options_list[type_index]['display_text']);
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

				var pk = this.collection.at(inEvent.index).get('person_email_address_id');

				var item = this.$.repeater.itemAtIndex(inEvent.index);

				var postBody = {
					"person": this.get('.selectedPersonID'),
					"email_address": item.$.txtAddress.getValue(),
					"ref_email_type": item.$.selectEmailType.getValue()
				}

				this.set('.api.token', this.get('.token'));
				this.set('.api.method', 'PATCH');
				var endpoint = 'api/v1/family/person/email/' + pk + '/';
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
				var detail = JSON.parse(inSender.xhrResponse.body)['detail'];

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
				var msg = 'Clicking \'Yes\' will permanently delete this email address record and ' +
					'cannot be undone. Continue?';

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

					var pk = this.collection.at(this.get('.currentIndex')).get('person_email_address_id')

					this.set('.api.token', this.get('.token'));
					this.set('.api.method', 'DELETE');
					var endpoint = 'api/v1/family/person/email/' + pk + '/';
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
				this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

				var status = inSender.xhrResponse.status;
				var detail = JSON.parse(inSender.xhrResponse.body)['detail'];

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

			goNewAddress: function (inSender, inEvent) {

				if (this.$.new_selectEmailType.getValue() == '') {
					this.$.popupFactory.showInfo('Invalid Data', 'An email type must be selected for the new record.');
					return;
				}

				var postBody = {
					"person": this.get('.selectedPersonID'),
					"email_address": this.$.new_txtAddress.getValue(),
					"ref_email_type": this.$.new_selectEmailType.getValue()
				}

				this.set('.api.token', this.get('.token'));
				this.set('.api.method', 'POST');
				var endpoint = 'api/v1/family/person/email/';
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

				this.$.popupFactory.showSimple('New email address record created');

				this.$.new_selectEmailType.setSelected(0);
				this.$.new_txtAddress.setValue('');

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