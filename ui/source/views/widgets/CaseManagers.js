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
	 * @event oarn.CaseManagers#onAjaxError
	 * @type {object}
	 * @property {string} name - Name of the {@link oarn.CaseManagers} control that
	 * generated the event.
	 * @property {object} xhrResponse - The error details
	 * @public
	 */

	/**
	 * Fires when an ajax call is started, to alert parents to display spinners, ec.
	 *
	 * @event oarn.CaseManagers#onAjaxStarted
	 * @public
	 */

	/**
	 * Fires when an ajax call - one not handled locally - has returned, to alert parents to hide spinners, etc.
	 *
	 * @event oarn.CaseManagers#onAjaxFinished
	 * @public
	 */


	/**
	 * {@link oarn.CaseManagers} describes the history of staff responsibility for a given family record.
	 *
	 * @class oarn.CaseManager
	 * @extends enyo.Control
	 * @public
	 * @ui
	 */
	enyo.kind(
		/** @lends oarn.CaseManagers.prototype */{

		/**
		 * @private
		 */
		name: 'oarn.CaseManagers',

		/**
		 * @private
		 */
		kind: 'enyo.Control',

		/**
		 * Used to cache the available drop-down list of case managers.
		 *
		 * @type {array}
		 * @private
		 */
		options_list: [],

			/**
			 * Used to keep track of selected Repeater indices so that they may be passed
			 * around in events. It should always be reset to -1 after use.
			 *
			 * @type {number}
			 * @default -1
			 * @private
 			 */
		currentIndex: -1,

		/**
		 * @public
		 * @lends oarndb.CaseManagers.prototype
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
			 * If a family record is currently selected (which should always be the case if this
			 * control is visible), this will contain that record's family_id.
			 * If no record is selected, it will be set to 0.
			 *
			 * @type {number}
			 * @default 0
			 * @public
			 */
			selectedFamilyID: 0,


			/**
			 * Information regarding the currently selected organization (a user may have multiple options)
			 * for write operations, etc. Set by the parent, usually via a call to 'api/v1/organization/access/'.
			 * Includes the organization's organization_id, name, and short_name.
			 *
			 * @type {object}
			 * @default null
			 * @public
			 */
			selectedOrganization: null,

			/**
			 * Describes read access level for the current user and selected organization.
			 * (This is a convenience - it is enforced at the server level as well.)
			 *
			 * @type {Boolean}
			 * @default false
			 * @public
			 */
			currentOrgReadOnly: false,

			/**
			 * Describes read/write access level for the current user and selected organization.
			 * (This is a convenience - it is enforced at the server level as well.)
			 *
			 * @type {Boolean}
			 * @default false
			 * @public
			 */
			currentOrgReadWrite: false,

			/**
			 * Describes admin access level for the current user and selected organization.
			 * (This is a convenience - it is enforced at the server level as well.)
			 *
			 * @type {Boolean}
			 * @default false
			 * @public
			 */
			currentOrgAdmin: false
		},

		/**
		 * @private
		 */
		handlers: {
			onPopupClosed: 'popupClosedHandler'
		},

		/**
		 * @private
		 */
		components: [

			{tag: 'label', classes: 'oarn-control', style: 'padding-left:5px;', content: 'Current Case Manager:',
				attributes: [{'for': 'txtCurrentCaseManager'}]},
			{name: 'txtCurrentCaseManager', kind: 'enyo.Input', classes: 'oarn-control', disabled: true},
			{kind: 'onyx.TooltipDecorator', style: 'display: inline', components: [
				{name: 'editButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
					src: 'static/assets/edit-small.png', ontap: 'viewCaseManagerDetails'},
				{kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
					content: 'View or edit the family\'s case manager history.'}
			]},

			{name: 'detailsPopup', kind: 'onyx.Popup', autoDismiss: false, modal: true, centered: true,
				scrim: true, floating: true, style: 'background-color: #EAEAEA', components: [
					{kind: 'onyx.Groupbox', style: 'width:100%; background-color: #EAEAEA', components: [
						{name: 'mainHeader', kind: 'onyx.GroupboxHeader', content: 'Case Manager History'},
						{name: 'headerWrapper', components: [
							{content: 'Case Manager', tag:'span',
								style: 'display: inline-block; margin-left:10px; width: 30%',
								classes: 'oarn-groupbox-column-header'},
							{content: 'Begin Date', tag:'span',
								style: 'display: inline-block; margin-left:10px; width: 30%',
								classes: 'oarn-groupbox-column-header'},
							{content: 'End Date', tag:'span',
								style: 'display: inline-block; margin-left:10px; width: 30%',
								classes: 'oarn-groupbox-column-header'}
						]},
						{name: 'repeater', kind: 'enyo.Repeater', multiSelect: false, onSetupItem: 'setupItem',
							components: [
								{name: 'itemWrapper', style:'width: 100%;', components: [
									{name: 'case_manager_name', kind: 'oarn.DataSelect',
										style: 'display: inline', classes: 'oarn-control'
									},
									{name: 'read_only_case_manager_name', kind: 'enyo.Input',
										classes: 'oarn-control',
										style: 'display: inline; background-color: #EAEAEA; width:32%',
										disabled: true},
									{name: 'begin_date', kind: 'oarn.DatePicker',
										style: 'display: inline', classes: 'oarn-control',
										backgroundColor: '#EAEAEA', emptyIsValid: false},
									{name: 'read_only_begin_date', kind: 'enyo.Input',
										classes: 'oarn-control',
										style: 'display: inline;background-color: #EAEAEA; width: 32%',
										disabled: true},
									{name: 'end_date', kind: 'oarn.DatePicker',
										style: 'display: inline', classes: 'oarn-control',
										backgroundColor: '#EAEAEA', emptyIsValid: true},
									{name: 'read_only_end_date', kind: 'enyo.Input',
										classes: 'oarn-control',
										style: 'display: inline;background-color: #EAEAEA; width: 32%',
										disabled: true},
									{kind: 'onyx.TooltipDecorator', style: 'display: inline', components: [
										{name: 'deleteButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
											src: 'static/assets/blue-delete.png', ontap: 'goDelete'},
										{kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
											content: 'Delete this case manager record.'}
									]},
									{kind: 'onyx.TooltipDecorator', style: 'display: inline', components: [
										{name: 'saveButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
											src: 'static/assets/save-small.png', ontap: 'goSave'},
										{kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
											content: 'Save changes to this record.'}
									]},
								]}
							]},
						{name: 'newCaseManagerHeader', kind: 'onyx.GroupboxHeader',
							classes: 'oarn-new-row-header', content: 'New Case Manager:'},
						{name: 'newCaseManager', components: [
							{name: 'newItemWrapper', style: 'width: 100%', components: [
								{name: 'new_case_manager_name', kind: 'oarn.DataSelect',
									style: 'display: inline', classes: 'oarn-control'
								},
								{name: 'new_begin_date', kind: 'oarn.DatePicker',
									style: 'display: inline', backgroundColor: '#EAEAEA',
									classes: 'oarn-control'},
								{name: 'new_end_date', kind: 'oarn.DatePicker', style: 'display: inline',
									backgroundColor: '#EAEAEA', classes: 'oarn-control'},
								{kind: 'onyx.TooltipDecorator', style: 'display: inline', components: [
									{name: 'newButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
										src: 'static/assets/blue-add.png', ontap: 'goNew'},
									{kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
										content: 'Create a new case manager record.'}
								]},
							]}
						]}
					]},

					{name: 'buttonsRow', style: 'text-align: center; padding-top:5px',
						components: [
						{name: 'btnOK', kind: 'onyx.Button', content: 'OK',
							style: 'margin: 5px 5px 5px 5px',	ontap: 'closeCaseManagerDetails'}
					]},

				]
			},
			{name: 'popupFactory', kind: 'oarn.PopupFactory'}
		],

		/**
		 * @private
		 */
		events: {
			onAjaxError: '',

			onAjaxStarted: '',

			onAjaxFinished: ''
		},

		/**
		 * @private
		 */
		create: function () {
			this.inherited(arguments)

			this.collection = new enyo.Collection();

			this.api = new oarn.API()
		},

		/**
		 * Retrieves a fresh set of case manager data from the server.
		 *
		 * @private
		 */
		refreshData: function () {
			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'GET');
			var endpoint = 'api/v1/program/case-managers/?family_id=' + this.get('.selectedFamilyID');
			var ajax = this.api.getAjaxObject(endpoint);
			ajax.go();
			ajax.response(enyo.bindSafely(this, 'processResponse'));
			ajax.error(enyo.bindSafely(this, 'processError'));

			this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
		},

		/**
		 * Changes to the selectedFamilyID also result in a refresh of the data.
		 *
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		selectedFamilyIDChanged: function (inSender, inEvent) {
			if (this.get('.selectedFamilyID') > 0) {
				this.refreshData();
			}
			else {
				this.$.txtCurrentCaseManager.value = '';
			}
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
				if (inResponse['results'][i] !== undefined) {
					var detail = {
						case_manager_id: inResponse['results'][i]['case_manager_id'],
						person_id: inResponse['results'][i]['person']['person_id'],
						first_name: inResponse['results'][i]['person']['first_name'],
						last_name: inResponse['results'][i]['person']['last_name'],
						begin_date: inResponse['results'][i]['begin_date'],
						end_date: inResponse['results'][i]['end_date'],
						read_only: inResponse['results'][i]['read_only']
					}
					if (detail['begin_date'] != null) {
						detail['begin_date'] = moment(detail['begin_date'], 'YYYY-MM-DD').format('MM/DD/YYYY');
					}
					if (detail['end_date'] != null) {
						detail['end_date'] = moment(detail['end_date'], 'YYYY-MM-DD').format('MM/DD/YYYY');
					}
					details.push(detail);
				}
			}

			if (details.length > 0) {
				this.set('.$.txtCurrentCaseManager.value', details[0].first_name + ' ' + details[0].last_name);
			}
			else {
				this.set('.$.txtCurrentCaseManager.value', '');
			}

			this.collection.empty();
			this.collection.add(details);

			if (this.$.detailsPopup.showing) {
				this.$.repeater.setCount(this.collection.length);
			}

		},

		/**
		 * Handles any ajax errors by passing the details up to the parent component.
		 *
		 * @param inSender
		 * @param inResponse
		 * @private
		 */
		processError: function (inSender, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			enyo.log('in the basic error handler...');
			this.set('.xhrResponse', inSender.xhrResponse);

			enyo.log(JSON.parse(inSender.xhrResponse)['detail']);

			return true;
			//this.doAjaxError(inSender.xhrResponse);
		},

		/**
		 * Populates the controls for the details popup.
		 *
		 * @param inSender
		 * @param inEvent
		 * @private
		 */
		viewCaseManagerDetails: function (inSender, inEvent) {

			// Before showing the popup, start pulling down the list of case manager options
			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'GET');
            var org_id = this.get('.selectedOrganization.organization_id');
			var endpoint = 'api/v1/program/family/person/?staff_only=true&limit=500&organization_id=' + org_id;
			var ajax = this.api.getAjaxObject(endpoint);
			ajax.go();
			ajax.response(enyo.bindSafely(this, 'popupAjaxResponse'));
			ajax.error(enyo.bindSafely(this, 'processError')); // we can share error handling

			this.doAjaxStarted(); // let a parent control turn on a spinner, etc.

			if (this.get('.currentOrgReadOnly')) {
				this.$.newCaseManagerHeader.hide();
				this.$.newItemWrapper.hide();
			}

			this.$.detailsPopup.show();
		},

		/**
		 * Closes the details popup and forces a data refresh.
		 *
		 * @param inSender
		 * @param inEvent
		 * @private
		 */
		closeCaseManagerDetails: function (inSender, inEvent) {
			this.$.detailsPopup.hide();
			this.refreshData();
		},

		/**
		 * Takes data from the server and feeds it to the Repeater to generate the details list.
		 *
		 * @param inRequest
		 * @param inResponse
		 * @private
		 */
		popupAjaxResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			var details = [];
			for (var i = 0; i < inResponse['results'].length; i++) {
				if (inResponse['results'][i] !== undefined) {
					var detail = {
						value: inResponse['results'][i]['person_id'],
						display_text: inResponse['results'][i]['last_name'] + ', ' +
							inResponse['results'][i]['first_name']
					};
					details.push(detail);
				}

			}

			this.options_list = details;

			this.$.new_case_manager_name.options_list.add(this.options_list);

			this.set('.$.mainHeader.content', 'Case Manager History - Family ' + this.get('.selectedFamilyID'));

			this.$.repeater.setCount(this.collection.length);
		},

		/**
		 * @private
		 * @param inSender
		 * @param inEvent
		 * @returns {boolean}
		 */
		setupItem: function (inSender, inEvent) {
			var item = inEvent.item;

			var readonly = this.collection.at(inEvent.index).get('read_only');
			if (!readonly) {
				item.$.read_only_case_manager_name.hide();
				item.$.read_only_begin_date.hide();
				item.$.read_only_end_date.hide();
				item.$.case_manager_name.show();
				item.$.begin_date.show();
				item.$.end_date.show();
				item.$.deleteButton.show();
				item.$.saveButton.show();

				var personIndex = 0;
				var testID = this.collection.at(inEvent.index).get('person_id');


				for (var i = 0; i < this.options_list.length; i++) {
					if (this.options_list[i]['value'] == testID) {
						personIndex = i;
					}
				}

				item.$.case_manager_name.selectedIndex = personIndex; // must be set prior to adding the options list
				item.$.case_manager_name.options_list.add(this.options_list);

				item.$.begin_date.setValue(this.collection.at(inEvent.index).get('begin_date'));
				item.$.end_date.setValue(this.collection.at(inEvent.index).get('end_date'));
			}
			else {
				item.$.case_manager_name.hide();
				item.$.begin_date.hide();
				item.$.end_date.hide();
				item.$.read_only_case_manager_name.show();
				item.$.read_only_begin_date.show();
				item.$.read_only_end_date.show();
				item.$.deleteButton.hide();
				item.$.saveButton.hide();

				item.$.read_only_case_manager_name.setValue(
					this.collection.at(inEvent.index).get('last_name') + ', ' +
						this.collection.at(inEvent.index).get('first_name')
				);

				item.$.read_only_begin_date.setValue(this.collection.at(inEvent.index).get('begin_date'));
				item.$.read_only_end_date.setValue(this.collection.at(inEvent.index).get('end_date'));
			}

			return true;
		},

		/**
		 * Handles PATCH operations.
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		goSave: function (inSender, inEvent) {

			var bdate = null;
			var edate = null;
			var testDate;

			if (!Number.isNaN(Date.parse(this.$.repeater.itemAtIndex(inEvent.index).$.begin_date.getValue()))) {
				testDate = new Date(this.$.repeater.itemAtIndex(inEvent.index).$.begin_date.getValue()).toISOString();
				bdate = moment(testDate).format('YYYY-MM-DD');
			}
			else {
				this.$.popupFactory.showInfo('Invalid Data', 'The case manager\'s begin date is a required field.');
				return;
			}

			if (!Number.isNaN(Date.parse(this.$.repeater.itemAtIndex(inEvent.index).$.end_date.getValue()))) {
				testDate = new Date(this.$.repeater.itemAtIndex(inEvent.index).$.end_date.getValue()).toISOString();
				var edate = moment(testDate).format('YYYY-MM-DD');
			}

			var postBody = {
				'case_manager_id': this.collection.at(inEvent.index).get('case_manager_id'),
				'person': this.$.repeater.itemAtIndex(inEvent.index).$.case_manager_name.getValue(),
				'family': this.get('.selectedFamilyID'),
				'begin_date': bdate,
				'end_date': edate
			}

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'PATCH');
			var endpoint = 'api/v1/program/case-managers/' + postBody.case_manager_id + '/';
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

			this.$.popupFactory.showInfo('Database Communication Error', 'An error occurred while trying to ' +
				' save this record. Please provide the following information to your database administrator: ' +
				'<br><br>' + 'status: ' + status + ' - ' + detail);

			this.set('.xhrResponse', inSender.xhrResponse);
			return true
		},

		/**
		 * Handles DELETE requests.
		 *
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		goDelete: function (inSender, inEvent) {
			var msg = 'Clicking \'Yes\' will permanently delete this case manager record and ' +
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

				var pk = this.collection.at(this.get('.currentIndex')).get('case_manager_id')

				this.set('.api.token', this.get('.token'));
				this.set('.api.method', 'DELETE');
				var endpoint = 'api/v1/program/case-managers/' + pk + '/';
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
			var detail = JSON.parse(inSender.xhrResponse.body)['detail'];

			this.$.popupFactory.showInfo('Database Communication Error', 'An error occurred while trying to ' +
				' delete this record. Please provide the following information to your database administrator: ' +
				'<br><br>' + 'status: ' + status + ' - ' + detail);

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
			else {
				this.$.popupFactory.showInfo('Invalid Data', 'The case manager\'s begin date is a required field.');
				return;
			}

			if (!Number.isNaN(Date.parse(this.$.new_end_date.getValue()))) {
				var edate = moment(
					this.$.new_end_date.getValue(), 'MM/DD/YYYY'
				).format('YYYY-MM-DD');
			}

			var postBody = {
				'family_id': this.get('.selectedFamilyID'),
				'person_id': this.$.new_case_manager_name.getValue(),
				'family': this.get('.selectedFamilyID'),
				'begin_date': bdate,
				'end_date': edate
			}

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'POST');
			var endpoint = 'api/v1/program/case-managers/create/';
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

			this.$.popupFactory.showSimple('New case manager record created');

			this.$.new_begin_date.setValue(null);
			this.$.new_end_date.setValue(null);
			this.$.new_case_manager_name.setValue(null);

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

}) (enyo, this);
