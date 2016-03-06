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
		name: 'oarn.PersonLanguages',

		kind: 'Control',


		language_options_list: [],

		language_use_types_options_list: [],

		/**
		 * @lends oarn.PersonDetail.prototype
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
			selectedPersonID: 0

		},

		components: [
			{kind: 'onyx.Groupbox', style: 'max-width:450px;', components: [
				{kind: 'onyx.GroupboxHeader', components: [
					{content: 'Languages', classes: 'oarn-header', tag:'span'}
				]},
				{name: 'noResultsRow', content: 'No Language Proficiency Records Found',
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
										{name: 'selectLanguage', kind: 'oarn.DataSelect',
											classes: 'oarn-control oarn-groupbox-control'},
										{name: 'lblLanguage', kind: 'enyo.Input',
											classes: 'oarn-control oarn-groupbox-control',
											disabled: true, showing: false}
									]},
									{tag: 'td', components: [
										{name: 'selectLanguageUseType', kind: 'oarn.DataSelect',
											classes: 'oarn-control oarn-groupbox-control'},
										{name: 'lblLanguageUseType', kind: 'enyo.Input',
											classes: 'oarn-control oarn-groupbox-control',
											disabled: true, showing: false}
									]},
									{tag: 'td', components: [
										{kind: 'onyx.TooltipDecorator', style: 'display: inline', components: [
											{name: 'deleteButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
												src: 'static/assets/blue-delete.png', ontap: 'goDelete'},
											{kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
												content: 'Delete this language proficiency record.'}
										]},
									]},
									{tag: 'td', components: [
										{kind: 'onyx.TooltipDecorator', style: 'display: inline', components: [
											{name: 'saveButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
												src: 'static/assets/save-small.png', ontap: 'goSave'},
											{kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
												content: 'Save changes to this record.'}
										]},
									]}
								]},
								{tag: 'tr', components: [
									{tag: 'td', attributes: [{'colspan':3}], components: [
										{tag: 'label', kind: 'enyo.Control', content: 'Details:',
											style: 'display: inline;',
											attributes: [{'for': 'txtDetails'}]},
										{name: 'txtDetails', kind: 'enyo.Input', style: 'width: 70%',
											classes: 'oarn-control', attributes: [{'maxlength': 100}],
											oninput: 'goInput'}
									]}
								]}
							]}
						]
					}]
				},

				{name: 'newLanguage', components: [
					{kind: 'onyx.GroupboxHeader', classes: 'oarn-new-row-header', components: [
						{content: 'New Language Proficiency Record:', classes: 'oarn-header',
							tag:'span'},
						{kind: 'onyx.TooltipDecorator', style: 'display: inline; float:right', components: [
							{name: 'newButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
								src: 'static/assets/blue-add.png', ontap: 'goNewLanguage'},
							{kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
								content: 'Create a new language proficiency record.'}
						]}
					]},
					{name: 'new_itemWrapper', tag: 'table',
						style: 'width: 100%; border: 1px solid darkgray; border-collapse: collapse;',
						classes: 'oarn-control', components: [
						{tag: 'tr', components: [
							{tag: 'td', style: 'text-align: left;', components: [
								{name: 'new_selectLanguage', kind: 'oarn.DataSelect',
									classes: 'oarn-control oarn-groupbox-control',
								style: 'padding-right: 2px; margin-right: 0px;'}
							]},
							{tag: 'td', style: 'text-align:left;', components: [
								{name: 'new_selectLanguageUseType', kind: 'oarn.DataSelect',
									classes: 'oarn-control oarn-groupbox-control',
									style: 'padding-left: 2px; margin-left: 0px;'}
							]}
						]},
						{tag: 'tr', components: [
							{tag: 'td', attributes: [{'colspan':2}], components: [
								{tag: 'label', kind: 'enyo.Control', content: 'Details:',
									style: 'display: inline;',
									attributes: [{'for': 'new_txtDetails'}]},
								{name: 'new_txtDetails', kind: 'enyo.Input', style: 'width: 70%',
									classes: 'oarn-control', attributes: [{'maxlength': 100}],
									oninput: 'goInput'}
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

			onLanguageOptionsReturned: '', // handled locally

			onLanguageUseTypesOptionsReturned: '' // handled locally
		},

		/**
		 * @private
		 */
		handlers: {
			onLanguageOptionsReturned: 'languageOptionsReturnedHandler',

			onLanguageUseTypesOptionsReturned: 'languageUseTypesOptionsReturnedHandler',

			onPopupClosed: 'popupClosedHandler'
		},

		observers: {
			watchSelectReturned: ['languagesReturned', 'languageUseTypesReturned']
		},

		/**
		 * @private
		 */
		create: function () {
			this.inherited(arguments);

			this.api = new oarn.API();
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

		selectedPersonIDChanged: function (oldVal) {
			if (this.language_options_list.length == 0 || this.language_use_types_options_list.length == 0) {
				// if no data for the dropdowns, start those fetch requests and let them
				// call the main refresh routine when complete.
				this.set('.languagesReturned', false);
				this.set('.languageUseTypesReturned', false);
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
			var endpoint = 'api/v1/ref/languages/';
			var ajax = this.api.getAjaxObject(endpoint);
			ajax.go();
			ajax.response(enyo.bindSafely(this, 'processLanguagesResponse'));
			ajax.error(enyo.bindSafely(this, 'processError')); // we can share error handling

			this.doAjaxStarted(); // let a parent control turn on a spinner, etc.

			endpoint = 'api/v1/ref/language-use-types/';
			var ajax2 = this.api.getAjaxObject(endpoint);
			ajax2.go();
			ajax2.response(enyo.bindSafely(this, 'processLanguageUseTypesResponse'));
			ajax2.error(enyo.bindSafely(this, 'processError'));

			this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
		},

		/**
		 * Handles the incoming data for the languages select box.
		 *
		 * @private
		 * @param inRequest
		 * @param inResponse
		 */
		processLanguagesResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			var details = [];
			details.push({value: null, display_text: ''}); // let the user select a null row.

			for (var i = 0; i < inResponse['results'].length; i++) {
				if (inResponse['results'][i] !== undefined) {
					var detail = {
						value: inResponse['results'][i]['ref_language_id'],
						display_text: inResponse['results'][i]['description']
					};
					details.push(detail);
				}

			}
			this.language_options_list = details;
			this.doLanguageOptionsReturned();
		},

		processLanguageUseTypesResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			var details = [];
			details.push({value: null, display_text: ''}); // let the user select a null row.

			for (var i = 0; i < inResponse['results'].length; i++) {
				if (inResponse['results'][i] !== undefined) {
					var detail = {
						value: inResponse['results'][i]['ref_language_use_type_id'],
						display_text: inResponse['results'][i]['description']
					};
					details.push(detail);
				}

			}
			this.language_use_types_options_list = details;
			this.doLanguageUseTypesOptionsReturned();
		},

		languageOptionsReturnedHandler: function (inSender, inEvent) {
			this.set('.languagesReturned', true);
			return true;
		},

		languageUseTypesOptionsReturnedHandler: function (inSender, inEvent) {
			this.set('.languageUseTypesReturned', true);
			return true;
		},

		watchSelectReturned: function(previous, current, property) {
			if (this.get('.languagesReturned') && this.get('.languageUseTypesReturned')) {

				this.$.new_selectLanguage.options_list.empty();
				this.$.new_selectLanguage.options_list.add(this.language_options_list);

				this.$.new_selectLanguageUseType.options_list.empty();
				this.$.new_selectLanguageUseType.options_list.add(this.language_use_types_options_list);

				this.refreshData(); // load a fresh batch of languages for this person record.
			}
		},

		/**
		 * Retrieves a fresh set of details data from the server.
		 *
		 * @private
		 */
		refreshData: function () {
			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'GET');
			var endpoint = 'api/v1/family/person/language/?person_id='+ this.get('.selectedPersonID');
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
				var detail = {
					"person_language_id": inResponse['results'][i]['person_language_id'],
					"person": inResponse['results'][i]['person'],
					"ref_language": inResponse['results'][i]['ref_language'],
					"ref_language_use_type": inResponse['results'][i]['ref_language_use_type'],
					"other_details": inResponse['results'][i]['other_details'],
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
		 * Handles the instantiation of a given Repeater row.
		 *
		 * @private
		 * @param inSender
		 * @param inEvent
		 */
		setupItem: function (inSender, inEvent) {
			var item = inEvent.item;

			var language_index = 0;
			var language_value = this.collection.at(inEvent.index).get('ref_language');
			for (var i = 0; i < this.language_options_list.length; i++){
				if (this.language_options_list[i]['value'] == language_value) {
					language_index = i;
				}
			}
			item.$.selectLanguage.selectedIndex = language_index;
			item.$.selectLanguage.options_list.empty();
			item.$.selectLanguage.options_list.add(this.language_options_list);

			var language_use_type_index = 0;
			var language_use_type_value = this.collection.at(inEvent.index).get('ref_language_use_type');
			for (var i = 0; i < this.language_use_types_options_list.length; i++){
				if (this.language_use_types_options_list[i]['value'] == language_use_type_value) {
					language_use_type_index = i;
				}
			}
			item.$.selectLanguageUseType.selectedIndex = language_use_type_index;
			item.$.selectLanguageUseType.options_list.empty();
			item.$.selectLanguageUseType.options_list.add(this.language_use_types_options_list);

			item.$.txtDetails.setValue(this.collection.at(inEvent.index).get('other_details'));

			if (this.collection.at(inEvent.index).get('read_only')) {
				item.$.saveButton.hide();
				item.$.deleteButton.hide();
				item.$.txtDetails.setDisabled(true);
				item.$.selectLanguage.hide();
				item.$.selectLanguageUseType.hide();
				item.$.lblLanguage.show();
				item.$.lblLanguage.setValue(this.language_options_list[language_index]['display_text']);
				item.$.lblLanguageUseType.show();
				item.$.lblLanguageUseType.setValue(
					this.language_use_types_options_list[language_use_type_index]['display_text']);
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

			var pk = this.collection.at(inEvent.index).get('person_language_id');

			var item = this.$.repeater.itemAtIndex(inEvent.index);

			var postBody = {
				"person": this.get('.selectedPersonID'),
				"ref_language": item.$.selectLanguage.getValue(),
				"ref_language_use_type": item.$.selectLanguageUseType.getValue(),
				"other_details": item.$.txtDetails.getValue()
			}

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'PATCH');
			var endpoint = 'api/v1/family/person/language/' + pk + '/';
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
			var msg = 'Clicking \'Yes\' will permanently delete this language proficiency record and ' +
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

				var pk = this.collection.at(this.get('.currentIndex')).get('person_language_id')

				this.set('.api.token', this.get('.token'));
				this.set('.api.method', 'DELETE');
				var endpoint = 'api/v1/family/person/language/' + pk + '/';
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

		goNewLanguage: function (inSender, inEvent) {

			if (this.$.new_selectLanguage.getValue() == '') {
				this.$.popupFactory.showInfo('Invalid Data', 'A language must be selected for the new record.');
				return;
			}

			if (this.$.new_selectLanguageUseType.getValue() == '') {
				this.$.popupFactory.showInfo('Invalid Data', 'A language use type ' +
					'must be selected for the new record.');
				return;
			}

			var postBody = {
				"person": this.get('.selectedPersonID'),
				"ref_language": this.$.new_selectLanguage.getValue(),
				"ref_language_use_type": this.$.new_selectLanguageUseType.getValue(),
				"other_details": this.$.new_txtDetails.getValue()
			}

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'POST');
			var endpoint = 'api/v1/family/person/language/';
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

			this.$.popupFactory.showSimple('New language proficiency record created');

			this.$.new_selectLanguage.setSelected(0);
			this.$.new_selectLanguageUseType.setSelected(0);
			this.$.new_txtDetails.setValue('');

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
