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
		name: 'oarn.NewFamilyNewAdult',

		kind: 'onyx.Popup',

		autoDismiss: false,

		modal: true,

		centered: true,

		scrim: true,

		floating: true,

		style: 'background-color: #EAEAEA',

		components: [
			{kind: 'onyx.Groupbox', style: 'width:450px; background-color: #EAEAEA', components: [
				{name: 'new_mainHeader', kind: 'onyx.GroupboxHeader', content: 'New Family - New Primary Adult'},
				{name: 'summary', classes:'oarn-control oarn-groupbox-control', allowHtml:true,
					style: 'padding: 3px 5px 5px 5px'},
				{tag: 'table', components: [
					{tag: 'tr', components: [
						{tag: 'td', attributes: [{'colspan': '2'}], components: [
							{tag: 'label', classes: 'oarn-control oarn-groupbox-control',
								content: 'New Primary Adult Details:'}
						]}
					]},
					{tag: 'tr', components: [
						{tag: 'td', components: [
							{tag: 'label', content: 'First Name:',
								classes: 'oarn-control oarn-groupbox-control',
								attributes: [{'for': 'txtFirstName'}]}
						]},
						{tag: 'td', components: [
							{name: 'txtFirstName', kind: 'enyo.Input', style: 'width: 95%',
								classes: 'oarn-control', attributes: [{'maxlength': 35}],
								oninput: 'goInput'}
						]}
					]},
					{tag: 'tr', components: [
						{tag: 'td', components: [
							{tag: 'label', content: 'Last Name:',
								classes: 'oarn-control oarn-groupbox-control',
								attributes: [{'for': 'txtLastName'}]}
						]},
						{tag: 'td', components: [
							{name: 'txtLastName', kind: 'enyo.Input', style: 'width: 95%',
								classes: 'oarn-control', attributes: [{'maxlength': 35}],
								oninput: 'goInput'}
						]}
					]},
					{tag: 'tr', components: [
						{tag: 'td', components: [
							{tag: 'label', content: 'Birth Date:',
								classes: 'oarn-control oarn-groupbox-control',
								attributes: [{'for': 'txtBirthDate'}]}
						]},
						{tag: 'td', components: [
							{name: 'txtBirthDate', kind: 'oarn.DatePicker', width: '95%',
								classes: 'oarn-control', onSelect: 'goInput',
								emptyIsValid: true, onInput: 'goInput'},
							{name: 'lblBirthDate', kind: 'enyo.Input', attributes: [{'readonly': true}],
								style: 'width: 95%', showing: false}
						]}
					]},
				]},
				{name: 'duplicatesContainer', showing :false, components: [
					{content: 'Potential Duplicates Found:', style: 'padding: 3px 5px 5px 5px',
						classes: 'oarn-control oarn-groupbox-column-header'},
					{name: 'repeater', kind: 'Repeater', select: false, onSetupItem: 'setupItem',
						components: [
							{name: 'itemWrapper', classes: 'oarn-search-results', components: [
								{tag: 'table', components: [
									{tag: 'tr', components: [
										{tag: 'td', components: [
											{tag: 'span', name: 'personID',
												classes: 'oarn-control oarn-groupbox-control'}
										]},
										{tag: 'td', components: [
											{tag: 'span', name: 'personName',
												classes: 'oarn-control oarn-groupbox-control'}
										]}
									]}
								]}
							]}
						]},
					{content: 'Are you sure you wish to create a new adult?', style: 'padding: 3px 5px 5px 5px',
						classes: 'oarn-control oarn-groupbox-column-header'},
					{style: 'text-align: center; padding-top:5px',
						components: [
							{name: 'btnYes', kind: 'onyx.Button', content: 'Yes - Create',
								ontap: 'goConfirmCreate', style: 'margin: 5px 5px 5px 5px',
								classes: 'onyx-affirmative'},
							{name: 'btnNo', kind: 'onyx.Button', content: 'No - Cancel',
								style: 'margin: 5px 5px 5px 5px',	ontap: 'goCancel'},
						]}
				]},
				{name: 'buttonsRow', style: 'text-align: center; padding-top:5px',
					components: [
						{name: 'btnCancel', kind: 'onyx.Button', content: 'Cancel',
							style: 'margin: 5px 5px 5px 5px',	ontap: 'goCancel'},
						{name: 'btnCreate', kind: 'onyx.Button', content: 'Create Family Record',
							ontap: 'goCreate', style: 'margin: 5px 5px 5px 5px', classes: 'onyx-affirmative'}
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

			onAjaxFinished: ''
		},

		create: function () {
			this.inherited(arguments);

			this.api = new oarn.API();

			var msg = 'This tool creates a new family record together with a <strong>new</strong> adult that will ' +
				'be set as the primary adult. Although basic duplicates checking is performed, it ' +
				'is assumed that you have verified that this adult has not yet been entered into the system.';

			this.$.summary.setContent(msg);
		},

		goCancel: function (inSender, inEvent) {
			this.hide();
			this.destroy();
		},

		goCreate: function (inSender, inEvent) {

			var fullname = this.$.txtFirstName.getValue() + ' ' + this.$.txtLastName.getValue();
			var endpoint = 'api/v1/family/adult-search/?fuzzy_match=' + encodeURIComponent(fullname);

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'GET');
			var ajax = this.api.getAjaxObject(endpoint);
			ajax.go();
			ajax.response(enyo.bindSafely(this, 'processResponse'));
			ajax.error(enyo.bindSafely(this, 'processError'));

			this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
		},

		processResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			this.collection = new enyo.Collection();
			this.collection.add(inResponse['results']);

			if (this.collection.length > 0) {
				this.$.duplicatesContainer.show();
				this.$.buttonsRow.hide();
			}

			this.$.repeater.setCount(this.collection.length);

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

		setupItem: function (inSender, inEvent) {
			var item = inEvent.item;

			item.$.personID.setContent(this.collection.at(inEvent.index).get('person_id') + ' - ');
			var firstName = this.collection.at(inEvent.index).get('first_name');
			var lastName = this.collection.at(inEvent.index).get('last_name');
			item.$.personName.setContent(lastName + ', ' + firstName);
		},

		goConfirmCreate: function (inSender, inEvent) {
			// first create the adult:
			var endpoint = 'api/v1/family/person/create/';

			var dob = null;
			if (!Number.isNaN(Date.parse(this.$.txtBirthDate.getValue()))) {
				var dob = moment(
					this.$.txtBirthDate.getValue(), 'MM/DD/YYYY'
				).format('YYYY-MM-DD');
			}

			var postBody = {
				"first_name": this.$.txtFirstName.getValue(),
				"last_name": this.$.txtLastName.getValue(),
				"birth_date": dob ,
				"organization_id": this.selectedOrganization.organization_id,
				"ref_role_id": 1
			}

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'POST');
			var ajax = this.api.getAjaxObject(endpoint);
			ajax.postBody = postBody;
			ajax.go();
			ajax.response(enyo.bindSafely(this, 'processPostAdultResponse'));
			ajax.error(enyo.bindSafely(this, 'processPostError'));
		},

		/**
		 * @private
		 * @param inRequest
		 * @param inResponse
		 */
		processPostAdultResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			this.adultResponse = inResponse;

			enyo.log('person created: ' + inResponse.person_id);

			var endpoint = 'api/v1/family/family/create/';

			var postBody = {
				"organizations": [ {"organization_id": this.selectedOrganization.organization_id}],
				"adults": [
					{"person_id": inResponse.person_id, "primary_adult": true}
				]
			};

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'POST');
			var ajax = this.api.getAjaxObject(endpoint);
			ajax.postBody = postBody;
			ajax.go();
			ajax.response(enyo.bindSafely(this, 'processPostFamilyResponse'));
			ajax.error(enyo.bindSafely(this, 'processPostError'));

		},

		/**
		 * @private
		 * @param inRequest
		 * @param inResponse
		 */
		processPostFamilyResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			this.$.popupFactory.showInfo('The family record has been created. The new Family ID is: ' +
				inResponse.family_id);


		},

		/**
		 * @private
		 * @param inSender
		 * @param inResponse
		 * @returns {boolean}
		 */
		processPostError: function (inSender, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			var status = inSender.xhrResponse.status;

			var detail = JSON.parse(inSender.xhrResponse.body)
			var detail_msg = '';
			for (var prop in detail) {
				if (detail.hasOwnProperty(prop)) {
					detail_msg = prop + ': ' + detail[prop] + '<br>';
				}
			}

			this.$.popupFactory.showInfo('Database Communication Error', 'An error occurred while trying to ' +
				' create the record. Please provide the following information to your database administrator: ' +
				'<br><br>' + 'status: ' + status + ' - ' + detail_msg);

			this.set('.xhrResponse', inSender.xhrResponse);
		}
	});

})(enyo, this);