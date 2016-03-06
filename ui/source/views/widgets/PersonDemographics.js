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
		name: 'oarn.PersonDemographics',


		/**
		 * A flag used to prevent repeated attempts to POST a new race record.
		 *
		 * @private
		 */
		postAttemptMade: false,

		/**
		 * @lends oarn.PersonDemographics.prototype
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
			 * The person_id of the person whose demographics are displayed.
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
			dirty: false,

			/**
			 * When the demographics data is pulled from the server, it is stored here.
			 * This is necessary because it may be the result of the initial GET or, if
			 * no record was found, the result of a POST. The 'Changed' event triggers the
			 * the setting of the visible widget details.
			 *
			 * @public
			 * @type {object} - The JSON object returned by the server
			 * @default null
			 */
			serverData: null
		},

		components: [
			{kind: 'onyx.Groupbox', style: 'width: 350px', components: [
				{kind: 'onyx.GroupboxHeader', components: [
					{name: 'mainHeader', content: 'Demographics', classes: 'oarn-header', tag:'span'},
					{kind: 'onyx.TooltipDecorator',
						style: 'display: inline; float:right', components: [
						{name: 'saveButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
							src: 'static/assets/save-gray-small.png',
							ontap: 'goSaveChanges'},
						{name: 'saveTooltip', kind: 'onyx.Tooltip', content: '',
							allowHtml: true, classes: 'oarn-tooltip'}
					]}
				]},
				{tag: 'table', name: 'tblEthnicityDetails', components: [
					{tag: 'tr', components: [
						{tag: 'td', attributes: [{'colspan': '2'}], components:[
							{content: 'Ethnicity', classes: 'oarn-groupbox-column-header'}
						]}
					]},
					{tag: 'tr', components: [
						{tag: 'td', style: 'width: 80%;', components: [
							{kind: 'onyx.TooltipDecorator', components: [
								{tag: 'label', kind: 'Control', content: 'Hispanic or Latino:',
									style: 'display: inline-block',
									attributes: [{'for': 'chkHispanic'}]},
								{name: 'hispanicTooltip', kind: 'onyx.Tooltip', allowHtml: true, content: ''}
							]}

						]},
						{tag: 'td', style: 'text-align: center; width: 20%', components: [
							{name: 'chkHispanic', kind: 'enyo.Checkbox',
								style: 'display: inline-block', onchange: 'goInput',
								showing: false},
							{name: 'lblHispanic', kind: 'enyo.Checkbox',
								style: 'display: inline-block',
								onchange: 'frozenCheckboxChanged'}
						]}
					]},
					{tag: 'tr', components: [
						{tag: 'td', attributes: [{'colspan': '2'}], components:[
							{content: 'Race', classes: 'oarn-groupbox-column-header'}
						]}
					]},
					{tag: 'tr', components: [
						{tag: 'td', style: 'width: 80%;', components: [
							{kind: 'onyx.TooltipDecorator', components: [
								{tag: 'label', content: 'American Indian or Alaska Native:',
									kind: 'Control',
									style: 'display: inline-block',
									attributes: [{'for': 'chkAmericanIndian'}]},
								{name: 'amerTooltip', kind: 'onyx.Tooltip', allowHtml: true, content: ''}
							]}

						]},
						{tag: 'td', style: 'text-align: center; width: 20%;', components: [
							{name: 'chkAmericanIndian', kind: 'enyo.Checkbox',
								style: 'display: inline-block', showing: false, onchange: 'goInput'},
							{name: 'lblAmericanIndian', kind: 'enyo.Checkbox',
								style: 'display: inline-block', onchange: 'frozenCheckboxChanged'}
						]}
					]},
					{tag: 'tr', components: [
							{tag: 'td', style: 'width: 80%;', components: [
								{kind: 'onyx.TooltipDecorator', components: [
									{tag: 'label', content: 'Asian:', style: 'display: inline-block',
										kind: 'Control',
										attributes: [{'for': 'chkAsian'}]},
									{name: 'asianTooltip', kind: 'onyx.Tooltip', allowHtml: true, content: ''}
								]}
						]},

						{tag: 'td', style: 'text-align: center; width: 20%;', components: [
							{name: 'chkAsian', kind: 'enyo.Checkbox',
								style: 'display: inline-block', showing: false, onchange: 'goInput'},
							{name: 'lblAsian', kind: 'enyo.Checkbox',
								style: 'display: inline-block', onchange: 'frozenCheckboxChanged'}
						]}
					]},
					{tag: 'tr', components: [
						{tag: 'td', style: 'width: 80%;', components: [
							{kind: 'onyx.TooltipDecorator', components: [
								{tag: 'label', content: 'Black or African American:',
									style: 'display: inline-block',
									kind: 'Control',
									attributes: [{'for': 'chkAfricanAmerican'}]},
								{name: 'africanTooltip', kind: 'onyx.Tooltip', allowHtml: true, content: ''}
							]}

						]},
						{tag: 'td', style: 'text-align: center; width: 20%;', components: [
							{name: 'chkAfricanAmerican', kind: 'enyo.Checkbox',
								style: 'display: inline-block', showing: false, onchange: 'goInput'},
							{name: 'lblAfricanAmerican', kind: 'enyo.Checkbox',
								style: 'display: inline-block', onchange: 'frozenCheckboxChanged'}
						]}
					]},
					{tag: 'tr', components: [
						{tag: 'td', style: 'width: 80%;', components: [
							{kind: 'onyx.TooltipDecorator', components: [
								{tag: 'label', content: 'Native Hawaiian or Other Pacific Islander:',
									style: 'display: inline-block', kind: 'Control',
									attributes: [{'for': 'chkPacific'}]},
								{name: 'pacificTooltip', kind: 'onyx.Tooltip', allowHtml: true, content: ''}
							]}
						]},
						{tag: 'td', style: 'text-align: center; width: 20%;', components: [
							{name: 'chkPacific', kind: 'enyo.Checkbox',
								style: 'display: inline-block', showing: false, onchange: 'goInput'},
							{name: 'lblPacific', kind: 'enyo.Checkbox',
								style: 'display: inline-block', onchange: 'frozenCheckboxChanged'}
						]}
					]},
					{tag: 'tr', components: [
						{tag: 'td', style: 'width: 80%;', components: [
							{kind: 'onyx.TooltipDecorator', components:[
								{tag: 'label', content: 'White:',
									style: 'display: inline-block', kind: 'Control',
									attributes: [{'for': 'chkWhite'}]},
								{name: 'whiteTooltip', kind: 'onyx.Tooltip', allowHtml:true, content: ''}
							]}
						]},
						{tag: 'td', style: 'text-align: center; width: 20%;', components: [
							{name: 'chkWhite', kind: 'enyo.Checkbox',
								style: 'display: inline-block', showing: false, onchange: 'goInput'},
							{name: 'lblWhite', kind: 'enyo.Checkbox',
								style: 'display: inline-block', onchange: 'frozenCheckboxChanged'}
						]}
					]},
                    {tag: 'tr', components: [
                        {tag: 'td', style: 'width: 80%;', components: [
                            {tag: 'label', content: 'Multiracial:',
                                style: 'display: inline-block', kind: 'Control',
                                attributes: [{'for': 'chkMultiracial'}]}
                        ]},
                        {tag: 'td', style: 'text-align: center; width: 20%;', components: [
                            {name: 'chkMultiracial', kind: 'enyo.Checkbox',
                                style: 'display: inline-block', showing: false, onchange: 'goInput'},
                            {name: 'lblMultiracial', kind: 'enyo.Checkbox',
                                style: 'display: inline-block', onchange: 'frozenCheckboxChanged'}
                        ]}
                    ]},
                    {tag: 'tr', components: [
                        {tag: 'td', style: 'width: 80%;', components: [
                            {tag: 'label', content: 'Race Unreported:',
                                style: 'display: inline-block', kind: 'Control',
                                attributes: [{'for': 'chkUnreported'}]}
                        ]},
                        {tag: 'td', style: 'text-align: center; width: 20%;', components: [
                            {name: 'chkUnreported', kind: 'enyo.Checkbox',
                                style: 'display: inline-block', showing: false, onchange: 'goInput'},
                            {name: 'lblUnreported', kind: 'enyo.Checkbox',
                                style: 'display: inline-block', onchange: 'frozenCheckboxChanged'}
                        ]}
                    ]},
					{tag: 'tr', components: [
						{tag: 'td', style: 'width: 80%;', components: [
							{tag: 'label', content: 'Other:',
								style: 'display: inline-block', classes: 'oarn-control oarn-groupbox-control',
								attributes: [{'for': 'chkOther'}]}
						]},
						{tag: 'td', style: 'text-align: center; width: 20%;', components: [
							{name: 'chkOther', kind: 'enyo.Checkbox',
								style: 'display: inline-block', showing: false, onchange: 'goInput'},
							{name: 'lblOther', kind: 'enyo.Checkbox',
								style: 'display: inline-block', onchange: 'frozenCheckboxChanged'}
						]}
					]},
					{tag: 'tr', components: [
						{tag: 'td', attributes: [{'colspan': '2'}], style: 'width: 80%;', components: [
							{tag: 'label', content: 'Other Details:',
								style: 'display: inline-block', classes: 'oarn-control oarn-groupbox-control',
								attributes: [{'for': 'txtOtherDetails'}]}
						]}
					]},
					{tag: 'tr', components: [
						{tag: 'td', attributes: [{'colspan': '2'}], style: 'width: 80%;', components: [
							{name: 'txtOtherDetails', kind: 'enyo.Input',
								style: 'width: 95%; margin: 5px 5px 5px 5px',
								classes: 'oarn-control', attributes: [{'maxlength': 100}],
								oninput: 'goInput', disabled: true}
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

			onDirtyStateChanged: ''
		},

		/**
		 * @private
		 */
		bindings: [
			{from: '.baseSaveString', to: '$.saveTooltip.content'}
		],

		create: function () {
			this.inherited(arguments);

			this.api = new oarn.API();


			// The following descriptions were taken from: https://nces.ed.gov/ipeds/reic/definitions.asp
			// (The National Center for Education Statistics):

			var citation = "<br><cite>(The National Center for Education Statistics)</cite>";

			var hispanic_tooltip =
				"A person of Cuban, Mexican, Puerto Rican, South or Central American, or " +
				"<br>other Spanish culture or origin, regardless of race.";

			var amer_tooltip = "A person having origins in any of the original peoples of North and  " +
				"<br>South America (including Central America) who maintains cultural " +
				"<br>identification through tribal affiliation or community attachment.";

			var asian_tooltip =
				"A person having origins in any of the original peoples of the Far East," +
				"<br>Southeast Asia, or the Indian Subcontinent, including, for example, " +
				"<br>Cambodia, China, India, Japan, Korea, Malaysia, Pakistan, the" +
				"<br> Philippine Islands, Thailand, and Vietnam.";

			var african_tooltip = "A person having origins in any of the black racial groups of Africa.";

			var pacific_tooltip =
				"A person having origins in any of the original peoples of Hawaii, " +
				"<br>Guam, Samoa, or other Pacific Islands.";

			var white_tooltip = "A person having origins in any of the original peoples of " +
				"<br>Europe, the Middle East, or North Africa.";

			this.$.hispanicTooltip.setContent(hispanic_tooltip + citation);
			this.$.amerTooltip.setContent(amer_tooltip + citation);
			this.$.asianTooltip.setContent(asian_tooltip + citation);
			this.$.africanTooltip.setContent(african_tooltip + citation);
			this.$.pacificTooltip.setContent(pacific_tooltip + citation);
			this.$.whiteTooltip.setContent(white_tooltip + citation);
		},

		selectedPersonIDChanged: function (oldVal) {

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'GET');
			var endpoint = 'api/v1/family/person/'+ this.get('.selectedPersonID') + '/race/';
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
			this.set('.serverData', inResponse);
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

			if (inSender.xhrResponse.status == 404 && !this.get('.postAttemptMade')) {
				// A 404 means that a race record does not yet exist for this individual and should be created.

				this.set('.postAttemptMade', true); // flag to prevent repeated POST attempts

				this.set('.api.token', this.get('.token'));
				this.set('.api.method', 'POST');
				var endpoint = 'api/v1/family/person/race/';

				var postBody = {
					'person_id': this.get('selectedPersonID')
				};


				var ajax = this.api.getAjaxObject(endpoint);
				ajax.postBody = postBody;

				this.doAjaxStarted();
				ajax.go();
				ajax.response(enyo.bindSafely(this, 'processPostResponse'));
				ajax.error(enyo.bindSafely(this, 'processPostError'));

				return true;
			}
			else {
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
			}

		},

		/**
		 * Handles the Ajax post response on success.
		 *
		 * @param inRequest
		 * @param inResponse
		 * @private
		 */
		processPostResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.
			this.set('.serverData', inResponse);
		},

		/**
		 * Handles ajax POST errors silently, so read-only users aren't confronted with an
		 * error when the UI can't create a missing race record..
		 *
		 * @param inSender
		 * @param inResponse
		 * @private
		 */
		processPostError: function (inSender, inResponse) {
			var status = inSender.xhrResponse.status;
			var detail = JSON.parse(inSender.xhrResponse.body);

			var detail_msg = '';
			for (var prop in detail) {
				if (detail.hasOwnProperty(prop)) {
					detail_msg = prop + ': ' + detail[prop] + '; ';
				}
			}

			enyo.log('Unable to create demographics record. This may not indicate an error condition if the ' +
				'current user has read-only access to this person. ' +
				'The error returned was: ' + status + ' - ' + detail_msg);

			this.set('.xhrResponse', inSender.xhrResponse);
			return true;

		},

		/**
		 * In the read-only portions of the control, we want to prevent the user from changing
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
		 * Any valid input starts the autosave timer.
		 *
		 * @param inSender
		 * @param inEvent
		 * @private
		 */
		goInput: function(inSender, inEvent) {

			this.set('.dirty', true);

			if (inEvent.originator.name == 'txtOtherDetails') {
				if (this.$.chkOther.getChecked()) {
					if (this.$.txtOtherDetails.getValue().length == 0) {
						this.$.txtOtherDetails.addClass('oarn-invalid-input');
						this.set('.invalidOtherDetails', true);
					}
					else {
						this.$.txtOtherDetails.removeClass('oarn-invalid-input');
						this.set('.invalidOtherDetails', false);
					}
				}
				else if (this.$.txtOtherDetails.getValue().length > 0) {
					this.$.chkOther.setChecked(true);
					this.$.txtOtherDetails.removeClass('oarn-invalid-input');
					this.set('.invalidOtherDetails', false);
				}
			}

			if (inEvent.originator.name == 'chkOther') {
				if (this.$.chkOther.getChecked() && (this.$.txtOtherDetails.getValue() == null ||
					this.$.txtOtherDetails.getValue().length == 0)) {
					this.$.txtOtherDetails.addClass('oarn-invalid-input');
					this.set('.invalidOtherDetails', true);
				}
				else if (this.$.chkOther.getChecked() && (this.$.txtOtherDetails.getValue() != null &&
					this.$.txtOtherDetails.getValue().length > 0)) {
					this.$.txtOtherDetails.removeClass('oarn-invalid-input');
					this.set('.invalidOtherDetails', false);
				}
				else if (!this.$.chkOther.getChecked() && (this.$.txtOtherDetails.getValue() != null &&
					this.$.txtOtherDetails.getValue().length > 0)) {
					this.$.chkOther.setChecked(true);
					this.$.txtOtherDetails.removeClass('oarn-invalid-input');
					this.set('.invalidOtherDetails', false);
				}
				else if (!this.$.chkOther.getChecked() && (this.$.txtOtherDetails.getValue() == null ||
					this.$.txtOtherDetails.getValue().length == 0)) {
					this.$.txtOtherDetails.removeClass('oarn-invalid-input');
					this.set('.invalidOtherDetails', false);
				}
			}

            if (inEvent.originator.name == 'chkUnreported') {
                if (this.$.chkUnreported.getChecked()) {
                    this.$.chkAmericanIndian.setChecked(false);
                    this.$.chkAsian.setChecked(false);
                    this.$.chkAfricanAmerican.setChecked(false);
                    this.$.chkPacific.setChecked(false);
                    this.$.chkWhite.setChecked(false);
                    this.$.chkMultiracial.setChecked(false);
                }
            } else {
                if (inEvent.originator.name == 'chkAmericanIndian' ||
                    inEvent.originator.name == 'chkAsian' ||
                    inEvent.originator.name == 'chkAfricanAmerican' ||
                    inEvent.originator.name == 'chkPacific' ||
                    inEvent.originator.name == 'chkWhite' ||
                    inEvent.originator.name == 'chkMultiracial'
                ) {
                    if (this.$.chkUnreported.getChecked()) {
                        this.$.chkUnreported.setChecked(false);
                    }
                }
            }

			if (!this.get('.invalidOtherDetails')) {
				this.lastChanged = new Date();
				this.$.saveButton.setSrc('static/assets/save-small.png');
				this.saveJob = this.startJob('SavePersonDemographicsInput', enyo.bindSafely(this, 'goSaveChanges'),
					this.get('saveDelay'));
			} else {
				this.stopJob('SavePersonDemographicsInput');
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

			this.stopJob('SavePersonDemographicsInput');

			var pk = this.get('.selectedPersonID');

			var postBody = {
				'hispanic_latino_ethnicity': this.$.chkHispanic.getChecked(),
				'american_indian': this.$.chkAmericanIndian.getChecked(),
				'asian': this.$.chkAsian.getChecked(),
				'black': this.$.chkAfricanAmerican.getChecked(),
				'pacific': this.$.chkPacific.getChecked(),
				'white': this.$.chkWhite.getChecked(),
                'multiracial': this.$.chkMultiracial.getChecked(),
                'unreported': this.$.chkUnreported.getChecked(),
				'other': this.$.chkOther.getChecked(),
				'other_details': this.$.txtOtherDetails.getValue()
			};

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'PATCH');
			var endpoint = 'api/v1/family/person/' + pk + '/race/';
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
			this.set('dirty', false);
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

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

		serverDataChanged: function (inSender, inEvent) {
			if (this.serverData['read_only']) {
				this.$.chkHispanic.hide();
				this.$.chkAmericanIndian.hide();
				this.$.chkAsian.hide();
				this.$.chkAfricanAmerican.hide();
				this.$.chkPacific.hide();
				this.$.chkWhite.hide();
                this.$.chkMultiracial.hide();
                this.$.chkUnreported.hide();
				this.$.chkOther.hide();

				this.$.lblHispanic.show();
				this.$.lblHispanic.setChecked(this.serverData['hispanic_latino_ethnicity']);
				this.$.lblAmericanIndian.show();
				this.$.lblAmericanIndian.setChecked(this.serverData['american_indian']);
				this.$.lblAsian.show();
				this.$.lblAsian.setChecked(this.serverData['asian']);
				this.$.lblAfricanAmerican.show();
				this.$.lblAfricanAmerican.setChecked(this.serverData['black']);
				this.$.lblPacific.show();
				this.$.lblPacific.setChecked(this.serverData['pacific']);
				this.$.lblWhite.show();
				this.$.lblWhite.setChecked(this.serverData['white']);
                this.$.lblMultiracial.show();
                this.$.lblMultiracial.setChecked(this.serverData['multiracial']);
                this.$.lblUnreported.show();
                this.$.lblUnreported.setChecked(this.serverData['unreported']);
				this.$.lblOther.show();
				this.$.lblOther.setChecked(this.serverData['other']);

				this.$.txtOtherDetails.setDisabled(true);
				this.$.txtOtherDetails.setValue(this.serverData['other_details']);
			} 
			else {
				this.$.lblHispanic.hide();
				this.$.lblAmericanIndian.hide();
				this.$.lblAsian.hide();
				this.$.lblAfricanAmerican.hide();
				this.$.lblPacific.hide();
				this.$.lblWhite.hide();
                this.$.lblMultiracial.hide();
                this.$.lblUnreported.hide();
				this.$.lblOther.hide();
				
				this.$.chkHispanic.show();
				this.$.chkHispanic.setChecked(this.serverData['hispanic_latino_ethnicity']);
				this.$.chkAmericanIndian.show();
				this.$.chkAmericanIndian.setChecked(this.serverData['american_indian']);
				this.$.chkAsian.show();
				this.$.chkAsian.setChecked(this.serverData['asian']);
				this.$.chkAfricanAmerican.show();
				this.$.chkAfricanAmerican.setChecked(this.serverData['black']);
				this.$.chkPacific.show();
				this.$.chkPacific.setChecked(this.serverData['pacific']);
				this.$.chkWhite.show();
				this.$.chkWhite.setChecked(this.serverData['white']);
                this.$.chkMultiracial.show();
                this.$.chkMultiracial.setChecked(this.serverData['multiracial']);
                this.$.chkUnreported.show();
                this.$.chkUnreported.setChecked(this.serverData['unreported']);
				this.$.chkOther.show();
				this.$.chkOther.setChecked(this.serverData['other']);

				this.$.txtOtherDetails.setDisabled(false);
				this.$.txtOtherDetails.setValue(this.serverData['other_details']);
			}
		},

		dirtyChanged: function (inOldVal) {
			this.doDirtyStateChanged({'dirty': this.get('.dirty')});
		}
	});

})(enyo, this);