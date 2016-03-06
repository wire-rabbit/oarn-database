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

		name: 'oarn.PopupFactory',

		kind: 'Control',

		published: {

			title: '',

			body: '',

			value: null,

			yesSelected: false,

			noSelected: false
		},

		events: {
			onPopupClosed: ''
		},

		components: [
			{name: 'info', kind: 'onyx.Popup', centered: true, modal: true, floating: true, autoDismiss: false,
				scrim: true, components: [
					{name: 'infoTitle', content:'', classes: 'oarn-popup-title'},
					{name: 'infoBody', kind: 'Scroller', style: 'width:300px', maxHeight:'200px', components: [
						{name: 'infoDetail', style: 'margin-top: 10px', allowHtml:true},
						{name: 'infoButtonsRow', style: 'text-align: center; padding-top:5px',
							components: [
								{kind: 'onyx.Button', content: 'OK',
									style: 'margin: 5px 5px 5px 5px', ontap: 'closeInfoPopup'}
							]},
					]}
				]
			},
			{name: 'simple', kind: 'onyx.Popup', centered: true, modal: true, floating: true, autoDismiss: false,
				scrim: true, components: [
						{name: 'simpleDetail', allowHtml:true, style: 'text-align: center; padding: 5px 5px 5px 5px'},
						{name: 'simpleButtonsRow', style: 'text-align: center; padding-top:5px',
							components: [
								{kind: 'onyx.Button', content: 'OK', allowHtml:true,
									style: 'margin: 5px 5px 5px 5px', ontap: 'closeSimplePopup'}
							]},
					]
			},
			{name: 'confirm', kind: 'onyx.Popup', centered: true, modal: true, scrim: true,
				floating: true, autoDismiss: false,
				components: [
					{name: 'confirmTitle', content:'', classes: 'oarn-popup-title'},
					{name: 'confirmBody', kind: 'Scroller', style: 'width:300px', maxHeight:'200px', components: [
						{name: 'confirmDetail', style: 'margin-top: 10px', allowHtml:true},
						{name: 'confirmButtonsRow', style: 'text-align: center; padding-top:5px',
							components: [
								{kind: 'onyx.Button', classes: 'onyx-affirmative', content: 'Yes',
									style: 'margin: 5px 5px 5px 5px', ontap: 'confirmYes'},
								{kind: 'onyx.Button', classes: 'onyx-negative', content: 'No',
									style: 'margin: 5px 5px 5px 5px', ontap: 'confirmNo'},
							]},
					]}
				]
			},
		],

		bindings: [
			{from: '.title', to: '.$.infoTitle.content'},
			{from: '.body', to: '.$.infoDetail.content'},

			{from: '.body', to: '.$.simpleDetail.content'},

			{from: '.title', to: '.$.confirmTitle.content'},
			{from: '.body', to: '.$.confirmDetail.content'}
		],

		showInfo: function (title, body) {
			this.set('.title', title);
			this.set('.body', body);
			this.$.info.show();
		},

		showSimple: function(body) {
			this.set('.title', '');
			this.set('.body', body);
			this.$.simple.show();
		},

		showConfirm: function(title, body) {
			this.set('.title', title);
			this.set('.body', body);
			this.$.confirm.show();
		},

		closeInfoPopup: function (inSender, inEvent) {
			this.$.info.hide();
			this.doPopupClosed();
		},

		closeSimplePopup: function (inSender, inEvent) {
			this.$.simple.hide();
			this.doPopupClosed();
		},

		confirmYes: function (inSender, inEvent) {
			this.set('.yesSelected', true);
			this.set('.noSelected', false);
			this.$.confirm.hide();
			this.doPopupClosed({'confirmed': true});
		},

		confirmNo: function (inSender, inEvent) {
			this.set('.yesSelected', false);
			this.set('.noSelected', true);
			this.$.confirm.hide();
			this.doPopupClosed({'confirmed': false});
		}

	});

})(enyo, this);