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
	 * Fires when a successful login results in a new token.
	 *
	 * @event oarn.LoginPopup#onTokenChanged
	 * @type {Object}
	 * @property {String} token - The token retrieved by the [LoginPopup]{@link oarn.LoginPopup}
	 * @public
	 */

	/**
	 * {@link oarn.LoginPopup} is an onyx.Popup control capable of processing login requests
	 * against the back-end API. If a new user token is acquired, that is passed up as
	 * onNewToken.
	 *
	 * @class oarn.LoginPopup
	 * @extends onyx.Popup
	 * @public
	 * @ui
	 */
	enyo.kind(
		/** @lends oarn.LoginPopup.prototype */{

		/**
		 * @private
 		 */
		name: 'oarn.LoginPopup',

		/**
		 * @private
 		 */
		kind: 'onyx.Popup',

		/**
		 * Set to oarn.API
		 * @private
 		 */
		api: null,

		/**
		 * @private
		 */
		username: '',

		/**
		 * @private
		 */
		centered: true,

		/**
		 * @private
		 */
		scrim: true,

		/**
		 * @private
		 */
		modal: true,

		/**
		 * @private
		 */
		autoDismiss: false,

		/**
		 * @private
		 */
		floating: true,

		/**
		 * @private
		 */
		style: 'width: 350px;',

		/**
		 * @private
 		 */
		events: {
			onTokenChanged: ''
		},

		/**
		 * @private
		 */
		components: [
			{kind: 'enyo.Signals', onkeydown: 'handleKeyDown'},
			{content: 'Username:'},
			{name: 'txtUsername', kind: 'onyx.Input', style: 'width: 95%; color: black;'},
			{tag: 'br'},
			{content: 'Password:'},
			{
				name: 'txtPassword', kind: 'onyx.Input', type: 'password', onchange: null,
				style: 'width: 95%; color: black;'
			},
			{tag: 'br'},
			{name: 'lblLoginResult', style: 'style: color: #33CC33; font-style:italic;'},
			{
				kind: 'onyx.Button', content: 'Login', classes: 'onyx-affirmative',
				style: 'display: block; margin-left:auto; margin-right:auto;', ontap: 'login'
			},
			{tag: 'table', components: [
				{tag: 'tr', components: [
					{tag: 'td', style: 'padding-right: 5px;', components: [
						{name: 'supportLink', kind: 'enyo.Anchor', title: 'Get Help',
						content: 'Support', href:'https://oarndb.org/support/',
						style: 'color: white; font-style:italic; font-size:smaller'}
					]},
					{tag: 'td', components: [
						{name: 'licenseLink', kind: 'enyo.Anchor', title: 'View License',
							content: 'License', href:'https://oarndb.org/license/',
							style: 'color: white; font-style:italic; font-size:smaller'}
					]}
				]}
			]},
			{
				name: 'fullScreenSpinner',
				kind: 'onyx.Popup',
				centered: true,
				floating: true,
				scrim: true,
				autoDismiss: false,
				components: [
					{kind: 'onyx.Spinner'}
				]
			}
		],

		/**
		 * @private
		 */
		create: function ()	{
			this.inherited(arguments);
			this.api = new oarn.API();
		},

		/**
		 * If the popup is showing, capture 'enter' key hits and act as if clicking 'login'.
		 * @private
		 * @param inSender
		 * @param inEvent
		 * @returns {boolean}
		 */
		handleKeyDown: function (inSender, inEvent) {
			if (this.showing) {
				if (inEvent.keyCode == 13) {
					this.login(inSender, inEvent);
				}
			}
			return false; // continue propagation
		},

		/**
		 * @private
		 */
		login: function (inSender, inEvent) {
			var creds = {
				'username': this.$.txtUsername.getValue(),
				'password': this.$.txtPassword.getValue()
			};
			this.api.postBody = creds;

			this.api.method = 'POST';

			var ajax = this.api.getAjaxObject('auth/login/');

			ajax.go();
			ajax.response(enyo.bindSafely(this, 'processLoginResponse'));
			ajax.error(enyo.bindSafely(this, 'processLoginError'));

			// Store the username (never the password) to pass up to the parent
			// control if login is successful:
			this.set('username', this.$.txtUsername.getValue());

			this.$.txtUsername.setValue(null);
			this.$.txtPassword.setValue(null);
		},

		/**
		 * @private
 		 * @param inRequest
		 * @param inResponse
		 */
		processLoginResponse: function (inRequest, inResponse) {
			this.doTokenChanged({'token':inResponse.auth_token, 'username': this.get('username')});
		},

		/**
		 * @private
 		 * @param inSender
		 * @param inResponse
		 */
		processLoginError: function (inSender, inResponse) {
			if (inSender.xhrResponse.status === 400) {
				var err = JSON.parse(inSender.xhrResponse.body);
				if (err.username !=null) {
					this.set('$.lblLoginResult.content', err.username);
				}
				if (err.password != null) {
					this.set('$.lblLoginResult.content', err.password);
				}
				if (err.non_field_errors != null) {
					this.set('$.lblLoginResult.content', err.non_field_errors);
				}
			}
		}
	});

})(enyo, this);
