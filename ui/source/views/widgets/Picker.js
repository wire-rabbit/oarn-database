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
	 * {@link oarn.Picker} is a dynamically generated 
	 */
	enyo.kind({

		name: 'oarn.Picker',

		kind: 'enyo.Control',

		/**
		 * Used to prevent Ajax updates from being set when only local values are
		 * being manipulated.
		 *
		 * @private
		 * @default false
		 */
		isLocked: false,

		/**
		 * Stores a reference to the most recently selected item from the list.
		 *
		 * @private
		 * @default null
		 */
		lastSelected: null,

		published: {
			token: null,

			api: null,

			endpoint: '',

			/**
			 * Sets the name of the primary key field, e.g., 'ref_gender_id'
			 *
			 * @type {String}
			 * @default ''
			 * @public
			 */
			primaryKeyField: '',

			/**
			 * Sets the width of the groupbox, as a CSS value for "width".
			 *
			 * @type {String}
			 * @default '300px'
			 * @public
			 */
			width: '300px',

			/**
			 * Sets the header text for the groupbox.
			 *
			 * @type {String}
			 * @default ''
			 * @public
			 */
			headerText: '',

			/**
			 * Sets the text for the pickerbutton
			 *
			 * @type {String}
			 * @default ''
			 * @public
			 */
			pickerButtonText: '',

			/**
			 * Determines whether the control should be read-only.
			 *
			 * @type {Boolean}
			 * @default false
			 * @public
			 */
			readOnly: false
		},

		components: [
			{name: 'container', kind: 'onyx.Groupbox', components: [
				{name: 'pickerHeader', kind: 'onyx.GroupboxHeader', classes: 'oarn-header', components: [
					{name: 'boxTitle', content: '', tag: 'span'},
					{name: 'btnInfo', kind: "onyx.IconButton", classes: 'oarn-icon-button',
						src: "static/assets/info-small.png",
						ontap: "goTimestamp", style: 'float: right'},
					{name: 'btnWarning', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
						src: 'static/assets/warning-small.png', style: 'float: right'}
				]},

				{kind: 'onyx.PickerDecorator', onChange: 'selectionChanged', components: [
					{name: 'headerButton', kind: 'onyx.PickerButton', content: '', style:'width:100%'},
					{name: 'picker', kind: 'onyx.Picker', components: []}
				]},


			]},
			{name: "readOnlyPopup", kind: "onyx.Popup", modal: false, floating: true, centered:true,
				content: "This menu is read-only."},

		],

		create: function () {
			this.inherited(arguments);
			//this.$.btnInfo.removeClass('onyx-icon');
			//this.$.btnInfo.removeClass('onyx-icon-button');
			//this.$.btnInfo.addClass('oarn-icon');
			//this.$.btnInfo.addClass('oarn-icon-button');


			this.$.container.applyStyle('width', this.get('width'));
			//this.set('$.pickerHeader.content', this.get('headerText'));
			this.set('$.boxTitle.content', this.get('headerText'));
			this.set('$.headerButton.content', this.get('pickerButtonText'));
		},

		loadData: function () {
			this.api = new oarn.API();
			var ajax = this.api.getAjaxObject(this.endpoint);
			ajax.headers['Authorization'] = 'Token ' + this.get('token');

			ajax.go();
			ajax.response(enyo.bindSafely(this, 'processResponse'));
			ajax.error(enyo.bindSafely(this, 'processError'));

			this.render();
		},

		setSelectedID: function (id) {
			this.set('isLocked', true); // prevent a selection from sending a PUT request
			enyo.log('setSelectedID:');
			for (var i = 1; i <= this.$.picker.controls.length; i++) {
				if (this.$.picker.controls[i] !== undefined) {
					if (this.$.picker.controls[i].selection_id == id) {
						enyo.log(i + ': ' + this.$.picker.controls[i].content);
						this.set('lastSelected', this.$.picker.controls[i]);
						this.$.picker.setSelected(this.$.picker.controls[i]);
						this.set('$.headerButton.content', this.$.picker.controls[i].content);
					}
				}
			}
			this.set('isLocked', false); // further changes result in a PUT request.
		},

		processResponse: function (inRequest, inResponse) {
			var data = new enyo.Collection();
			data.add(inResponse);
			var index = 0;

			this.$.picker.destroyClientControls();
			for (i = 0; i < data.length; i++) {
				this.$.picker.createComponent({
					content: data.at(i).get('description'),
					selection_id: data.at(i).get(this.get('primaryKeyField'))
				});
			}
		},

		processError: function (inSender, inEvent) {
			var x = new enyo.Control();
			x.content = 'Failure';
			this.$.picker.addControl(x);
		},

		selectionChanged: function (inSender, inEvent) {
			if (this.get('isLocked') == false) {
				if (this.get('readOnly') === true) {
					if (this.get('lastSelected') === null) {
						enyo.log('lastSelected is null');
						this.set('$.headerButton.content', this.get('pickerButtonText'));
					} else {
						enyo.log('lastSelected is not null');
						this.$.picker.setSelected(this.get('lastSelected'));
					}
					this.$.readOnlyPopup.show();
					return;
				}
				this.set('lastSelected', inEvent.selected)
				enyo.log('content: ' + inEvent.content);
				enyo.log('selected: ' + inEvent.selected.selection_id);
			}
		}


	})

})(enyo, this);