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
		name: 'oarn.FamilyPrograms',

		locations_options_list: [],

		programs_options_list: [],

		confirmPopupMode: '', // values can be: confirmDelete, confirmProgramChange

		published: {

			api: null,

			token: null,

			selectedOrganization: null,

			currentOrgReadOnly: false,

			currentOrgReadWrite: false,

			currentOrgAdmin: false,

			selectedFamilyID: -1,

			selectedFamilyEnrollmentID: -1,

			selectedProgramID: -1
		},

		components: [
			{kind: 'onyx.Groupbox', style: 'max-width:600px;', components: [
				{kind: 'onyx.GroupboxHeader', components: [
					{content: 'Family Program Enrollment', classes: 'oarn-header',	tag:'span'},
					{kind: 'onyx.TooltipDecorator', style: 'display: inline; float:right', components: [
						{name: 'newButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
							src: 'static/assets/blue-add.png', ontap: 'goNewProgram'},
						{kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
							content: 'Enroll this family in a new program.'}
					]}
				]},
				{name: 'noResultsRow', content: 'No Family Enrollment Records Found',
					classes: 'oarn-no-results-text'},
				{name: 'repeaterScroller', kind: 'Scroller', horizontal: 'hidden',
					maxHeight:'300px', components:[
					{name: 'repeater', kind: 'enyo.Repeater', multiSelect: false, onSetupItem: 'setupItem',
						components: [
							{name: 'itemWrapper', tag: 'table',
								style: 'width: 100%; border: 1px solid darkgray; border-collapse: collapse;',
								classes: 'oarn-control', components: [
								{name: 'headerRow', style: 'border-bottom-style: 1px solid darkgray', tag: 'tr',
									components: [
									{tag: 'td', allowHtml:true, content: '&nbsp;'},
									{tag: 'td', classes: 'oarn-groupbox-td-header', content: 'Program'},
									{tag: 'td', content: 'Location',classes: 'oarn-groupbox-td-header'},
									{tag: 'td', content: 'Open Date', classes: 'oarn-groupbox-td-header'},
									{tag: 'td', content: 'Close Date', classes: 'oarn-groupbox-td-header'}
								]},
								{tag: 'tr', components: [
									{tag: 'td', components: [
										{kind: 'onyx.Button', content: 'Select', classes: 'onyx-dark',
											ontap: 'programSelected'}
									]},
									{tag: 'td', components: [
										{name: 'selectProgram', kind: 'oarn.DataSelect', style: 'max-width: 175px',
											classes: 'oarn-control oarn-groupbox-control',
											onchange: 'goProgramChanged'},
										{name: 'lblProgram', kind: 'enyo.Input', style: 'max-width: 175px',
											classes: 'oarn-control oarn-groupbox-control',
											disabled: true, showing: false}
									]},
									{tag: 'td', components: [
										{name: 'selectLocation', kind: 'oarn.DataSelect', style: 'max-width: 175px',
											classes: 'oarn-control oarn-groupbox-control'},
										{name: 'lblLocation', kind: 'enyo.Input', style: 'width: 120px',
											classes: 'oarn-control oarn-groupbox-control',
											disabled: true, showing: false}
									]},
									{tag: 'td', components: [
										{name: 'txtOpenDate', kind: 'oarn.DatePicker', width: '95%',
											classes: 'oarn-control', onSelect: 'goInput', emptyIsValid: false},
										{name: 'lblOpenDate', kind: 'enyo.Input', attributes: [{'readonly': true}],
											style: 'width: 95%', showing: false},
									]},
									{tag: 'td', components: [
										{name: 'txtCloseDate', kind: 'oarn.DatePicker', width: '95%',
											classes: 'oarn-control', onSelect: 'goInput', emptyIsValid: true},
										{name: 'lblCloseDate', kind: 'enyo.Input', attributes: [{'readonly': true}],
											style: 'width: 95%', showing: false},
									]},
									{tag: 'td', components: [
										{name: 'deleteButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
											src: 'static/assets/blue-delete.png', ontap: 'goDelete'}
									]},
									{tag: 'td', components: [
										{name: 'saveButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
											src: 'static/assets/save-small.png', ontap: 'goSave'}
									]}
								]}
							]}
						]}
				]}
			]},

			{name: 'selectedProgramHeader', classes: 'oarn-summary-header',
				style: 'margin-top: 10px', content: ''},

			{name: 'newRecordPopup', kind: 'onyx.Popup', autoDismiss: false, modal: true,
				centered: true, scrim: true, floating: true, style: 'background-color: #EAEAEA',
				components: [

					{kind: 'onyx.Groupbox', components: [

						{kind: 'onyx.GroupboxHeader', content: 'New Family Enrollment Record'},
						{tag: 'table', components: [
							{tag: 'tr', components: [
								{tag: 'td', components: [
									{tag: 'label', content: 'Program:',
										classes: 'oarn-control oarn-groupbox-control',
										attributes: [{'for': 'new_selectProgram'}]}
								]},
								{tag: 'td', components: [
									{name: 'new_selectProgram', kind: 'oarn.DataSelect',
										classes: 'oarn-control oarn-groupbox-control', style: 'width: 95%'}
								]},
							]},
							{tag: 'tr', components: [
								{tag: 'td', components: [
									{tag: 'label', content: 'Location:',
										classes: 'oarn-control oarn-groupbox-control',
										attributes: [{'for': 'new_selectLocation'}]}
								]},
								{tag: 'td', components: [
									{name: 'new_selectLocation', kind: 'oarn.DataSelect',
										classes: 'oarn-control oarn-groupbox-control', style: 'width: 95%'}
								]},
							]},
							{tag: 'tr', components: [
								{tag: 'td', components: [
									{tag: 'label', content: 'Open Date:',
										classes: 'oarn-control oarn-groupbox-control',
										attributes: [{'for': 'new_txtOpenDate'}]}
								]},
								{tag: 'td', components: [
									{name: 'new_txtOpenDate', kind: 'oarn.DatePicker', width: '95%',
										classes: 'oarn-control', onSelect: 'goInput', emptyIsValid: false}
								]},
							]},
							{tag: 'tr', components: [
								{tag: 'td', components: [
									{tag: 'label', content: 'Close Date:',
										classes: 'oarn-control oarn-groupbox-control',
										attributes: [{'for': 'new_txtCloseDate'}]}
								]},
								{tag: 'td', components: [
									{name: 'new_txtCloseDate', kind: 'oarn.DatePicker', width: '95%',
										classes: 'oarn-control', onSelect: 'goInput', emptyIsValid: true
									}
								]},
							]}
						]},
						{name: 'buttonsRow', style: 'text-align: center; padding-top:5px',
							components: [
								{name: 'btnClose', kind: 'onyx.Button', content: 'Close',
									style: 'margin: 5px 5px 5px 5px',	ontap: 'closeNewRecord'},
								{name: 'btnSave', kind: 'onyx.Button', content: 'Create Record',
									ontap: 'saveNewRecord', style: 'margin: 5px 5px 5px 5px',
									classes: 'onyx-affirmative'}
						]}
					]}
				]},

			{name: 'popupFactory', kind: 'oarn.PopupFactory'}
		],

		observers:[
            {method: 'watchSelectReturned', path: ['programsReturned', 'locationsReturned']},
            {method: 'isReady', path: ['selectedOrganization', 'selectedFamilyID']}
        ],

		/**
		 * @private
		 */
		events: {
			onAjaxError: '',

			onAjaxStarted: '',

			onAjaxFinished: '',

			onLocationOptionsReturned: '', // handled locally

			onProgramOptionsReturned: '' // handled locally
		},

		/**
		 * @private
		 */
		handlers: {
			onLocationOptionsReturned: 'locationOptionsReturnedHandler',

			onProgramOptionsReturned: 'programOptionsReturnedHandler',

			onPopupClosed: 'popupClosedHandler'

		},

		create: function () {
			this.inherited(arguments);
			this.collection = new enyo.Collection();
			this.api = new oarn.API();
		},

		rendered: function () {
			this.inherited(arguments);

			if (this.get('.currentOrgReadOnly')) {
				this.$.newButton.hide();
			}
		},

        /**
         * Wait for selectedChildID and selectedOrganization to be set before building controls.
         *
         * @private
         */
        isReady: function (previous, current, property) {
            if (this.get('.selectedFamilyID') != -1 && (this.get('.selectedOrganization') != null)) {
                if (this.programs_options_list.length == 0 || this.locations_options_list.length == 0) {
                    // if no data for the dropdowns, start those fetch requests and let them
                    // call the main refresh routine when complete.
                    this.set('.programsReturned', false);
                    this.set('.locationsReturned', false);
                    this.loadSelectData();
                }
                else {
                    // We already have the dropdown data, so go straight to main refresh:
                    this.refreshData();
                }
            }
        },

		setupItem: function (inSender, inEvent) {
			var item = inEvent.item;

			if (inEvent.index == 0) {
				item.$.headerRow.show();
			}
			else {
				item.$.headerRow.hide();
			}

			var program_index = 0;
			var program_value = this.collection.at(inEvent.index).get('ref_program');
			for (var i = 0; i < this.programs_options_list.length; i++){
				if (this.programs_options_list[i]['value'] == program_value) {
					program_index = i;
				}
			}

			var location_index = 0;
			var location_value = this.collection.at(inEvent.index).get('location');
			for (var i = 0; i < this.locations_options_list.length; i++){
				if (this.locations_options_list[i]['value'] == location_value) {
					location_index = i;
				}
			}

			var openDate = null;
			var closeDate = null;
			if (this.collection.at(inEvent.index).get('open_date') != null) {
				openDate = moment(this.collection.at(inEvent.index).get('open_date'),'YYYY-MM-DD').format('MM/DD/YYYY');
			}
			if (this.collection.at(inEvent.index).get('close_date') != null) {
				closeDate = moment(this.collection.at(inEvent.index).get('close_date'),'YYYY-MM-DD').format('MM/DD/YYYY');
			}

			if (this.collection.at(inEvent.index).get('read_only')) {
				item.$.selectProgram.hide();
				item.$.selectLocation.hide();
				item.$.txtOpenDate.hide();
				item.$.txtCloseDate.hide();

				item.$.lblProgram.show();
				item.$.lblLocation.show();
				item.$.lblOpenDate.show();
				item.$.lblCloseDate.show();

				item.$.saveButton.hide();
				item.$.deleteButton.hide();

				item.$.lblProgram.setValue(this.programs_options_list[program_index].display_text);
				item.$.lblLocation.setValue(this.locations_options_list[location_index].display_text);
				item.$.lblOpenDate.setValue(openDate);
				item.$.lblCloseDate.setValue(closeDate);
			}
			else {
				item.$.selectProgram.show();
				item.$.selectLocation.show();
				item.$.txtOpenDate.show();
				item.$.txtCloseDate.show();

				item.$.lblProgram.hide();
				item.$.lblLocation.hide();
				item.$.lblOpenDate.hide();
				item.$.lblCloseDate.hide();

				item.$.saveButton.show();
				item.$.deleteButton.show();

				item.$.selectProgram.selectedIndex = program_index;
				item.$.selectProgram.options_list.empty();
				item.$.selectProgram.options_list.add(this.programs_options_list);

				item.$.selectLocation.selectedIndex = location_index;
				item.$.selectLocation.options_list.empty();
				item.$.selectLocation.options_list.add(this.locations_options_list);

				item.$.txtOpenDate.setValue(openDate);
				item.$.txtCloseDate.setValue(closeDate);
			}
		},

		programSelected: function (inSender, inEvent) {

			var header = 'Selected Program: ';
			var selectedValue = '';
			var closeDate = null;

			if (this.collection.at(inEvent.index).get('read_only')) {
				selectedValue = this.$.repeater.itemAtIndex(inEvent.index).$.lblProgram.getValue();
				header = selectedValue + ': ';
				header = header + this.$.repeater.itemAtIndex(inEvent.index).$.lblOpenDate.getValue();

				closeDate = null;
				if (!Number.isNaN(Date.parse(this.$.repeater.itemAtIndex(inEvent.index).$.lblCloseDate.getValue()))) {
					closeDate = this.$.repeater.itemAtIndex(inEvent.index).$.lblCloseDate.getValue();
					header = header + ' - ' + closeDate;
				} else {
					header = header + ' - Present';
				}
			}
			else {
				selectedValue = this.$.repeater.itemAtIndex(inEvent.index).$.selectProgram.getValue();
				for (var i = 0; i < this.programs_options_list.length; i++) {
					if (selectedValue == this.programs_options_list[i].value) {
						header = header + this.programs_options_list[i].display_text;
						break;
					}
				}

				header = header + ': ';
				header = header + this.$.repeater.itemAtIndex(inEvent.index).$.txtOpenDate.getValue();

				closeDate = null;
				if (!Number.isNaN(Date.parse(this.$.repeater.itemAtIndex(inEvent.index).$.txtCloseDate.getValue()))) {
					closeDate = this.$.repeater.itemAtIndex(inEvent.index).$.txtCloseDate.getValue();
					header = header + ' - ' + closeDate;
				} else {
					header = header + ' - Present';
				}
			}
			this.$.selectedProgramHeader.setContent(header);
			this.set('.selectedFamilyEnrollmentID', this.collection.at(inEvent.index).get('family_enrollment_id'));
			this.set('.selectedProgramID', this.collection.at(inEvent.index).get('ref_program'));

		},

		/**
		 * @private
		 */
		loadSelectData: function () {
			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'GET');
			var endpoint = 'api/v1/organization/locations/?organization_id=' +
                this.get('.selectedOrganization.organization_id');
			var ajax = this.api.getAjaxObject(endpoint);
			ajax.go();
			ajax.response(enyo.bindSafely(this, 'processLocationsResponse'));
			ajax.error(enyo.bindSafely(this, 'processError')); // we can share error handling

			this.doAjaxStarted(); // let a parent control turn on a spinner, etc.

			endpoint = 'api/v1/ref/programs/';
			var ajax2 = this.api.getAjaxObject(endpoint);
			ajax2.go();
			ajax2.response(enyo.bindSafely(this, 'processProgramsResponse'));
			ajax2.error(enyo.bindSafely(this, 'processError'));

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

		processLocationsResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			var details = [];
			details.push({value: null, display_text: ''}); // let the user select a null row.

			for (var i = 0; i < inResponse['results'].length; i++) {
				if (inResponse['results'][i] !== undefined) {
					var detail = {
						value: inResponse['results'][i]['organization_location_id'],
						display_text: inResponse['results'][i]['short_name']
					};
					details.push(detail);
				}

			}
			this.locations_options_list = details;
			this.doLocationOptionsReturned();
		},

		processProgramsResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			var details = [];
			for (var i = 0; i < inResponse['results'].length; i++) {
				if (inResponse['results'][i] !== undefined) {
					var detail = {
						value: inResponse['results'][i]['ref_program_id'],
						display_text: inResponse['results'][i]['description']
					};
					details.push(detail);
				}

			}
			this.programs_options_list = details;
			this.doProgramOptionsReturned();
		},

		locationOptionsReturnedHandler: function (inSender, inEvent) {
			this.set('.locationsReturned', true);
			return true;
		},

		programOptionsReturnedHandler: function (inSender, inEvent) {
			this.set('.programsReturned', true);
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
			var endpoint = 'api/v1/program/family-enrollment-full/?family_id='+ this.get('.selectedFamilyID');
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
					"family_enrollment_id": inResponse['results'][i]['family_enrollment_id'],
					"family": inResponse['results'][i]['family'],
					"ref_program": inResponse['results'][i]['ref_program']['ref_program_id'],
					"location": inResponse['results'][i]['location'],
					"open_date": inResponse['results'][i]['open_date'],
					"close_date": inResponse['results'][i]['close_date'],
					"read_only": inResponse['results'][i]['read_only'],
					"servicelevelrecords": inResponse['results'][i]['servicelevelenrollment_set'].length

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

		watchSelectReturned: function(previous, current, property) {
			if (this.get('.locationsReturned') && this.get('.programsReturned')) {

				this.$.new_selectProgram.options_list.empty();
				this.$.new_selectProgram.options_list.add(this.programs_options_list);

				this.$.new_selectLocation.options_list.empty();
				this.$.new_selectLocation.options_list.add(this.locations_options_list);

				this.refreshData(); // load a fresh batch of languages for this person record.
			}
		},

		goNewProgram: function (inSender, inEvent) {
			this.$.newRecordPopup.show();
		},

		closeNewRecord: function (inSender, inEvent) {
			this.$.newRecordPopup.hide();
		},

		saveNewRecord: function (inSender, inEvent) {
			var testDate = null;
			var openDate = null;
			if (!Number.isNaN(Date.parse(this.$.new_txtOpenDate.getValue()))) {
				testDate = new Date(this.$.new_txtOpenDate.getValue()).toISOString();
				openDate = moment(testDate).format('YYYY-MM-DD');
			}

			if (openDate == null) {
				this.$.popupFactory.showInfo('Invalid Data', 'An open date is required.');
				return;
			}

			var closeDate = null;
			if (!Number.isNaN(Date.parse(this.$.new_txtCloseDate.getValue()))) {
				testDate = new Date(this.$.new_txtCloseDate.getValue()).toISOString();
				closeDate = moment(testDate).format('YYYY-MM-DD');
			}

			var postBody = {
				"family": this.get('.selectedFamilyID'),
				"ref_program": this.$.new_selectProgram.getValue(),
				"location": this.$.new_selectLocation.getValue(),
				"open_date": openDate,
				"close_date": closeDate
			}

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'POST');
			var endpoint = 'api/v1/program/family-enrollment/';
			var ajax = this.api.getAjaxObject(endpoint);
			ajax.postBody = postBody;

			this.doAjaxStarted();
			ajax.go();
			ajax.response(enyo.bindSafely(this, 'postResponse'));
			ajax.error(enyo.bindSafely(this, 'processError'));
		},

		postResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			this.$.popupFactory.showSimple('New family enrollment record created');

			this.$.new_selectProgram.setSelected(0);
			this.$.new_selectLocation.setSelected(0);
			this.$.new_txtOpenDate.setValue(null);
			this.$.new_txtCloseDate.setValue(null);

			this.refreshData();
		},

		goSave: function (inSender, inEvent) {
			var item = this.$.repeater.itemAtIndex(inEvent.index);

			var testDate = null;
			var openDate = null;
			if (!Number.isNaN(Date.parse(item.$.txtOpenDate.getValue()))) {
				testDate = new Date(item.$.txtOpenDate.getValue()).toISOString();
				openDate = moment(testDate).format('YYYY-MM-DD');
			}

			if (openDate == null) {
				this.$.popupFactory.showInfo('Invalid Data', 'An open date is required.');
				return;
			}

			var closeDate = null;
			if (!Number.isNaN(Date.parse(item.$.txtCloseDate.getValue()))) {
				testDate = new Date(item.$.txtCloseDate.getValue()).toISOString();
				closeDate = moment(testDate).format('YYYY-MM-DD');
			}

			var postBody = {
				"family": this.get('.selectedFamilyID'),
				"ref_program": item.$.selectProgram.getValue(),
				"location": item.$.selectLocation.getValue(),
				"open_date": openDate,
				"close_date": closeDate
			}

			// Changing the program can have side effects on linked service levels.
			// 1) Has the program changed?
			if (this.get('.selectedProgramID') != item.$.selectProgram.getValue()) {
				// 2) Are there associated service levels?
				var msg = 'Changing the program will delete any service level records' +
					' linked to this family enrollment record. Continue?';

				this.set('.confirmPopupMode', 'confirmProgramChange')
				this.set('.currentIndex', inEvent.index);
				this.set('.savePostBody', postBody);
				this.$.popupFactory.showConfirm('Confirm Program Change', msg);
				return; // the popup return handler will take care of the save.
			}

			var pk = this.collection.at(inEvent.index).get('family_enrollment_id');

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'PATCH');
			var endpoint = 'api/v1/program/family-enrollment/' + pk + '/';
			var ajax = this.api.getAjaxObject(endpoint);
			ajax.postBody = postBody;

			this.doAjaxStarted();
			ajax.go();
			ajax.response(enyo.bindSafely(this, 'patchResponse'));
			ajax.error(enyo.bindSafely(this, 'processError'));
		},

		patchResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.
			this.set('.currentIndex', -1); // clear the current index into the repeater.
			this.$.popupFactory.showSimple('Changes Saved');
			this.set('.selectedProgramID', inResponse['ref_program']);
		},

		goDelete: function (inSender, inEvent) {
			var msg = 'Clicking \'Yes\' will permanently delete this family enrollment record and ' +
				'all related individual enrollment records and service level records. ' +
				'It cannot be undone. Continue?';

			this.set('.currentIndex', inEvent.index);
			this.set('confirmPopupMode', 'confirmDelete');
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
			if (this.get('.confirmPopupMode') == 'confirmDelete') {
				if ((inEvent.confirmed === undefined) || (inEvent.confirmed === false)) {
					return; // we only want to take action if a delete confirmation has occurred
				}
				else if ((inEvent.confirmed) && (this.get('.currentIndex') > -1)) {

					var pk = this.collection.at(this.get('.currentIndex')).get('family_enrollment_id')

					this.set('.api.token', this.get('.token'));
					this.set('.api.method', 'DELETE');
					var endpoint = 'api/v1/program/family-enrollment/' + pk + '/';
					var ajax = this.api.getAjaxObject(endpoint);

					this.doAjaxStarted();
					ajax.go();
					ajax.response(enyo.bindSafely(this, 'deleteResponse'));
					ajax.error(enyo.bindSafely(this, 'processError'));
				}
				this.set('.confirmPopupMode', '');
				return true;
			}
			else if (this.get('.confirmPopupMode') == 'confirmProgramChange') {
				if ((inEvent.confirmed === undefined) || (inEvent.confirmed === false)) {
					return; // we only want to take action if a save confirmation has occurred
				}
				else if ((inEvent.confirmed) && (this.get('.currentIndex') > -1)) {
					this.set('.programChangedConfirmed', true);
					var pk = this.collection.at(this.get('.currentIndex')).get('family_enrollment_id');

					this.set('.api.token', this.get('.token'));
					this.set('.api.method', 'PATCH');
					var endpoint = 'api/v1/program/family-enrollment/' + pk + '/';
					var ajax = this.api.getAjaxObject(endpoint);
					ajax.postBody = this.savePostBody;

					this.doAjaxStarted();
					ajax.go();
					ajax.response(enyo.bindSafely(this, 'patchResponse'));
					ajax.error(enyo.bindSafely(this, 'processError'));
				}
				this.set('.confirmPopupMode', '');
				return true;
			}
		},


		/**
		 * After a successful delete operation, clear the controls and reset variables.
		 * @param inRequest
		 * @param inResponse
		 */
		deleteResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.
			this.set('.currentIndex', -1); // clear the current index into the repeater.
			this.set('.selectedFamilyEnrollmentID', -1);
			this.set('.selectedProgramID', -1);
			this.refreshData();
		},

		selectedFamilyEnrollmentIDChanged: function (inSender, inEvent) {
			if (this.get('.selectedFamilyID') == -1) {
				this.$.selectedProgramHeader.hide();
				this.set('.selectedProgramID', -1);
			}
		}
	});

})(enyo, this);