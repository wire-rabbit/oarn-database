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

		name: 'oarn.EmailAddressList',

		kind: 'enyo.Control',

		published: {
			emailCollection: null // a collection instantiated in create
		},

		components: [
			{kind: 'onyx.Groupbox', style: 'width: 250px', components: [
				{kind: 'onyx.GroupboxHeader', classes: 'oarn-header oarn-new-row-header', components: [
					{content: 'Email Addresses', tag: 'span'},
					{
						name: 'newButton',
						kind: 'onyx.IconButton',
						style: 'float:right;',
						classes: 'oarn-icon-button',
						src: 'static/assets/blue-add.png',
						ontap: 'goAdd'
					},
					{
						name: 'saveButton',
						kind: 'onyx.IconButton',
						style: 'float:right;',
						classes: 'oarn-icon-button',
						src: 'static/assets/save-small.png',
						ontap: 'goSave'
					}

				]},
				{kind: 'Scroller', style: 'height: 100px', components: [
					{name: 'repeater', kind: 'enyo.Repeater',
						multiSelect: false, onSetupItem: 'setupItem',
						components: [
							{name: 'itemWrapper', style: 'width: 100%',
								components: [
									{kind: 'enyo.Input', name: 'emailAddress', style: 'padding-left: 3px; width: 80%',
										classes: 'oarn-control'},
									{name: 'deleteButton', kind: 'onyx.IconButton', classes: 'oarn-icon-button',
										src: 'static/assets/blue-delete.png', style: 'display: inline-block',
										ontap: 'goDelete'},
								]
							},

						]}
				]}
			]}

		],

		create: function (inSender, inEvent) {
			this.inherited(arguments);

			this.emailCollection = new oarn.EmailCollection();
			this.emailCollection.addListener('add', enyo.bindSafely(this, 'emailsAdded'));
		},

		emailsAdded: function (inSender, inEvent) {
			this.$.repeater.setCount(this.emailCollection.length);
		},

		setupItem: function (inSender, inEvent) {
			var item = inEvent.item;

			var readonly = this.emailCollection.at(inEvent.index).get('read_only');

			if (!readonly) {
				item.$.deleteButton.show();

			}
			else {

			}

		},

		goDelete: function (inSender, inEvent) {
			enyo.log('delete!');
		}
	});

	enyo.kind({
		name: 'oarn.EmailModel',

		kind: 'enyo.Model',

		attributes: {
			person_email_address_id: 0,
			email_address: '',
			email_type: '', // pulled from nested JSON >> ref_email_type
			read_only: false
		}
	});

	enyo.kind({
		name: 'oarn.EmailCollection',
		kind: 'enyo.Collection',
		model: 'oarn.EmailModel'
	})

})(enyo, this);