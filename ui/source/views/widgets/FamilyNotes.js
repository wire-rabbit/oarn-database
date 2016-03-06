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
	 * {@link oarn.FamilyNotes} is a widget for keeping track of family notes. It includes
	 * icon buttons for adding a timestamp with the username (bound from a parent
	 * control), save, undo, and redo buttons, an info button the pulls help from the
	 * database, as well as its own data source for populating or saving the text.
	 *
	 * @class oarn.FamilyNotes
	 * @extends enyo.Control
	 * @ui
	 * @public
	 */

	enyo.kind({
		name: 'oarn.FamilyNotes',
		kind: 'enyo.Control',

		/**
		 * @private
		 */
		lastChanged: null,

		/**
		 * @private
		 */
		lastSaved: null,

		/**
		 * Contains an array of text changes, in increments of 5 changes.
		 *
		 * @private
		 */
		textChanges: [],

		/**
		 * The current index into the array of text changes.
		 *
		 * @private
		 */
		textChangesIndex: 0,

		/**
		 *  The number of changes since the last save to the textChanges array.
		 *  Will go up to 5 and then roll over back to 0 once the changes have
		 *  been copied to textChanges.
		 *
		 *  @private
		 */
		textChangesCounter: 0,

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
			 * When the state has changed but not yet saved, this is set to true.
			 * It is used to alert parent controls that we have unsaved changes here.
			 *
			 * @type {Boolean}
			 * @public
			 */
			dirty: false,

			/**
			 * Sets the width of the groupbox, as a CSS value for 'width'.
			 *
			 * @type {String}
			 * @default '400px'
			 * @public
			 */
			width: '400px',

			/**
			 * Sets the height of the textbox, as a CSS value for 'height'.
			 * (The width of the textbox is set to 100% so as to fit the groupbox.)
			 *
			 * @type {String}
			 * @default '300px'
			 * @public
			 */
			height: '300px',

			/**
			 * Sets the maximum number of characters the textarea will accept.
			 *
			 * @type {number}
			 * @default: 2000
			 * @public
			 */
			maxLength: 2000,

			/**
			 * Sets the header text for the groupbox.
			 *
			 * @type {String}
			 * @default ''
			 * @public
			 */
			headerText: 'Family Notes',

			/**
			 * Sets the placeholder text in the text area.
			 *
			 * @type {String}
			 * @default ''
			 * @public
			 */
			placeholderText: '',

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
			 * Determines whether a last saved timestamp will be added to the tooltip after saving.
			 *
			 * @type {Boolean}
			 * @default true
			 * @public
			 */
			showTimeStampTooltip: true,

			/**
			 * Sets the number of milliseconds before each autosave.
			 *
			 * @type {number}
			 * @default 15000
			 * @public
			 */
			saveDelay: 15000,

			/**
			 * Determines whether the text area should be read-only.
			 *
			 * @type {Boolean}
			 * @default false
			 * @public
			 */
			readOnly: false,

			/**
			 * Sets the number of undo/redo changes to store.
			 *
			 * @type {number}
			 * @default 25
			 * @public
			 */
			maxChangesSaved: 25,

			/**
			 * Sets the username to be used with the timestamp button. Typically this should be bound from
			 * a parent component.
			 *
			 * @type {String}
			 * @default 'none'
			 * @public
			 */
			username: 'none',

			selectedFamilyID: 0,
			selectedOrganization: null,
			currentOrgReadOnly: true,
			currentOrgReadWrite: false,
			currentOrgAdmin: false

		},

		components: [

			{name: 'container', kind: 'onyx.Groupbox', style: 'width: 500px;', components: [
				{kind: 'onyx.GroupboxHeader',	components: [
					{name: 'notesHeader', tag: 'span', content: 'Family Notes', classes: 'oarn-header' },
					{kind: 'onyx.TooltipDecorator',	style: 'display: inline; float: right', components: [
						{name: 'timestampButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
							src: 'static/assets/clock-small.png', ontap: 'goTimestamp'},
						{kind: 'onyx.Tooltip', classes: 'oarn-tooltip',
							content: 'Click to add a timestamp to the notes'}
					]},
					{kind: 'onyx.TooltipDecorator',
						style: 'display: inline; float:right', components: [
						{name: 'saveButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
							src: 'static/assets/save-gray-small.png',
							ontap: 'goSaveChanges'},
						{name: 'saveTooltip', kind: 'onyx.Tooltip',
							classes: 'oarn-tooltip', content: '', allowHtml: true}
					]},
					{kind: 'onyx.TooltipDecorator', style: 'display: inline; float: right;', components: [
						{name: 'redoButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
							src: 'static/assets/redo-small.png',
							ontap: 'goRedo'},
						{name: 'redoTooltip', kind: 'onyx.Tooltip', classes: 'oarn-tooltip', content: 'Redo typing'}
					]},
					{kind: 'onyx.TooltipDecorator', style: 'display: inline; float: right;', components: [
						{name: 'undoButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
							src: 'static/assets/undo-small.png', ontap: 'goUndo'},
						{name: 'undoTooltip', kind: 'onyx.Tooltip', classes: 'oarn-tooltip', content: 'Undo typing'}
					]}
				]},
				{kind: 'onyx.InputDecorator', components: [
					{name: 'notes', kind: 'onyx.TextArea', style: 'width:100%; height:500px;', placeholder: '',
						oninput: 'goInput', classes: 'oarn-control'}
				]}
			]},
			{name: 'infoPopup', kind: 'onyx.Popup', title: 'Foo Title', centered: true,
				floating: true, components: [
				{name: 'infoTitle', content:'Foo Title'},
				{name: 'infoBody', kind: 'Scroller', style: 'width:400px', maxHeight:'100px', components: [
					// To be filled at runtime
				]}
			]},
			{name: 'undoPopup', kind: 'onyx.Popup', modal: false, floating: true, centered:true,
				content: 'No changes to undo'},
			{name: 'redoPopup', kind: 'onyx.Popup', modal: false, floating: true, centered: true,
				content: 'No changes to redo'},

			{name: 'popupFactory', kind: 'oarn.PopupFactory'}

		],

		bindings: [
			{from: '.baseSaveString', to: '$.saveTooltip.content'},
			{from: '.placeholderText', to: '$.notes.placeholder'},
			{from: '.headerText', to: '$.notesHeader.content'}
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
		create: function() {
			this.inherited(arguments);

			this.api = new oarn.API();

			// Set read-only status, width, height, and maxLength properties:
			this.readOnlyChanged();
			this.heightChanged();
			this.widthChanged();
			this.maxLengthChanged();
		},

		/**
		 * Retrieves fresh notes data from the server.
		 *
		 * @private
		 */
		refreshData: function () {

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'GET');
			var endpoint = 'api/v1/family/' + this.get('.selectedFamilyID') + '/notes/';
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

			if (inResponse['notes'] != null) {
				this.$.notes.setValue(inResponse['notes']);
			}
			else {
				this.$.notes.setValue('');

			}

			if (inResponse['read_only']) {
				this.$.notes.setDisabled(true);
				this.$.saveButton.setDisabled(true);
				this.$.undoButton.setDisabled(true);
				this.$.redoButton.setDisabled(true);
				this.$.timestampButton.setDisabled(true);
			}
			else {
				this.$.notes.setDisabled(false);
				this.$.saveButton.setDisabled(false);
				this.$.undoButton.setDisabled(false);
				this.$.redoButton.setDisabled(false);
				this.$.timestampButton.setDisabled(false);
			}

			// Init the undo/redo stack:
			this.textChanges.push(this.$.notes.get('value'));
			this.textChangesIndex = 0;
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
				' retrieve the family notes from the server. ' +
				'Please provide the following information to your database administrator: ' +
				'<br><br>' + 'status: ' + status + '<br>' + detail_msg);

			this.set('.xhrResponse', inSender.xhrResponse);
			return true;
		},

		/**
		 * When the family ID changes we need to pull fresh notes data from the server.
		 *
		 * @private
		 * @param oldVal
		 */
		selectedFamilyIDChanged: function (oldVal) {
			if (this.get('.selectedFamilyID') == 0) {
				this.$.notes.setValue(''); // shouldn't be visible with an id of 0, but just in case...
			}
			else {
				this.refreshData();
			}
		},

		/**
		 * Any input in the textbox starts the autosave timer and pushes the new content
		 * onto the textChanges stack for undo/redo operations.
		 *
		 * @param inSender
		 * @param inEvent
		 * @private
		 */
		goInput: function(inSender, inEvent) {

			this.set('.dirty', true);

			// Set the autosave job in motion:
			this.lastChanged = new Date();
			this.$.saveButton.setSrc('static/assets/save-small.png');
			this.saveJob = this.startJob('SaveNotesInput', enyo.bindSafely(this, 'goSaveChanges'),
				this.get('saveDelay'));

			// Handle undo/redo array:
			if (this.textChanges.length > 25) {
				this.textChanges.shift(); // remove the oldest change if we're already storing 25
			}
			this.textChanges.push(this.$.notes.get('value'));
			this.textChangesIndex = this.textChanges.length - 1;
		},

		/**
		 * Called by the autosave timer or by clicking the save button, this sends the saved data to the server.
		 *
		 * @param inSender
		 * @param inEvent
		 * @private
		 */
		goSaveChanges: function(inSender, inEvent) {

			var pk = this.get('.selectedFamilyID');

			var postBody = {
				notes: this.$.notes.getValue()
			};

			this.set('.api.token', this.get('.token'));
			this.set('.api.method', 'PATCH');
			var endpoint = 'api/v1/family/' + pk + '/notes/';
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

			this.set('.dirty', false);

			this.lastSaved = new Date();
			this.$.saveButton.setSrc('static/assets/save-gray-small.png');

			if (this.lastChanged < this.lastSaved) {
				if (this.get('showTimeStampTooltip')) {
					var saveString = this.get('baseSaveString');
					saveString += ' <em>(last saved: ' + this.lastSaved.toLocaleTimeString() + ')</em>';
					this.$.saveTooltip.set('content', saveString);
				}

				this.stopJob('SaveNotesInput');
			}


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
				' save changes to the notes. Please provide the following information to your database ' +
				'administrator:<br><br>' + 'status: ' + status + ' - ' + detail);

			this.set('.xhrResponse', inSender.xhrResponse);
		},

		/**
		 * Adds a line with the current username and timestamp:
		 *
		 * @param inSender
		 * @param inEvent
		 */
		goTimestamp: function(inSender, inEvent) {
            this.set('.dirty', true);
			var date = new Date();
			var stamp = '\n*** ' + this.get('username') + ' - ' + date.toLocaleString() + ' ***\n';
			var newVal = this.$.notes.get('value') + stamp;

			// If the new value is larger than the max length, trim it back:
			if (newVal.length > this.get('maxLength')) {
				newVal = newVal.substr(0, this.get('maxLength'));
			}

			this.$.notes.set('value', newVal);

			// Handle undo/redo array:
			if (this.textChanges.length > 25) {
				this.textChanges.shift(); // remove the oldest change if we're already storing 25
			}
			this.textChanges.push(this.$.notes.get('value'));
			this.textChangesIndex = this.textChanges.length - 1;

			// Set the autosave job in motion:
			this.lastChanged = new Date();
			this.$.saveButton.setSrc('static/assets/save-small.png');
			this.saveJob = this.startJob('SaveNotesInput', enyo.bindSafely(this, 'goSaveChanges'),
				this.get('saveDelay'));
		},

		/**
		 * Steps back one change in the textChanges stack and sets the autosave timer.
		 *
		 * @param inSender
		 * @param inEvent
		 * @private
		 */
		goUndo: function(inSender, inEvent) {
			if (this.textChangesIndex > 0) {
				this.textChangesIndex--;
				this.$.notes.set('value', this.textChanges[this.textChangesIndex]);

				// Set the autosave job in motion:
                this.set('.dirty', true);
				this.lastChanged = new Date();
				this.$.saveButton.setSrc('static/assets/save-small.png');
				this.saveJob = this.startJob('SaveNotesInput', enyo.bindSafely(this, 'goSaveChanges'),
					this.get('saveDelay'));

			} else {
				this.$.undoPopup.show();
			}
		},

		/**
		 * Steps forward one change in the textChanges stack and sets the autosave timer.
		 *
		 * @param inSender
		 * @param inEvent
		 * @private
		 */
		goRedo: function(inSender, inEvent) {
			if (this.textChangesIndex < this.textChanges.length - 1) {
				this.textChangesIndex++;
				this.$.notes.set('value', this.textChanges[this.textChangesIndex]);

				// Set the autosave job in motion:
                this.set('.dirty', true);
				this.lastChanged = new Date();
				this.$.saveButton.setSrc('static/assets/save-small.png');
				this.saveJob = this.startJob('SaveNotesInput', enyo.bindSafely(this, 'goSaveChanges'),
                    this.get('saveDelay'));
			} else {
				this.$.redoPopup.show();
			}
		},

		/**
		 * Fires when the published property `width` has changed, setting that CSS property on the
		 * groupbox container.
		 *
		 * @param inOldVal
		 * @private
		 */
		widthChanged: function(inOldVal) {
			this.$.container.applyStyle('width', this.get('width'));
		},

		/**
		 * Fires when the published property `height` has changed, setting that CSS property on the
		 * textrea control.
		 *
		 * @param inOldVal
		 * @private
		 */
		heightChanged: function(inOldVal) {
			this.$.notes.applyStyle('height', this.get('height'));
		},

		/**
		 * Fires when the published property `maxLength` has changed, setting that attribute on the
		 * textarea control.
		 *
		 * @param inOldVal
		 */
		maxLengthChanged: function(inOldVal) {
			this.$.notes.setAttribute('maxlength', this.get('maxLength'));
		},

		/**
		 * Fires when the published property `readOnly` has changed, setting that attribute on the
		 * textarea control.
		 *
		 * @param inOldVal
		 */
		readOnlyChanged: function(inOldVal) {
			this.$.notes.setAttribute('readOnly', this.get('readOnly'));
		},

		dirtyChanged: function (inOldVal) {
			this.doDirtyStateChanged({'dirty': this.get('.dirty')});
		}
 	});

}) (enyo, this)