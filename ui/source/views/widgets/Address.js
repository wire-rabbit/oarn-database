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
	 * @event oarn.Address#onAjaxError
	 * @type {object}
	 * @property {string} name - Name of the {@link oarn.Address} control that
	 * generated the event.
	 * @property {object} xhrResponse - The error details
	 * @public
	 */

	/**
	 * Fires when an ajax call is started, to alert parents to display spinners, ec.
	 *
	 * @event oarn.Address#onAjaxStarted
	 * @public
	 */

	/**
	 * Fires when an ajax call - one not handled locally - has returned, to alert parents to hide spinners, etc.
	 *
	 * @event oarn.Address#onAjaxFinished
	 * @public
	 */

	/**
	 * {@link oarn.Address} displays a family's primary address in read-only format.
	 * When the edit button is clicked, a list of available addresses is presented in a pop-up
	 * window, where they may be changed or deleted. The 'new' button allows addresses to be added.
	 *
	 * @class oarn.Address
	 * @extends enyo.Control
	 * @public
	 * @ui
	 */

	enyo.kind(
		/** @lends oarn.Address.prototype */{

		/**
		 * @private
		 */
		name: 'oarn.Address',


		/**
		 * The currently selected index in the Repeater
		 *
		 * @private
		 */
		currentIndex: -1,

		/**
		 * Contains the address details, slightly transformed, for this family.
		 *
		 * @private
		 */
		addressCollection: null,

		/**
		 * A list of states for the DataSelect widgets. Pulled from the server.
		 *
		 * @private
		 */
		state_options_list: [],

		/**
		 * A list of counties for the DataSelect widgets. Pulled from the server.
		 *
		 * @private
		 */
		county_options_list: [],

		/**
		 * A list of location types for the DataSelect widgets. Pulled from the server.
		 * @private
		 */
		location_type_options_list: [],

		/**
		 * @public
		 */
		published: /** @lends oarn.Address.prototype */ {

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
			currentOrgReadOnly: true,

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
		components: [
			// ********** The read-only address display *************
			{name: 'container', kind: 'onyx.Groupbox', style: 'width: 400px; margin-top:5px', components: [
				{name: 'header', kind: 'onyx.GroupboxHeader', components: [
					{content: 'Primary Address', tag: 'span', classes: 'oarn-header'},
					{kind: 'onyx.TooltipDecorator',
						style: 'display: inline; float:right', components: [
						{name: 'editButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
							src: 'static/assets/edit-small.png',
							ontap: 'goEdit'},
						{name: 'editTooltip', kind: 'onyx.Tooltip', allowHtml: true, classes: 'oarn-tooltip',
							content: 'View or edit the family\'s addresses.' }
					]},
					{kind: 'onyx.TooltipDecorator',
						style: 'display: inline; float:right', components: [
						{name: 'addButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
							src: 'static/assets/blue-add.png',
							ontap: 'goAdd'},
						{name: 'addTooltip', kind: 'onyx.Tooltip', allowHtml: true, classes: 'oarn-tooltip',
							content: 'Add a new address.' }
					]}
				]},
				{kind: 'onyx.InputDecorator', components: [
					{name: 'addressText', kind: 'onyx.TextArea', style: 'width:100%; height:100px', placeholder: '',
					 disabled: true, classes: 'oarn-control'}
				]}
			]},

			// ********** The address editing/deleting popup *************
			{name: 'detailsPopup', kind: 'onyx.Popup', autoDismiss: false, modal: true,
				centered: true, scrim: true, floating: true, style: 'background-color: #EAEAEA', components: [
				{kind: 'onyx.Groupbox', style: 'width:450px; background-color: #EAEAEA', components: [
					{name: 'mainHeader', kind: 'onyx.GroupboxHeader', content: 'Address History - Family '},

				{kind: 'Scroller', style: 'height:125px', components: [
					{name: 'repeater', kind: 'enyo.Repeater', multiSelect: false, onSetupItem: 'setupItem',
						components: [
							{name: 'itemWrapper', tag: 'table',
								style: 'width: 100%; border: 1px solid darkgray; border-collapse: collapse;',
								classes: 'oarn-control', components: [
								{tag: 'tr', components: [
									{name: 'addressOneLine', tag: 'td',
										style: 'width: 70%',
										ontap: 'addressSelected',
										classes: 'oarn-control oarn-groupbox-control', content: ''
									},
									{kind: 'onyx.TooltipDecorator', tag: 'td',
										style: 'text-align-left; border-left:1px solid darkgray;',
										components: [
											{name: 'deleteButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
												src: 'static/assets/blue-delete.png', showing: false,
												ontap: 'goDelete'},
											{name: 'deleteTooltip', kind: 'onyx.Tooltip', allowHtml: true,
												classes: 'oarn-tooltip',
												content: 'Delete this address.' }
										]}
								]}
							]}
						]}
				]},
				{name: 'detailsDisplay', kind: 'Scroller', horizontal: 'hidden',
					style: 'height: 300px;', components:[
					{tag: 'table', name: 'tblDetails', components: [
						{tag: 'tr', name: 'row0', components: [
							{tag: 'td', attributes: [{'colspan': '2'}], components: [
								{tag: 'label', content: 'Address Details:',
									classes: 'oarn-control oarn-groupbox-control',
									attributes: [{'for': 'tblDetails'}]}
							]}
						]},
						{tag: 'tr', name: 'row1', components: [
							{tag: 'td', components: [
								{tag: 'label', content: 'Street number and name:',
									classes: 'oarn-control oarn-groupbox-control',
									attributes: [{'for': 'txtStreetName'}]}
							]},
							{tag: 'td', components: [
								{name: 'txtStreetName', kind: 'enyo.Input', style: 'width: 95%',
									classes: 'oarn-control', disabled: true, attributes: [{'maxlength': 40}]}
							]}
						]},
						{tag: 'tr', name: 'row2', components: [
							{tag: 'td', components: [
								{tag: 'label', content: 'Apartment/Room/Suite:',
									classes: 'oarn-control oarn-groupbox-control',
									attributes: [{'for': 'txtApt'}]}
							]},
							{tag: 'td', components: [
								{name: 'txtApt', kind: 'enyo.Input', style: 'width: 95%',
									classes: 'oarn-control', disabled: true, attributes: [{'maxlength': 30}]}
							]}
						]},
						{tag: 'tr', name: 'row3', components: [
							{tag: 'td', components: [
								{tag: 'label', content: 'City:',
									classes: 'oarn-control oarn-groupbox-control',
									attributes: [{'for': 'txtCity'}]}
							]},
							{tag: 'td', components: [
								{name: 'txtCity', kind: 'enyo.Input', style: 'width: 95%',
									classes: 'oarn-control', disabled: true, attributes: [{'maxlength': 30}]}
							]}
						]},
						{tag: 'tr', name: 'row4', components: [
							{tag: 'td', components: [
								{tag: 'label', content: 'State:',
									classes: 'oarn-control oarn-groupbox-control',
									attributes: [{'for': 'selectState'}]}
							]},
							{tag: 'td', components: [
								{name: 'selectState', kind: 'oarn.DataSelect',
									classes: 'oarn-control', style: 'width: 95%', showing: false},
								{name: 'lblState', kind: 'enyo.Control',
									classes: 'oarn-control oarn-groupbox-control', style: 'width: 95%', showing: true}
							]}
						]},
						{tag: 'tr', name: 'row5', components: [
							{tag: 'td', components: [
								{tag: 'label', content: 'Postal code:',
									classes: 'oarn-control oarn-groupbox-control',
									attributes: [{'for': 'txtPostalCode'}]}
							]},
							{tag: 'td', components: [
								{name: 'txtPostalCode', kind: 'enyo.Input', style: 'width: 95%',
									classes: 'oarn-control', disabled: true, attributes: [{'maxlength': 17}]}
							]}
						]},
						{tag: 'tr', name: 'row6', components: [
							{tag: 'td', components: [
								{tag: 'label', content: 'County:',
									classes: 'oarn-control oarn-groupbox-control',
									attributes: [{'for': 'selectCounty'}]}
							]},
							{tag: 'td', components: [
								{name: 'selectCounty', kind: 'oarn.DataSelect',
									classes: 'oarn-control oarn-groupbox-control', style: 'width: 95%', showing: false},
								{name: 'lblCounty', kind: 'enyo.Control',
									classes: 'oarn-control oarn-groupbox-control', style: 'width: 95%', showing: true}
							]}
						]},
						{tag: 'tr', name: 'row7', components: [
							{tag: 'td', components: [
								{tag: 'label', content: 'Residence end date:',
									classes: 'oarn-control oarn-groupbox-control',
									attributes: [{'for': 'txtResidenceEndDate'}]}
							]},
							{tag: 'td', components: [
								{name: 'txtResidenceEndDate', kind: 'oarn.DatePicker', showing: false,
									classes: 'oarn-control', width: '95%'},
								{name: 'lblResidenceEndDate', classes: 'oarn-control', width: '95%'}
							]}
						]},
						{tag: 'tr', name: 'row8', components: [
							{tag: 'td', components: [
								{tag: 'label', content: 'Primary residence:',
									classes: 'oarn-control oarn-groupbox-control',
									attributes: [{'for': 'chkPrimaryResidence'}]}
							]},
							{tag: 'td', components: [
								{name: 'chkPrimaryResidence', kind: 'enyo.Checkbox', showing: false},
								{name: 'lblPrimaryResidence', kind: 'enyo.Checkbox', onchange: 'frozenCheckboxChanged'}
							]}
						]},
						{tag: 'tr', name: 'row9', components: [
							{tag: 'td', components: [
								{tag: 'label', content: 'Location Type:',
									classes: 'oarn-control oarn-groupbox-control',
									attributes: [{'for': 'selectLocationType'}]}
							]},
							{tag: 'td', components: [
								{name: 'selectLocationType', kind: 'oarn.DataSelect',
									classes: 'oarn-control', showing: false, style: 'width: 95%'},
								{name: 'lblLocationType', kind: 'enyo.Control',
									classes: 'oarn-control oarn-groupbox-control', style: 'width: 95%'}
							]}
						]},
						{tag: 'tr', name: 'row10', components: [
							{tag: 'td', attributes: [{'colspan': '2'}], components: [
								{tag: 'label', content: 'Notes:', classes: 'oarn-control oarn-groupbox-control',
									attributes: [{'for': 'txtNotes'}]}
							]}
						]},
						{tag: 'tr', name: 'row11', components: [
							{tag: 'td', attributes: [{'colspan': '2'}], components: [
								{kind: 'onyx.InputDecorator', components: [
									{name: 'txtNotes', kind: 'onyx.TextArea', style: 'width:95%; height:50px;',
										classes: 'oarn-control', disabled: true, placeholder: ''}
								]}
							]}
						]}
					]}


					]},
					{name: 'buttonsRow', style: 'text-align: center; padding-top:5px',
						components: [
							{name: 'btnClose', kind: 'onyx.Button', content: 'Close',
								style: 'margin: 5px 5px 5px 5px',	ontap: 'closeDetails'},
							{name: 'btnSave', kind: 'onyx.Button', content: 'Save Changes',
								ontap: 'saveDetails', showing: false,
								style: 'margin: 5px 5px 5px 5px', classes: 'onyx-affirmative'}
					]}
				]}
			]},

			// ********** The new address popup *************
			{name: 'new_detailsPopup', kind: 'onyx.Popup', autoDismiss: false, modal: true,
				centered: true, scrim: true, floating: true, style: 'background-color: #EAEAEA', components: [
				{kind: 'onyx.Groupbox', style: 'width:450px; background-color: #EAEAEA', components: [
					{name: 'new_mainHeader', kind: 'onyx.GroupboxHeader', content: 'New Address - Family '},

					{name: 'new_detailsDisplay', kind: 'Scroller', horizontal: 'hidden',
						style: 'height: 400px;', components:[
						{tag: 'table', name: 'new_tblDetails', components: [
							{tag: 'tr', name: 'new_row0', components: [
								{tag: 'td', attributes: [{'colspan': '2'}], components: [
									{tag: 'label', content: 'Address Details:',
										classes: 'oarn-control oarn-groupbox-control',
										attributes: [{'for': 'new_tblDetails'}]}
								]}
							]},
							{tag: 'tr', name: 'new_row1', components: [
								{tag: 'td', components: [
									{tag: 'label', content: 'Street number and name:',
										classes: 'oarn-control oarn-groupbox-control',
										attributes: [{'for': 'new_txtStreetName'}]}
								]},
								{tag: 'td', components: [
									{name: 'new_txtStreetName', kind: 'enyo.Input', style: 'width: 95%',
										classes: 'oarn-control', attributes: [{'maxlength': 40}]}
								]}
							]},
							{tag: 'tr', name: 'new_row2', components: [
								{tag: 'td', components: [
									{tag: 'label', content: 'Apartment/Room/Suite:',
										classes: 'oarn-control oarn-groupbox-control',
										attributes: [{'for': 'new_txtApt'}]}
								]},
								{tag: 'td', components: [
									{name: 'new_txtApt', kind: 'enyo.Input', style: 'width: 95%',
										classes: 'oarn-control', attributes: [{'maxlength': 30}]}
								]}
							]},
							{tag: 'tr', name: 'new_row3', components: [
								{tag: 'td', components: [
									{tag: 'label', content: 'City:',
										classes: 'oarn-control oarn-groupbox-control',
										attributes: [{'for': 'new_txtCity'}]}
								]},
								{tag: 'td', components: [
									{name: 'new_txtCity', kind: 'enyo.Input', style: 'width: 95%',
										classes: 'oarn-control', attributes: [{'maxlength': 30}]}
								]}
							]},
							{tag: 'tr', name: 'new_row4', components: [
								{tag: 'td', components: [
									{tag: 'label', content: 'State:',
										classes: 'oarn-control oarn-groupbox-control',
										attributes: [{'for': 'new_selectState'}]}
								]},
								{tag: 'td', components: [
									{name: 'new_selectState', kind: 'oarn.DataSelect',
										classes: 'oarn-control', style: 'width: 95%'}
								]}
							]},
							{tag: 'tr', name: 'new_row5', components: [
								{tag: 'td', components: [
									{tag: 'label', content: 'Postal code:',
										classes: 'oarn-control oarn-groupbox-control',
										attributes: [{'for': 'new_txtPostalCode'}]}
								]},
								{tag: 'td', components: [
									{name: 'new_txtPostalCode', kind: 'enyo.Input', style: 'width: 95%',
										classes: 'oarn-control', attributes: [{'maxlength': 17}]}
								]}
							]},
							{tag: 'tr', name: 'new_row6', components: [
								{tag: 'td', components: [
									{tag: 'label', content: 'County:',
										classes: 'oarn-control oarn-groupbox-control',
										attributes: [{'for': 'new_selectCounty'}]}
								]},
								{tag: 'td', components: [
									{name: 'new_selectCounty', kind: 'oarn.DataSelect',
										classes: 'oarn-control oarn-groupbox-control', style: 'width: 95%'}
								]}
							]},
							{tag: 'tr', name: 'new_row7', components: [
								{tag: 'td', components: [
									{tag: 'label', content: 'Residence end date:',
										classes: 'oarn-control oarn-groupbox-control',
										attributes: [{'for': 'new_txtResidenceEndDate'}]}
								]},
								{tag: 'td', components: [
									{name: 'new_txtResidenceEndDate', kind: 'oarn.DatePicker',
										classes: 'oarn-control', width: '95%'}
								]}
							]},
							{tag: 'tr', name: 'new_row8', components: [
								{tag: 'td', components: [
									{tag: 'label', content: 'Primary residence:',
										classes: 'oarn-control oarn-groupbox-control',
										attributes: [{'for': 'new_chkPrimaryResidence'}]}
								]},
								{tag: 'td', components: [
									{name: 'new_chkPrimaryResidence', kind: 'enyo.Checkbox'}
								]}
							]},
							{tag: 'tr', name: 'new_row9', components: [
								{tag: 'td', components: [
									{tag: 'label', content: 'Location Type:',
										classes: 'oarn-control oarn-groupbox-control',
										attributes: [{'for': 'new_selectLocationType'}]}
								]},
								{tag: 'td', components: [
									{name: 'new_selectLocationType', kind: 'oarn.DataSelect',
										classes: 'oarn-control', style: 'width: 95%'}
								]}
							]},
							{tag: 'tr', name: 'new_row10', components: [
								{tag: 'td', attributes: [{'colspan': '2'}], components: [
									{tag: 'label', content: 'Notes:', classes: 'oarn-control oarn-groupbox-control',
										attributes: [{'for': 'new_txtNotes'}]}
								]}
							]},
							{tag: 'tr', name: 'new_row11', components: [
								{tag: 'td', attributes: [{'colspan': '2'}], components: [
									{kind: 'onyx.InputDecorator', components: [
										{name: 'new_txtNotes', kind: 'onyx.TextArea', style: 'width:95%; height:50px;',
											classes: 'oarn-control', placeholder: ''}
									]}
								]}
							]}
						]}


					]},
					{name: 'new_buttonsRow', style: 'text-align: center; padding-top:5px',
						components: [
							{name: 'new_btnCloseNew', kind: 'onyx.Button', content: 'Close',
								style: 'margin: 5px 5px 5px 5px',	ontap: 'closeNewDetails'},
							{name: 'new_btnCreate', kind: 'onyx.Button', content: 'Create Record',
								ontap: 'goCreate',
								style: 'margin: 5px 5px 5px 5px', classes: 'onyx-affirmative'}
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

			onStateOptionsReturned: '',

			onCountyOptionsReturned: '',

			onLocationTypeOptionsReturned: ''
		},

		/**
		 * @private
		 */
		handlers: {
			onPopupClosed: 'popupClosedHandler',

			onStateOptionsReturned: 'stateOptionsReturnedHandler',

			onCountyOptionsReturned: 'countyOptionsReturnedHandler',

			onLocationTypeOptionsReturned: 'locationOptionsReturnedHandler'
		},

		/**
         * @method
		 * @private
		 */
		create: function () {
			this.inherited(arguments);

			this.api = new oarn.API();

			this.addressCollection = new oarn.AddressCollection();
			this.addressCollection.addListener('add', enyo.bindSafely(this, 'addressesAdded'));

		},

		/**
		 * Retrieves a fresh set of address data from the server.
		 *
         * @method
		 * @private
		 */
		refreshData: function () {
			this.addressCollection.empty();

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'GET');
			var endpoint = 'api/v1/family/addresses/?family_id=' + this.get('.selectedFamilyID');
			var ajax = this.api.getAjaxObject(endpoint);
			ajax.go();
			ajax.response(enyo.bindSafely(this, 'processResponse'));
			ajax.error(enyo.bindSafely(this, 'processError'));

			this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
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

					var loctype = inResponse['results'][i]['ref_location_type'];
					if (loctype != null) {
						loctype = inResponse['results'][i]['ref_location_type']['description']
					}

					var stateName = inResponse['results'][i]['ref_state'];
					if (stateName != null) {
						stateName = inResponse['results'][i]['ref_state']['description']
					}

					var countyName = inResponse['results'][i]['ref_county'];
					if (countyName != null) {
						countyName = inResponse['results'][i]['ref_county']['description']
					}

					var edate = null;
					if (inResponse['results'][i]['residence_end_date'] != null) {
						edate = moment(inResponse['results'][i]['residence_end_date'],'YYYY-MM-DD').format('MM/DD/YYYY')
					}

					var detail = {
						family_address_id: inResponse['results'][i]['family_address_id'],
						family: inResponse['results'][i]['family'],
						location_type: loctype,
						street_number_and_name: inResponse['results'][i]['street_number_and_name'],
						apartment_room_or_suite_number: inResponse['results'][i]['apartment_room_or_suite_number'],
						city: inResponse['results'][i]['city'],
						state: stateName,
						postal_code: inResponse['results'][i]['postal_code'],
						county: countyName,
						residence_end_date: edate,
						primary_address: inResponse['results'][i]['primary_address'],
						notes: inResponse['results'][i]['notes'],
						read_only: inResponse['results'][i]['read_only']
					};

					details.push(detail);
				}
			}

			if (details.length == 0) {
				this.$.editButton.setDisabled(true);
			}
			else {
				this.$.editButton.setDisabled(false);
			}

			this.addressCollection.empty();
			this.addressCollection.add(details);

			this.displayPrimaryAddress();

			if (this.$.detailsPopup.showing) {
				this.$.repeater.setCount(this.addressCollection.length);
			}

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
		 * Changes to the selectedFamilyID also result in a refresh of the data.
		 *
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		selectedFamilyIDChanged: function(oldVal) {
			if (this.get('selectedFamilyID') > 0) {
				this.$.editButton.setDisabled(false);
				this.refreshData();
			}
			else {
				this.set('.$.addressText.value', '');
				this.$.editButton.setDisabled(true);
			}
		},

		/**
		 * Refreshes the primary address display after a new set of address is added to addressCollection.
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		addressesAdded: function (inSender, inEvent) {
			this.displayPrimaryAddress();
		},

		/**
		 * Decouples the displaying of the primary address from any particular event, so it can be shared.
		 *
         * @method
		 * @private
		 */
		displayPrimaryAddress: function () {
			var found = false;
			for (var i = 0; i < this.addressCollection.length; i++) {
				if (this.addressCollection.at(i).get('primary_address')) {
					found = true;

					var addr = this.addressCollection.at(i).get('street_number_and_name');
					if (this.addressCollection.at(i).get('apartment_room_or_suite_number')) {
						addr = addr + ', ' + this.addressCollection.at(i).get('apartment_room_or_suite_number');
					}
					addr = addr + '\n';
					addr = addr + this.addressCollection.at(i).get('city');
					if (this.addressCollection.at(i).get('state')) {
						addr = addr + ', ' + this.addressCollection.at(i).get('state')
					}
					if (this.addressCollection.at(i).get('postal_code')) {
						addr = addr + ' ' + this.addressCollection.at(i).get('postal_code');
					}

					this.$.addressText.setValue(addr);
				}
			}

			if (!found) {
				this.$.addressText.setValue('');
			}
		},

		/**
		 * In the read-only portions of the popup control, we want to prevent the user from changing
		 * the state of the checkbox.
		 *
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		frozenCheckboxChanged: function (inSender, inEvent) {
			inSender.setChecked(
				!inSender.getChecked()
			);
		},

		/**
		 * Retrieves the JSON for the select boxes from the server and sets the Repeater in motion.
         *
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		goEdit: function (inSender, inEvent) {
			// prior to opening the popup, collect the options lists from the server:
			if (this.state_options_list.length == 0) {
				this.set('.api.token', this.get('.token'));
				this.set('.api.method', 'GET');
				var endpoint = 'api/v1/ref/states/';
				var ajax = this.api.getAjaxObject(endpoint);
				ajax.go();
				ajax.response(enyo.bindSafely(this, 'processStatesResponse'));
				ajax.error(enyo.bindSafely(this, 'processGeneralAjaxError')); // we can share error handling

				this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
			}

			if (this.county_options_list.length == 0) {
				var endpoint = 'api/v1/ref/counties/';
				var ajax = this.api.getAjaxObject(endpoint);
				ajax.go();
				ajax.response(enyo.bindSafely(this, 'processCountiesResponse'));
				ajax.error(enyo.bindSafely(this, 'processGeneralAjaxError')); // we can share error handling

				this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
			}

			if (this.location_type_options_list.length == 0) {
				var endpoint = 'api/v1/ref/location-types/';
				var ajax = this.api.getAjaxObject(endpoint);
				ajax.go();
				ajax.response(enyo.bindSafely(this, 'processLocationTypesResponse'));
				ajax.error(enyo.bindSafely(this, 'processGeneralAjaxError')); // we can share error handling

				this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
			}

			this.$.repeater.setCount(this.addressCollection.length);

			this.$.mainHeader.setContent('Address History - Family ' + this.get('.selectedFamilyID'));
			this.$.detailsPopup.show();
		},

		/**
		 * Handles the Ajax response on success.
		 *
		 * @param inRequest
		 * @param inResponse
		 * @private
		 */
		processStatesResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			var details = [];
			for (var i = 0; i < inResponse['results'].length; i++) {
				if (inResponse['results'][i] !== undefined) {
					var detail = {
						value: inResponse['results'][i]['ref_state_id'],
						display_text: inResponse['results'][i]['description']
					};
					details.push(detail);
				}

			}

			this.state_options_list = details;
			this.doStateOptionsReturned();
		},

		/**
		 * Handles the Ajax response on success.
		 *
		 * @param inRequest
		 * @param inResponse
		 * @private
		 */
		processCountiesResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			var details = [];
            details.push({value: null, display_text: ''});
			for (var i = 0; i < inResponse['results'].length; i++) {
				if (inResponse['results'][i] !== undefined) {
					var detail = {
						value: inResponse['results'][i]['ref_county_id'],
						display_text: inResponse['results'][i]['description']
					};
					details.push(detail);
				}

			}

			this.county_options_list = details;
			this.doCountyOptionsReturned();
		},

		/**
		 * Handles the Ajax response on success.
		 *
		 * @param inRequest
		 * @param inResponse
		 * @private
		 */
		processLocationTypesResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			var details = [];
			for (var i = 0; i < inResponse['results'].length; i++) {
				if (inResponse['results'][i] !== undefined) {
					var detail = {
						value: inResponse['results'][i]['ref_location_type_id'],
						display_text: inResponse['results'][i]['description']
					};
					details.push(detail);
				}

			}

			this.location_type_options_list = details;
			this.doLocationTypeOptionsReturned();
		},

        /**
         * @private
         * @param inSender
         * @param inResponse
         * @returns {boolean}
         */
		processGeneralAjaxError: function (inSender, inResponse) {
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
				' download items for the drop-down menus. ' +
				'Please provide the following information to your database administrator: ' +
				'<br><br>' + 'status: ' + status + '<br>' + detail_msg);

			this.set('.xhrResponse', inSender.xhrResponse);
			return true;
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

			var readonly = this.addressCollection.at(inEvent.index).get('read_only');
			if (!readonly) {
				item.$.deleteButton.show();
			}
			else {
				item.$.deleteButton.hide();
			}

			var oneline = this.addressCollection.at(inEvent.index).get('street_number_and_name');
			if (oneline === null) {
				oneline = '';
			}

			if (this.addressCollection.at(inEvent.index).get('apartment_room_or_suite_number')) {
				oneline = oneline + ', ' +
					this.addressCollection.at(inEvent.index).get('apartment_room_or_suite_number');
			}

			if (this.addressCollection.at(inEvent.index).get('address_line_two')) {
				oneline = oneline + ', ' +
					this.addressCollection.at(inEvent.index).get('address_line_two');
			}

			if (this.addressCollection.at(inEvent.index).get('city')) {
				oneline = oneline + ', ' +
					this.addressCollection.at(inEvent.index).get('city');
			}

			item.$.addressOneLine.setContent(oneline.substring(0, 40));
		},

		/**
		 * Runs when an item in the Repeater is selected, populating the edit details.
		 *
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		addressSelected: function (inSender, inEvent) {

			this.currentIndex = inEvent.index; // so we have a point of reference into the collection later

			var item = this.$.repeater.itemAtIndex(inEvent.index);

			for (var i = 0; i < this.$.repeater.count; i++) {
				if (i != inEvent.index) {
					this.$.repeater.itemAtIndex(i).$.itemWrapper.removeClass('oarn-selected');
				}
			}

			item.$.itemWrapper.addClass('oarn-selected')

			var readonly = this.addressCollection.at(inEvent.index).get('read_only');
			if (!readonly) {
				this.$.btnSave.show();
				item.$.deleteButton.show();

				this.$.txtStreetName.setDisabled(false);
				this.$.txtStreetName.setValue(this.addressCollection.at(inEvent.index).get('street_number_and_name'));

				this.$.txtApt.setDisabled(false);

				var apt = '';
				if (this.addressCollection.at(inEvent.index).get('apartment_room_or_suite_number')) {
					apt = this.addressCollection.at(inEvent.index).get('apartment_room_or_suite_number');
				}
				this.$.txtApt.setValue(apt);

				this.$.txtCity.setDisabled(false);
				this.$.txtCity.setValue(this.addressCollection.at(inEvent.index).get('city'));

				this.$.selectState.show();
				this.$.lblState.hide();

				var state_index = 0;
				var displayed_state = this.addressCollection.at(inEvent.index).get('state')
				for (var i = 0; i < this.state_options_list.length; i++){
					if (this.state_options_list[i]['display_text'] == displayed_state) {
						state_index = i;
					}
				}
				this.$.selectState.selectedIndex = state_index;
				this.$.selectState.options_list.empty();
				this.$.selectState.options_list.add(this.state_options_list);

				this.$.txtPostalCode.setDisabled(false);
				this.$.txtPostalCode.setValue(this.addressCollection.at(inEvent.index).get('postal_code'));

				this.$.selectCounty.show();
				this.$.lblCounty.hide();

				var county_index = 0;
				var displayed_county = this.addressCollection.at(inEvent.index).get('county');
				for (var i = 0; i < this.county_options_list.length; i++) {
					if (this.county_options_list[i]['display_text'] == displayed_county) {
						county_index = i;
					}
				}
				this.$.selectCounty.selectedIndex = county_index;
				this.$.selectCounty.options_list.empty();
				this.$.selectCounty.options_list.add(this.county_options_list);

				this.$.txtResidenceEndDate.show();
				this.$.txtResidenceEndDate.setValue(this.addressCollection.at(inEvent.index).get('residence_end_date'));
				this.$.lblResidenceEndDate.hide();

				this.$.chkPrimaryResidence.show();
				this.$.chkPrimaryResidence.setChecked(
					this.addressCollection.at(inEvent.index).get('primary_address')
				);
				this.$.lblPrimaryResidence.hide();

				this.$.selectLocationType.show();
				this.$.lblLocationType.hide();

				var location_type_index = 0;
				var displayed_location_type = this.addressCollection.at(inEvent.index).get('location_type');
				for (var i = 0; i < this.location_type_options_list.length; i++) {
					if (this.location_type_options_list[i]['display_text'] == displayed_location_type) {
						location_type_index = i;
					}
				}
				this.$.selectLocationType.selectedIndex = location_type_index;
				this.$.selectLocationType.options_list.empty();
				this.$.selectLocationType.options_list.add(this.location_type_options_list);

				this.$.txtNotes.setDisabled(false);
				this.$.txtNotes.setValue(this.addressCollection.at(inEvent.index).get('notes'));
			}
			else {
				this.$.btnSave.hide();
				item.$.deleteButton.hide();

				this.$.txtStreetName.setDisabled(true);
				this.$.txtStreetName.setValue(this.addressCollection.at(inEvent.index).get('street_number_and_name'));

				this.$.txtApt.setDisabled(true);
				var apt = '';
				if (this.addressCollection.at(inEvent.index).get('apartment_room_or_suite_number')) {
					apt = this.addressCollection.at(inEvent.index).get('apartment_room_or_suite_number');
				}
				this.$.txtApt.setValue(apt);

				this.$.txtCity.setDisabled(true);
				this.$.txtCity.setValue(this.addressCollection.at(inEvent.index).get('city'));

				this.$.selectState.hide();
				this.$.lblState.show();
				var displayed_state = this.addressCollection.at(inEvent.index).get('state');
				this.$.lblState.setContent(displayed_state);

				this.$.txtPostalCode.setDisabled(true);
				this.$.txtPostalCode.setValue(this.addressCollection.at(inEvent.index).get('postal_code'));

				this.$.selectCounty.hide();
				this.$.lblCounty.show();
				var displayed_county = this.addressCollection.at(inEvent.index).get('county');
				this.$.lblCounty.setContent(displayed_county);

				this.$.txtResidenceEndDate.hide();
				this.$.lblResidenceEndDate.show();
				this.$.lblResidenceEndDate.setContent(this.addressCollection.at(inEvent.index).get('residence_end_date'));

				this.$.chkPrimaryResidence.hide();
				this.$.lblPrimaryResidence.show();
				this.$.lblPrimaryResidence.setChecked(
					this.addressCollection.at(inEvent.index).get('primary_address')
				);

				this.$.selectLocationType.hide();
				this.$.lblLocationType.show();
				var displayed_location_type = this.addressCollection.at(inEvent.index).get('location_type');
				this.$.lblLocationType.setContent(displayed_location_type);

				this.$.txtNotes.setDisabled(true);
				this.$.txtNotes.setValue(this.addressCollection.at(inEvent.index).get('notes'));
			}
		},

		/**
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		closeDetails: function (inSender, inEvent) {
			this.$.detailsPopup.hide();
		},

		/**
		 * Sends the PATCH requests to the server for saving address edits.
		 *
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		saveDetails: function (inSender, inEvent) {
			var pk = this.addressCollection.at(this.currentIndex).get('family_address_id');
			var family_id = this.addressCollection.at(this.currentIndex).get('family');

			var edate = null;
			if (!Number.isNaN(Date.parse(this.$.txtResidenceEndDate.getValue()))) {
				var edate = moment(
					this.$.txtResidenceEndDate.getValue(), 'MM/DD/YYYY'
				).format('YYYY-MM-DD');
			}

			var postBody = {
				family_address_id: pk,
				family: family_id,
				location_type: this.$.selectLocationType.getValue(),
				street_number_and_name: this.$.txtStreetName.getValue(),
				apartment_room_or_suite_number: this.$.txtApt.getValue(),
				city: this.$.txtCity.getValue(),
				state: this.$.selectState.getValue(),
				postal_code: this.$.txtPostalCode.getValue(),
				ref_county: this.$.selectCounty.getValue(),
				residence_end_date: edate,
				primary_address: this.$.chkPrimaryResidence.getValue(),
				notes: this.$.txtNotes.getValue()
			};

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'PATCH');
			var endpoint = 'api/v1/family/addresses/' + pk + '/';
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
			var detail = JSON.parse(inSender.xhrResponse.body)['detail'];

			this.$.popupFactory.showInfo('Database Communication Error', 'An error occurred while trying to ' +
				' save this record. Please provide the following information to your database administrator: ' +
				'<br><br>' + 'status: ' + status + ' - ' + detail);

			this.set('.xhrResponse', inSender.xhrResponse);
		},

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
		goDelete: function (inSender, inEvent) {
			var msg = 'Clicking \'Yes\' will permanently delete this address record and ' +
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

				var pk = this.addressCollection.at(this.currentIndex).get('family_address_id');

				this.set('.api.token', this.get('.token'));
				this.set('.api.method', 'DELETE');
				var endpoint = 'api/v1/family/addresses/' + pk + '/';
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

			this.$.popupFactory.showInfo('Database Communication Error', 'An error occurred while trying to ' +
				' delete this record. Please provide the following information to your database administrator: ' +
				'<br><br>' + 'status: ' + status + ' - ' + detail);

			this.set('.xhrResponse', inSender.xhrResponse);
			return true
		},

		/**
		 * Loads the data for the new-address pop-up's DataSelect widgets before showing the popup.
		 *
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		goAdd: function (inSender, inEvent) {

			// prior to opening the popup, collect the options lists from the server:

			if (this.state_options_list.length == 0) {
				this.set('.api.token', this.get('.token'));
				this.set('.api.method', 'GET');
				var endpoint = 'api/v1/ref/states/';
				var ajax = this.api.getAjaxObject(endpoint);
				ajax.go();
				ajax.response(enyo.bindSafely(this, 'processStatesResponse'));
				ajax.error(enyo.bindSafely(this, 'processGeneralAjaxError')); // we can share error handling

				this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
			}

			if (this.county_options_list.length == 0) {
				var endpoint = 'api/v1/ref/counties/';
				var ajax = this.api.getAjaxObject(endpoint);
				ajax.go();
				ajax.response(enyo.bindSafely(this, 'processCountiesResponse'));
				ajax.error(enyo.bindSafely(this, 'processGeneralAjaxError')); // we can share error handling

				this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
			}

			if (this.location_type_options_list.length == 0) {
				var endpoint = 'api/v1/ref/location-types/';
				var ajax = this.api.getAjaxObject(endpoint);
				ajax.go();
				ajax.response(enyo.bindSafely(this, 'processLocationTypesResponse'));
				ajax.error(enyo.bindSafely(this, 'processGeneralAjaxError')); // we can share error handling

				this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
			}

			this.$.new_detailsPopup.show();
			this.$.new_mainHeader.setContent('New Address - Family ' + this.get('.selectedFamilyID'));
		},

		/**
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		closeNewDetails: function (inSender, inEvent) {
			this.$.new_detailsPopup.hide();
		},

		/**
		 * Sends the POST request to the server when saving a new address.
		 *
		 * @param inSender
		 * @param inEvent
		 */
		goCreate: function (inSender, inEvent) {

			var edate = null;
			if (!Number.isNaN(Date.parse(this.$.new_txtResidenceEndDate.getValue()))) {
				var edate = moment(
					this.$.new_txtResidenceEndDate.getValue(), 'MM/DD/YYYY'
				).format('YYYY-MM-DD');
			}

			var postBody = {
				family: this.get('.selectedFamilyID'),
				location_type: this.$.new_selectLocationType.getValue(),
				street_number_and_name: this.$.new_txtStreetName.getValue(),
				apartment_room_or_suite_number: this.$.new_txtApt.getValue(),
				city: this.$.new_txtCity.getValue(),
				ref_state: this.$.new_selectState.getValue(),
				postal_code: this.$.new_txtPostalCode.getValue(),
				ref_county: this.$.new_selectCounty.getValue(),
				residence_end_date: edate,
				primary_address: this.$.new_chkPrimaryResidence.getValue(),
				notes: this.$.new_txtNotes.getValue()
			};

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'POST');
			var endpoint = 'api/v1/family/addresses/create/';
			var ajax = this.api.getAjaxObject(endpoint);
			ajax.postBody = postBody;

			this.doAjaxStarted();
			ajax.go();
			ajax.response(enyo.bindSafely(this, 'postResponse'));
			ajax.error(enyo.bindSafely(this, 'postError'));
		},

		/**
		 * Responds to a successful address add by clearing the new controls and refreshing the address data.
		 *
		 * @private
		 * @param inRequest
		 * @param inResponse
		 */
		postResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			this.$.popupFactory.showSimple('New address record created');

			this.$.new_txtStreetName.setValue('');
			this.$.new_txtApt.setValue('');
			this.$.new_txtCity.setValue('');
			this.$.new_selectState.setValue(null);
			this.$.new_txtPostalCode.setValue('');
			this.$.new_selectCounty.setValue(null);
			this.$.new_txtResidenceEndDate.setValue('');
			this.$.new_chkPrimaryResidence.setValue(false);
			this.$.new_selectLocationType.setValue(null);
			this.$.new_txtNotes.setValue('');

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
		},

        /**
         * @private
         * @param inSender
         * @param inEvent
         * @returns {boolean}
         */
		stateOptionsReturnedHandler: function (inSender, inEvent) {
			this.$.new_selectState.options_list.empty();
			this.$.new_selectState.options_list.add(this.state_options_list);
			return true;
		},

        /**
         * @private
         * @param inSender
         * @param inEvent
         * @returns {boolean}
         */
		countyOptionsReturnedHandler: function (inSender, inEvent) {
			this.$.new_selectCounty.options_list.empty();
			this.$.new_selectCounty.options_list.add(this.county_options_list);
			return true;
		},

        /**
         * @private
         * @param inSender
         * @param inEvent
         * @returns {boolean}
         */
		locationOptionsReturnedHandler: function (inSender, inEvent) {
			this.$.new_selectLocationType.options_list.empty();
			this.$.new_selectLocationType.options_list.add(this.location_type_options_list);
			return true;
		}
	});

	enyo.kind({
		name: 'oarn.AddressModel',
		kind: 'enyo.Model',

		attributes: {
			family_address_id: -1,
			family: -1,
			location_type: '',
			street_number_and_name: '',
			apartment_room_or_suite_number: '',
			city: '',
			state: 'Oregon',
			postal_code: '',
			county: '',
			residence_end_date: null,
			primary_address: false,
			notes: '',
			read_only: true
		}
	});

	enyo.kind({
		name: 'oarn.AddressCollection',
		kind: 'enyo.Collection',
		model: 'oarn.AddressModel'
	});

})(enyo, this);
