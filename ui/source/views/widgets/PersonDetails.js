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
	 * @event oarn.PersonDetail#onAjaxError
	 * @type {object}
	 * @property {string} name - Name of the {@link oarn.PersonDetail} control that
	 * generated the event.
	 * @property {object} xhrResponse - The error details
	 * @public
	 */

	/**
	 * Fires when an ajax call is started, to alert parents to display spinners, ec.
	 *
	 * @event oarn.PersonDetail#onAjaxStarted
	 * @public
	 */

	/**
	 * Fires when an ajax call - one not handled locally - has returned, to alert parents to hide spinners, etc.
	 *
	 * @event oarn.PersonDetail#onAjaxFinished
	 * @public
	 */

	/**
	 * Fires when one or more inputs have been changed (entering a dirty state) or have been saved (leaving it).
	 *
	 * @event oarn.PersonDetail#onDirtyStateChanged
	 * @public
	 */

	/**
	 * {@link oarn.PersonDetails} allows the user to view/edit the basic details of a Person record.
	 *
	 * @class oarn.PersonDetail
	 * @extends enyo.Control
	 * @public
	 * @ui
	 */

	enyo.kind(
		/** @lends oarn.PersonDetail.prototype */{

			name: 'oarn.PersonDetails',

			genders_option_list: [],

			invalid: false, // We want to prevent auto-save if there is an invalid field

			observedDOB: null,

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
				selectedPersonID: 0,

				/**
				 * The initial tooltip text for the save button. After changes this will be retained
				 * and, if `showTimeStampTooltip` is `true`, the last saved timestamp will be
				 * added to the end.
				 *
				 * @type {String}
				 * @default 'Click to save.'
				 * @public
				 */
				baseSaveString: 'Click to save.',

				/**
				 * Sets the number of milliseconds before each autosave.
				 *
				 * @type {number}
				 * @default 15000
				 * @public
				 */
				saveDelay: 15000,

				/**
				 * Determines whether a last saved timestamp will be added to the tooltip after saving.
				 *
				 * @type {Boolean}
				 * @default true
				 * @public
				 */
				showTimeStampTooltip: true,

				/**
				 * When the state has changed but not yet saved, this is set to true.
				 * It is used to alert parent controls that we have unsaved changes here.
				 *
				 * @type {Boolean}
				 * @public
				 */
				dirty: false
			},

			/**
			 * @private
			 */
			components: [
				{kind: 'onyx.Groupbox', style: 'width: 350px', components: [
					{kind: 'onyx.GroupboxHeader', components: [
						{name: 'mainHeader', content: 'Details for: ', classes: 'oarn-header', tag:'span'},
						{kind: 'onyx.TooltipDecorator',
							style: 'display: inline; float:right', components: [
							{name: 'saveButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
								src: 'static/assets/save-gray-small.png',
								ontap: 'goSaveChanges'},
							{name: 'saveTooltip', kind: 'onyx.Tooltip', content: '',
								allowHtml: true, classes: 'oarn-tooltip'}
						]}
					]},
					{tag: 'table', components: [
						{tag: 'tr', components: [
							{tag: 'td', components: [
								{kind: 'onyx.TooltipDecorator', components: [
									{tag: 'label', kind: 'enyo.Control', content: 'Prefix:',
										attributes: [{'for': 'txtPrefix'}]},
									{name: 'prefixTooltip', kind: 'onyx.Tooltip', allowHtml: true, content: ''}
								]}
							]},
							{tag: 'td', components: [
								{name: 'txtPrefix', kind: 'enyo.Input', style: 'width: 95%',
									classes: 'oarn-control', attributes: [{'maxlength': 30}],
									oninput: 'goInput'}
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
								{tag: 'label', content: 'Middle Name:',
									classes: 'oarn-control oarn-groupbox-control',
									attributes: [{'for': 'txtMiddleName'}]}
							]},
							{tag: 'td', components: [
								{name: 'txtMiddleName', kind: 'enyo.Input', style: 'width: 95%',
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
								{kind: 'onyx.TooltipDecorator', components: [
									{tag: 'label', kind: 'Control', content: 'Generation Code:',
										attributes: [{'for': 'txtGenerationCode'}]},
									{name: 'generationCodeTooltip', kind: 'onyx.Tooltip', allowHtml: true, content: ''}
								]}
							]},
							{tag: 'td', components: [
									{name: 'txtGenerationCode', kind: 'enyo.Input', style: 'width: 95%',
										classes: 'oarn-control', attributes: [{'maxlength': 10}],
										oninput: 'goInput'},
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
									style: 'width: 95%', showing: false},
								{name: 'ageSummary', style: 'font-style: italic; font-size: smaller;'}
							]}
						]},
						{tag: 'tr', components: [
							{tag: 'td', components: [
								{tag: 'label', content: 'Gender:',
									classes: 'oarn-control oarn-groupbox-control',
									attributes: [{'for': 'selectGender'}]}
							]},
							{tag: 'td', components: [
								{name: 'selectGender', kind: 'oarn.DataSelect', style: 'width: 95%',
									classes: 'oarn-control', onchange: 'goInput'},
								{name: 'lblGender', kind: 'enyo.Input', style: 'width: 95%',
									attributes: [{'readonly': true}], showing: false}
							]}
						]}
					]}

				]},

				{name: 'popupFactory', kind: 'oarn.PopupFactory'}
			],

			observers: {
				watchDOB: ['observedDOB']
			},

			/**
			 * @private
			 */
			bindings: [
				{from: '.baseSaveString', to: '$.saveTooltip.content'},
				{from: '.$.txtBirthDate.value', to: 'observedDOB'},
				{from: '.$.lblBirthDate.value', to: 'observedDOB'}
			],

			/**
			 * @private
			 */
			events: {
				onAjaxError: '',

				onAjaxStarted: '',

				onAjaxFinished: '',

				onGenderOptionsReturned: '', // handled locally

				onDirtyStateChanged: ''
			},

			/**
			 * @private
			 */
			handlers: {
				onGenderOptionsReturned: 'genderOptionsReturnedHandler'
			},

			/**
			 * @private
			 */
			create: function () {
				this.inherited(arguments);

				this.api = new oarn.API();

				this.$.prefixTooltip.setContent("An appellation, if any, used to denote rank, placement, or " +
					"<br>status (e.g., Mr., Ms., Reverend, Sister, Dr., Colonel).");

				this.$.generationCodeTooltip.setContent("An appendage, if any, used to denote a person's " +
					"<br>generation in his/her family (e.g., Jr., Sr., III).");

			},

			watchDOB: function (previous, current, property) {
				var dob = null;
				if (!Number.isNaN(Date.parse(current))) {
					var testDate = new Date(current).toISOString();
					var dob = moment(testDate).format('YYYY-MM-DD');
				}
				if (dob !== null) {
					var summary = '';
					var years = moment().diff(dob, 'years');
					var months = moment().diff(dob, 'months') % 12;
					if (months <= 1) {
						summary = months + ' month';
					}
					else {
						summary = months + ' months';
					}
					if (years == 1) {
						summary = years + ' year ' + summary;
					}
					else {
						summary = years + ' years ' + summary;
					}
					this.$.ageSummary.setContent(summary);
				}
			},

			/**
			 * @private
			 * @param oldVal
			 */
			selectedPersonIDChanged: function (oldVal) {
				if (this.genders_option_list.length == 0) {
					// if no data for the dropdowns, start those fetch requests and let them
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
				var endpoint = 'api/v1/ref/genders/';
				var ajax = this.api.getAjaxObject(endpoint);
				ajax.go();
				ajax.response(enyo.bindSafely(this, 'processGendersResponse'));
				ajax.error(enyo.bindSafely(this, 'processError')); // we can share error handling

				this.doAjaxStarted(); // let a parent control turn on a spinner, etc.
			},


			/**
			 * Handles the incoming data for the genders select box.
			 *
			 * @private
			 * @param inRequest
			 * @param inResponse
			 */
			processGendersResponse: function (inRequest, inResponse) {
				this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

				var details = [];
				if (inResponse['results'].length > 0) {
					var detail = {
						value: null,
						display_text: ''
					}
					details.push(detail);
				}

				for (var i = 0; i < inResponse['results'].length; i++) {
					if (inResponse['results'][i] !== undefined) {
						var detail = {
							value: inResponse['results'][i]['ref_gender_id'],
							display_text: inResponse['results'][i]['description']
						};
						details.push(detail);
					}

				}
				this.genders_option_list = details;
				this.doGenderOptionsReturned();
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
			 * Is triggered once the data for the gender dropdown has returned.
			 * This lets us wait until that data is present before populating the rest of the fields.
			 *
			 * @private
			 * @param inSender
			 * @param inEvent
			 * @returns {boolean}
			 */
			genderOptionsReturnedHandler: function (inSender, inEvent) {
				this.refreshData();
				return true;
			},

			/**
			 * Retrieves a fresh set of details data from the server.
			 *
			 * @private
			 */
			refreshData: function () {
				this.set('.api.token', this.get('.token'));
				this.set('.api.method', 'GET');
				var endpoint = 'api/v1/family/person/'+ this.get('.selectedPersonID') + '/';
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

				this.$.mainHeader.setContent('Details for: ' + inResponse['first_name'] + ' ' +
					inResponse['last_name'] + ' (' + inResponse['person_id'] + ')');

				var dob = null;

				if (inResponse['read_only']) {
					this.$.saveButton.setDisabled(true);
					this.set('.baseSaveString', 'This record is read-only.')

					this.$.txtPrefix.setDisabled(true);
					this.$.txtFirstName.setDisabled(true);
					this.$.txtMiddleName.setDisabled(true);
					this.$.txtLastName.setDisabled(true);
					this.$.txtGenerationCode.setDisabled(true);

					this.$.txtPrefix.setValue(inResponse['prefix']);
					this.$.txtFirstName.setValue(inResponse['first_name']);
					this.$.txtMiddleName.setValue(inResponse['middle_name']);
					this.$.txtLastName.setValue(inResponse['last_name']);
					this.$.txtGenerationCode.setValue(inResponse['generation_code']);

					this.$.txtBirthDate.hide();
					this.$.lblBirthDate.show();
					if (inResponse['birth_date'] != null) {
						dob = moment(inResponse['birth_date'],'YYYY-MM-DD').format('MM/DD/YYYY');
					}
					this.$.lblBirthDate.setValue(dob);

					this.$.selectGender.hide();
					this.$.lblGender.show();

					for (var i = 0; i < this.genders_option_list.length; i++) {
						if (inResponse['ref_gender'] == this.genders_option_list[i].value) {
							this.$.lblGender.setValue(this.genders_option_list[i].display_text);
						}
					}

				}
				else {
					this.$.saveButton.setDisabled(false);
					this.set('.baseSaveString', 'Click to save.')

					this.$.txtPrefix.setDisabled(false);
					this.$.txtFirstName.setDisabled(false);
					this.$.txtMiddleName.setDisabled(false);
					this.$.txtLastName.setDisabled(false);
					this.$.txtGenerationCode.setDisabled(false);

					this.$.txtPrefix.setValue(inResponse['prefix']);
					this.$.txtFirstName.setValue(inResponse['first_name']);
					this.$.txtMiddleName.setValue(inResponse['middle_name']);
					this.$.txtLastName.setValue(inResponse['last_name']);
					this.$.txtGenerationCode.setValue(inResponse['generation_code']);


					this.$.lblBirthDate.hide();
					this.$.txtBirthDate.show();

					this.$.lblGender.hide();
					this.$.selectGender.show();

					if (inResponse['birth_date'] != null) {
						dob = moment(inResponse['birth_date'],'YYYY-MM-DD').format('MM/DD/YYYY');
					}
					this.$.txtBirthDate.setValue(dob);

					this.$.selectGender.options_list.empty();
					this.$.selectGender.options_list.add(this.genders_option_list);

					for (var i = 0; i < this.genders_option_list.length; i++) {
						if (inResponse['ref_gender'] == this.genders_option_list[i].value) {
							this.$.selectGender.setSelected(i);
						}
					}
				}
			},

			/**
			 * Any valid input starts the autosave timer.
			 *
			 * @param inSender
			 * @param inEvent
			 * @private
			 */
			goInput: function(inSender, inEvent) {

				this.set('.dirty', true);

				if (inEvent.originator.name == 'txtFirstName') {
					if (this.$.txtFirstName.getValue().length == 0) {
						this.$.txtFirstName.addClass('oarn-invalid-input');
						this.set('.invalid', true);
						this.stopJob('SavePersonDetailsInput');
					}
					else {
						this.$.txtFirstName.removeClass('oarn-invalid-input');
						this.set('.invalid', false);
					}
				}

				if (inEvent.originator.name == 'txtLastName') {
					if (this.$.txtLastName.getValue().length == 0) {
						this.$.txtLastName.addClass('oarn-invalid-input');
						this.set('.invalid', true);
						this.stopJob('SavePersonDetailsInput');
					}
					else {
						this.$.txtLastName.removeClass('oarn-invalid-input');
						this.set('.invalid', false);
					}
				}

				if (inEvent.originator.name == 'txtBirthDate') {

				}

				if (!this.get('.invalid')) {
					// Set the autosave job in motion:
					this.lastChanged = new Date();
					this.$.saveButton.setSrc('static/assets/save-small.png');
					this.saveJob = this.startJob('SavePersonDetailsInput', enyo.bindSafely(this, 'goSaveChanges'),
						this.get('saveDelay'));
				}

			},

			/**
			 * Called by the autosave timer or by clicking the save button, this sends the saved data to the server.
			 *
			 * @param inSender
			 * @param inEvent
			 * @private
			 */
			goSaveChanges: function(inSender, inEvent) {
				if (this.get('.invalid')) {

					this.stopJob('SavePersonDetailsInput');

					if (this.$.txtFirstName.getValue().length == 0) {
						this.$.popupFactory.showInfo('Invalid Data', 'The first name cannot be empty.');
						return;
					}

					else if (this.$.txtLastName.getValue().length == 0) {
						this.$.popupFactory.showInfo('Invalid Data', 'The last name cannot be empty.');
						return;
					}

					else {
						this.$.popupFactory.showInfo('Invalid Data', 'Unknown validation problem. ' +
						'Please contact your database administrator.');
						return;
					}

				}
				else {

					var pk = this.get('.selectedPersonID');
					
					var dob = null;
					if (!Number.isNaN(Date.parse(this.$.txtBirthDate.getValue()))) {
						var testDate = new Date(this.$.txtBirthDate.getValue()).toISOString();
						var dob = moment(testDate).format('YYYY-MM-DD');
					}

					console.log(this.$.selectGender.getValue());
					var postBody = {
						'first_name': this.$.txtFirstName.getValue(),
						'middle_name': this.$.txtMiddleName.getValue(),
						'last_name': this.$.txtLastName.getValue(),
						'generation_code': this.$.txtGenerationCode.getValue(),
						'prefix': this.$.txtPrefix.getValue(),
						'birth_date': dob,
						'ref_gender': this.$.selectGender.getValue()
					};

					this.set('.api.token', this.get('.token'));
					this.set('.api.method', 'PATCH');
					var endpoint = 'api/v1/family/person/' + pk + '/';
					var ajax = this.api.getAjaxObject(endpoint);
					ajax.postBody = postBody;

					this.doAjaxStarted();
					ajax.go();
					ajax.response(enyo.bindSafely(this, 'patchResponse'));
					ajax.error(enyo.bindSafely(this, 'patchError'));


				}

			},

			/**
			 * @private
			 * @param inRequest
			 * @param inResponse
			 */
			patchResponse: function (inRequest, inResponse) {
				this.doAjaxFinished(); // let a parent control turn off a spinner, etc.
				this.set('.dirty', false);

				this.stopJob('SavePersonDetailsInput');
				this.lastSaved = new Date();
				if (this.lastChanged < this.lastSaved) {
					this.$.saveButton.setSrc('static/assets/save-gray-small.png');

					if (this.get('showTimeStampTooltip')) {
						var saveString = this.get('baseSaveString');
						saveString += ' <em>(last saved: ' + this.lastSaved.toLocaleTimeString() + ')</em>';
						this.$.saveTooltip.set('content', saveString);
					}
				}

				this.$.mainHeader.setContent('Details for: ' + inResponse['first_name'] + ' ' +
					inResponse['last_name'] + ' (' + inResponse['person_id'] + ')');

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

			goDelete: function (inSender, inEvent) {
				var msg = 'Clicking \'Yes\' will permanently delete this address record and ' +
					'cannot be undone. Continue?';

				this.set('.currentIndex', inEvent.index);
				this.$.popupFactory.showConfirm('Confirm Delete', msg);
			},

			dirtyChanged: function (inOldVal) {
				this.doDirtyStateChanged({'dirty': this.get('.dirty')});
			}
		});

})(enyo, this);